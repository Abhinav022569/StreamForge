import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FileText, FileJson, FileSpreadsheet, File } from 'lucide-react';
import axios from 'axios';
import '../../App.css'; 

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements } = useReactFlow();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch available files from backend
  useEffect(() => {
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://192.168.1.12:5000/datasources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(res.data);
        } catch (err) {
            console.error("Failed to load files", err);
        } finally {
            setLoading(false);
        }
    };
    fetchFiles();
  }, []);

  // 2. Determine Styling based on Filename Extension
  const nodeStyle = useMemo(() => {
    const filename = data.filename || '';
    const ext = filename.split('.').pop().toLowerCase();

    // Match colors with Sidebar.jsx
    switch (ext) {
        case 'csv': 
            return { color: '#10b981', icon: <FileText size={16} />, typeLabel: 'CSV' };
        case 'json': 
            return { color: '#fbbf24', icon: <FileJson size={16} />, typeLabel: 'JSON' };
        case 'xlsx': 
        case 'xls': 
            return { color: '#16a34a', icon: <FileSpreadsheet size={16} />, typeLabel: 'Excel' };
        default: 
            return { color: '#64748b', icon: <File size={16} />, typeLabel: 'File' }; // Default Gray
    }
  }, [data.filename]);

  // 3. Update Handler
  const onChange = (evt) => {
    const selectedFile = evt.target.value;
    
    // Notify parent (PipelineBuilder) to update the unified state
    if (data.onUpdate) {
        data.onUpdate(id, { filename: selectedFile });
    } else {
        console.warn("onUpdate prop missing in SourceNode");
    }
  };

  // 4. Delete Handler
  const onDelete = useCallback((evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div 
        className="pipeline-node"
        style={{ 
            borderLeft: `4px solid ${nodeStyle.color}`, // Dynamic Color Border
            transition: 'all 0.3s ease' 
        }}
    >
      
      {/* Delete Button */}
      <button className="node-delete-btn nodrag" onClick={onDelete}>✕</button>

      {/* Hidden input handle for layout consistency */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="node-handle"
        style={{ visibility: 'hidden' }} 
      />
      
      {/* Dynamic Header */}
      <div className="node-header" style={{ color: nodeStyle.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {nodeStyle.icon}
        <span style={{ fontSize: '13px', fontWeight: '600' }}>
            {data.label || `${nodeStyle.typeLabel} Source`}
        </span>
      </div>

      <div className="node-body nodrag">
        <label className="node-label">SELECT FILE</label>
        <select 
            className="select-field" 
            onChange={onChange} 
            value={data.filename || ''}
            style={{ width: '100%' }}
        >
            <option value="" disabled>-- Select File --</option>
            {loading ? (
                <option disabled>Loading...</option>
            ) : (
                files.map(f => (
                    <option key={f.id} value={f.name}>
                        {f.name} ({f.size})
                    </option>
                ))
            )}
        </select>
        
        {!data.filename && (
            <p style={{ fontSize: '10px', color: '#fbbf24', marginTop: '5px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠</span> Select a file to configure
            </p>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="node-handle"
      />
    </div>
  );
});