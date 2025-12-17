import os
import pandas as pd
import sqlite3
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from .models import ProcessedFile
from datetime import datetime

def get_size_format(b, factor=1024, suffix="B"):
    for unit in ["", "K", "M", "G", "T", "P"]:
        if b < factor: return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2f} Y{suffix}"

def safe_convert(val):
    try: return int(val)
    except:
        try: return float(val)
        except: return val

class PipelineEngine:
    def __init__(self, nodes, edges, user, base_dir, db_session):
        self.nodes = {n['id']: n for n in nodes}
        self.adj_list = {n['id']: [] for n in nodes}
        self.in_degree = {n['id']: 0 for n in nodes}
        self.data_store = {}
        self.logs = []
        self.db = db_session
        self.user = user
        self.base_dir = base_dir
        self.processed_bytes = 0
        
        # Paths
        self.uploads_dir = os.path.join(base_dir, '..', 'uploads')
        self.processed_dir = os.path.join(base_dir, '..', 'processed')
        if not os.path.exists(self.processed_dir): os.makedirs(self.processed_dir)

        # Build Graph
        for edge in edges:
            self.adj_list[edge['source']].append(edge['target'])
            self.in_degree[edge['target']] += 1

    def run(self):
        queue = [nid for nid, count in self.in_degree.items() if count == 0]
        
        while queue:
            current_id = queue.pop(0)
            node = self.nodes[current_id]
            
            try:
                self.process_node(current_id, node)
            except Exception as e:
                raise Exception(f"Node '{node['data'].get('label')}' Error: {str(e)}")

            if current_id in self.adj_list:
                for child in self.adj_list[current_id]:
                    queue.append(child)
        
        # Update user stats
        if self.processed_bytes > 0:
            self.user.total_processed_bytes += self.processed_bytes
            self.db.commit()
            
        return self.logs

    def get_parent_df(self, current_id):
        # Find parent node ID
        for nid, neighbors in self.adj_list.items():
            if current_id in neighbors:
                return self.data_store.get(nid)
        return None

    def process_node(self, node_id, node):
        node_type = node['type']
        data = node['data']
        df = None

        # --- SOURCES ---
        if node_type.startswith('source_'):
            filename = data.get('filename')
            if not filename: raise ValueError("No file selected")
            path = os.path.join(self.uploads_dir, filename)
            
            if filename.endswith('.csv'): df = pd.read_csv(path)
            elif filename.endswith('.json'): df = pd.read_json(path)
            elif filename.endswith('.xlsx'): df = pd.read_excel(path)
            self.logs.append(f"Loaded {filename}: {len(df)} rows")

        # --- TRANSFORMATIONS ---
        else:
            df = self.get_parent_df(node_id)
            if df is None and not node_type.startswith('dest'): raise ValueError("Disconnected node")

            if node_type == 'filterNode':
                col, op, val = data.get('column'), data.get('condition', '>'), safe_convert(data.get('value'))
                if col in df.columns:
                    if op == '>': df = df[df[col] > val]
                    elif op == '<': df = df[df[col] < val]
                    elif op == '==': df = df[df[col] == val]
                    self.logs.append(f"Filtered {col} {op} {val}")

            elif node_type == 'trans_sort':
                df = df.sort_values(by=data.get('column'), ascending=data.get('order') == 'true')
                
            elif node_type == 'trans_limit':
                df = df.head(int(data.get('limit', 100)))

            elif node_type == 'vis_chart':
                self.generate_chart(df, data)
                df = df # Pass through

            elif node_type.startswith('dest_'):
                self.save_destination(df, node_type, data)
                return # Destinations are endpoints

        # Store result for children
        if df is not None:
            self.data_store[node_id] = df

    def generate_chart(self, df, data):
        output_name = data.get('outputName', 'chart') + '.png'
        save_path = os.path.join(self.processed_dir, output_name)
        
        plt.figure(figsize=(10, 6))
        x, y = data.get('x_col'), data.get('y_col')
        
        if data.get('chartType') == 'bar': plt.bar(df[x], df[y])
        elif data.get('chartType') == 'scatter': plt.scatter(df[x], df[y])
        
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
        
        self.save_db_record(output_name, 'Image', save_path)
        self.logs.append(f"Generated chart: {output_name}")

    def save_destination(self, df, type_key, data):
        name = data.get('outputName', 'output')
        ftype = 'UNKNOWN'
        path = ""

        if type_key == 'dest_csv':
            path = os.path.join(self.processed_dir, name + '.csv')
            df.to_csv(path, index=False)
            ftype = 'CSV'
        elif type_key == 'dest_json':
            path = os.path.join(self.processed_dir, name + '.json')
            df.to_json(path, orient='records')
            ftype = 'JSON'
        
        if path:
            self.save_db_record(os.path.basename(path), ftype, path)
            self.logs.append(f"Saved to {os.path.basename(path)}")

    def save_db_record(self, filename, ftype, path):
        if os.path.exists(path):
            size = os.path.getsize(path)
            self.processed_bytes += size
            new_file = ProcessedFile(
                filename=filename, file_type=ftype,
                file_size_bytes=size, file_size_display=get_size_format(size),
                filepath=path, user_id=self.user.id
            )
            self.db.add(new_file)
            self.db.commit()