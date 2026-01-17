import os
import pandas as pd
import numpy as np  # Required for handling Infinity/NaN
import sqlite3
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from .models import ProcessedFile
from datetime import datetime

def get_size_format(b, factor=1024, suffix="B"):
    """Converts bytes to human readable format"""
    for unit in ["", "K", "M", "G", "T", "P"]:
        if b < factor:
            return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2f} Y{suffix}"

def safe_convert(val):
    """Safely converts strings to int/float"""
    try:
        return int(val)
    except:
        try:
            return float(val)
        except:
            return val

class PipelineEngine:
    def __init__(self, nodes, edges, user, base_dir, db_session, preview_mode=False, pipeline_id=None):
        self.nodes = {n['id']: n for n in nodes}
        self.adj_list = {n['id']: [] for n in nodes}
        self.in_degree = {n['id']: 0 for n in nodes}
        self.data_store = {}
        # Initialize logs with start message
        self.logs = [f"Pipeline initialized with {len(nodes)} nodes."]
        self.db = db_session
        self.user = user
        self.base_dir = base_dir
        self.processed_bytes = 0
        self.preview_mode = preview_mode
        self.pipeline_id = pipeline_id # NEW: Track which pipeline is running
        
        # Paths
        self.uploads_dir = os.path.join(base_dir, '..', 'uploads')
        self.processed_dir = os.path.join(base_dir, '..', 'processed')
        if not os.path.exists(self.processed_dir):
            os.makedirs(self.processed_dir)

        # Build Graph (Adjacency List)
        for edge in edges:
            if edge['source'] in self.adj_list:
                self.adj_list[edge['source']].append(edge['target'])
                self.in_degree[edge['target']] += 1

    def run(self):
        """Standard Full Pipeline Run"""
        # Topological sort / Queue based execution
        queue = [nid for nid, count in self.in_degree.items() if count == 0]
        
        if not queue:
            self.logs.append("Error: No starting nodes found (circular dependency or empty graph).")
            return self.logs

        # Use Kahn's Algorithm (Topological Sort)
        while queue:
            current_id = queue.pop(0)
            if current_id not in self.nodes: continue
            
            node = self.nodes[current_id]
            
            try:
                self.logs.append(f"Processing node: {node['data'].get('label', node['type'])}")
                self.process_node(current_id, node)
            except Exception as e:
                error_msg = f"ERROR in {node['data'].get('label', 'Node')}: {str(e)}"
                self.logs.append(error_msg)
                raise Exception(error_msg)

            if current_id in self.adj_list:
                for child in self.adj_list[current_id]:
                    self.in_degree[child] -= 1
                    if self.in_degree[child] == 0:
                         queue.append(child)
        
        if self.processed_bytes > 0 and not self.preview_mode:
            self.user.total_processed_bytes += self.processed_bytes
            self.db.commit()
            
        self.logs.append("Pipeline execution completed successfully.")
        return self.logs

    def run_preview(self, target_node_id):
        """Runs the pipeline ONLY for the ancestors of target_node_id (BFS/Partial Run)"""
        if target_node_id not in self.nodes:
            return {"error": "Target node not found", "logs": self.logs}

        # 1. Identify Ancestors (Dependency Chain)
        ancestors = set()
        to_visit = [target_node_id]
        
        processed_visit = set()
        while to_visit:
            curr = to_visit.pop()
            if curr in processed_visit: continue
            processed_visit.add(curr)
            ancestors.add(curr)
            
            for src, targets in self.adj_list.items():
                if curr in targets:
                    if src not in ancestors:
                        to_visit.append(src)

        # 2. Execution Loop (Topological Sort)
        # We COPY in_degree to avoid corrupting it for future calls if instance is reused (defensive)
        local_in_degree = self.in_degree.copy()
        queue = [nid for nid, count in local_in_degree.items() if count == 0]
        
        while queue:
            current_id = queue.pop(0)
            
            # Only process if it affects our target
            if current_id in ancestors:
                if current_id in self.nodes:
                    try:
                        self.logs.append(f"Preview: Processing {self.nodes[current_id]['data'].get('label', current_id)}")
                        self.process_node(current_id, self.nodes[current_id])
                    except Exception as e:
                        return {"error": str(e), "logs": self.logs}
            
            # Continue traversal to unlock children
            if current_id in self.adj_list:
                for child in self.adj_list[current_id]:
                     local_in_degree[child] -= 1
                     if local_in_degree[child] == 0:
                         queue.append(child)

        # 3. Retrieve Result
        if target_node_id in self.data_store:
            df = self.data_store[target_node_id]
            
            # --- CRITICAL FIX: SANITIZE DATA FOR JSON ---
            # Convert Infinity to NaN, then all NaN to None (null in JSON)
            # This prevents backend crashes when calculations produce Infinity
            df_clean = df.replace([np.inf, -np.inf], np.nan)
            
            # Take a small sample for preview
            records = df_clean.head(100).where(pd.notnull(df_clean), None).to_dict(orient='records')
            
            return {"data": records, "columns": list(df.columns), "logs": self.logs}
        else:
            return {"error": "Node produced no data. Check logs.", "logs": self.logs}

    def get_parent_df(self, current_id):
        for nid, neighbors in self.adj_list.items():
            if current_id in neighbors:
                # Return a COPY to ensure subsequent nodes don't mutate stored data
                parent_df = self.data_store.get(nid)
                return parent_df.copy() if parent_df is not None else None
        return None

    def get_join_parents(self, current_id):
        parents = []
        for nid, neighbors in self.adj_list.items():
            if current_id in neighbors:
                parent_df = self.data_store.get(nid)
                if parent_df is not None:
                    parents.append(parent_df.copy()) # Copy here too
                else:
                    parents.append(None)
        return parents

    def process_node(self, node_id, node):
        node_type = node['type']
        data = node['data']
        df = None

        # --- SOURCES ---
        if node_type.startswith('source_'):
            filename = data.get('filename')
            if not filename: 
                # Attempt to use label if filename is missing (fallback)
                filename = data.get('label')
                # Simple check if label looks like a file
                if not filename or '.' not in filename:
                    raise ValueError("No file selected")
            
            path = os.path.join(self.uploads_dir, filename)
            if not os.path.exists(path):
                raise FileNotFoundError(f"File {filename} not found")
            
            nrows_arg = 50 if self.preview_mode else None
            
            if filename.lower().endswith('.csv'): 
                df = pd.read_csv(path, nrows=nrows_arg)
            elif filename.lower().endswith('.json'): 
                df = pd.read_json(path)
                if self.preview_mode: df = df.head(50)
            elif filename.lower().endswith(('.xls', '.xlsx')): 
                df = pd.read_excel(path, nrows=nrows_arg)
            
            if df is not None:
                self.logs.append(f"Loaded {filename}: {len(df)} rows {'(Preview)' if self.preview_mode else ''}")

        # --- TRANSFORMATIONS ---
        else:
            if node_type == 'trans_join':
                dfs = self.get_join_parents(node_id)
                if len(dfs) < 2 or any(d is None for d in dfs): 
                     raise ValueError("Join node requires 2 valid inputs.")
                df = self.process_join(dfs[0], dfs[1], data)
            else:
                df = self.get_parent_df(node_id)
                if df is None: 
                    self.logs.append(f"Skipping {node_type}: No input data found.")
                    return 

                # --- CLEANING & TRANSFORMATION LOGIC ---
                if node_type == 'filterNode':
                    df = self.process_filter(df, data)
                elif node_type == 'trans_sort':
                    df = df.sort_values(by=data.get('column'), ascending=data.get('order') == 'true')
                    self.logs.append(f"Sorted by {data.get('column')}")
                elif node_type == 'trans_limit':
                    limit = int(data.get('limit', 100))
                    df = df.head(limit)
                    self.logs.append(f"Limited to {limit} rows")
                elif node_type == 'trans_select':
                    cols = [c.strip() for c in data.get('columns', '').split(',') if c.strip() in df.columns]
                    if cols: df = df[cols]
                elif node_type == 'trans_rename':
                    old, new = data.get('oldName'), data.get('newName')
                    if old in df.columns: df = df.rename(columns={old: new})
                elif node_type == 'trans_dedupe':
                    before = len(df)
                    df = df.drop_duplicates()
                    self.logs.append(f"Removed {before - len(df)} duplicates")
                elif node_type == 'trans_fillna':
                    col = data.get('column')
                    val = safe_convert(data.get('value'))
                    if col and col in df.columns: df[col] = df[col].fillna(val)
                    else: df = df.fillna(val)
                elif node_type == 'trans_group':
                    df = self.process_group(df, data)
                elif node_type == 'trans_calc':
                    df = self.process_calc(df, data)
                
                # --- NEW NODES LOGIC ---
                elif node_type == 'trans_cast':
                    col = data.get('column')
                    tgt = data.get('targetType', 'string')
                    if col in df.columns:
                        if tgt == 'int': df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                        elif tgt == 'float': df[col] = pd.to_numeric(df[col], errors='coerce')
                        elif tgt == 'string': df[col] = df[col].astype(str)
                        elif tgt == 'date': df[col] = pd.to_datetime(df[col], errors='coerce')
                        self.logs.append(f"Casted {col} to {tgt}")
                        
                elif node_type == 'trans_string':
                    col = data.get('column')
                    op = data.get('operation', 'upper')
                    if col in df.columns:
                        if op == 'upper': df[col] = df[col].astype(str).str.upper()
                        elif op == 'lower': df[col] = df[col].astype(str).str.lower()
                        elif op == 'strip': df[col] = df[col].astype(str).str.strip()
                        elif op == 'title': df[col] = df[col].astype(str).str.title()
                        self.logs.append(f"String op {op} on {col}")
                        
                elif node_type == 'trans_constant':
                    col = data.get('colName')
                    val = safe_convert(data.get('value'))
                    if col:
                        df[col] = val
                        self.logs.append(f"Added constant col {col}")

                # --- CUSTOM PYTHON NODE ---
                elif node_type == 'trans_python':
                    code = data.get('code', '')
                    if code:
                        try:
                            # Create a restricted local scope with safe libraries
                            # 'df' is the main dataframe being passed through
                            local_scope = {
                                'df': df, 
                                'pd': pd, 
                                'np': np,
                                'math': __import__('math'),
                                'datetime': __import__('datetime')
                            }
                            
                            # EXECUTE THE USER CODE
                            # We use exec() here. In a true enterprise environment, this should be sandboxxed 
                            # (e.g., restricted python or containerized) but for a BCA project exec is acceptable 
                            # if documented as "Developer Mode".
                            exec(code, {}, local_scope)
                            
                            # Retrieve the modified df. User code must modify 'df' in place or reassign it.
                            if 'df' in local_scope and isinstance(local_scope['df'], pd.DataFrame):
                                df = local_scope['df']
                                self.logs.append(f"Executed custom Python script")
                            else:
                                raise ValueError("Python script must maintain a 'df' pandas DataFrame variable.")
                                
                        except Exception as e:
                            # Catch syntax errors or runtime errors in user code
                            raise ValueError(f"Python Script Execution Error: {str(e)}")

                # --- VISUALIZATION & OUTPUTS ---
                elif node_type == 'vis_chart':
                    if not self.preview_mode:
                        self.generate_chart(df, data)
                elif node_type.startswith('dest_'):
                    if not self.preview_mode:
                        self.save_destination(df, node_type, data)
                    return 

        if df is not None:
            self.data_store[node_id] = df

    def process_filter(self, df, data):
        col, op, val = data.get('column'), data.get('condition', '>'), safe_convert(data.get('value'))
        if col in df.columns:
            if op == '>': df = df[df[col] > val]
            elif op == '<': df = df[df[col] < val]
            elif op == '==': df = df[df[col] == val]
            elif op == '!=': df = df[df[col] != val]
            self.logs.append(f"Filtered {col} {op} {val}: {len(df)} rows remaining")
        return df

    def process_join(self, df1, df2, data):
        key = data.get('key')
        how = data.get('how', 'inner')
        if key in df1.columns and key in df2.columns:
            res = pd.merge(df1, df2, on=key, how=how)
            self.logs.append(f"Joined datasets on {key} ({how}): {len(res)} rows")
            return res
        else:
            raise ValueError(f"Join key '{key}' not found in one of the inputs. Columns available: {list(df1.columns)} | {list(df2.columns)}")

    def process_group(self, df, data):
        g_col, t_col, op = data.get('groupCol'), data.get('targetCol'), data.get('operation', 'sum')
        if g_col in df.columns and t_col in df.columns:
            grouped = df.groupby(g_col)[t_col]
            if op == 'sum': df = grouped.sum().reset_index()
            elif op == 'mean': df = grouped.mean().reset_index()
            elif op == 'count': df = grouped.count().reset_index()
            elif op == 'max': df = grouped.max().reset_index()
            elif op == 'min': df = grouped.min().reset_index()
            self.logs.append(f"Grouped by {g_col}")
        return df

    def process_calc(self, df, data):
        cA, cB, op, newC = data.get('colA'), data.get('colB'), data.get('op'), data.get('newCol')
        if cA in df.columns and cB in df.columns:
            vA = pd.to_numeric(df[cA], errors='coerce').fillna(0)
            vB = pd.to_numeric(df[cB], errors='coerce').fillna(0)
            if op == '+': df[newC] = vA + vB
            elif op == '-': df[newC] = vA - vB
            elif op == '*': df[newC] = vA * vB
            elif op == '/': df[newC] = vA / vB
            self.logs.append(f"Calculated {newC}")
        return df

    def generate_chart(self, df, data):
        output_name = data.get('outputName', 'chart')
        if not output_name.endswith('.png'): output_name += '.png'
        save_path = os.path.join(self.processed_dir, output_name)
        
        plt.figure(figsize=(10, 6))
        x, y = data.get('x_col'), data.get('y_col')
        ctype = data.get('chartType', 'bar')
        
        try:
            if x in df.columns:
                if ctype == 'hist':
                    df[x].hist()
                elif y in df.columns:
                    if ctype == 'bar': plt.bar(df[x], df[y])
                    elif ctype == 'line': plt.plot(df[x], df[y])
                    elif ctype == 'scatter': plt.scatter(df[x], df[y])
                    elif ctype == 'pie': plt.pie(df[y], labels=df[x])
                
                plt.title(f"{ctype} chart")
                plt.tight_layout()
                plt.savefig(save_path)
                plt.close()
                
                self.save_db_record(output_name, 'Image', save_path)
                self.logs.append(f"Generated chart: {output_name}")
        except Exception as e:
            plt.close()
            raise ValueError(f"Chart generation failed: {str(e)}")

    def save_destination(self, df, type_key, data):
        name = data.get('outputName', 'output')
        ftype = 'UNKNOWN'
        path = ""

        if type_key == 'dest_csv':
            if not name.endswith('.csv'): name += '.csv'
            path = os.path.join(self.processed_dir, name)
            df.to_csv(path, index=False)
            ftype = 'CSV'
        elif type_key == 'dest_json':
            if not name.endswith('.json'): name += '.json'
            path = os.path.join(self.processed_dir, name)
            df.to_json(path, orient='records')
            ftype = 'JSON'
        elif type_key == 'dest_excel':
            if not name.endswith('.xlsx'): name += '.xlsx'
            path = os.path.join(self.processed_dir, name)
            df.to_excel(path, index=False)
            ftype = 'Excel'
        elif type_key == 'dest_db':
            if not name.endswith('.db'): name += '.db'
            path = os.path.join(self.processed_dir, name)
            with sqlite3.connect(path) as conn:
                df.to_sql('export_data', conn, if_exists='replace', index=False)
            ftype = 'Database'
        
        if path and os.path.exists(path):
            # NEW: Pass df for Metadata extraction
            self.save_db_record(name, ftype, path, df)
            self.logs.append(f"Saved output to {name}")

    def save_db_record(self, filename, ftype, path, df=None):
        size = os.path.getsize(path)
        self.processed_bytes += size
        
        # NEW: Extract Metadata
        row_count = 0
        columns_json = "{}"
        if df is not None and not df.empty:
            row_count = len(df)
            # Create dict: {"col_name": "dtype_string"}
            col_map = {col: str(dtype) for col, dtype in df.dtypes.items()}
            columns_json = json.dumps(col_map)

        new_file = ProcessedFile(
            filename=filename, 
            file_type=ftype,
            file_size_bytes=size, 
            file_size_display=get_size_format(size),
            filepath=path, 
            user_id=self.user.id,
            # NEW: Store metadata & lineage
            row_count=row_count,
            columns=columns_json,
            source_pipeline_id=self.pipeline_id
        )
        self.db.add(new_file)
        self.db.commit()