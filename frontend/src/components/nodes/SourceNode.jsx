import React, { memo, useEffect, useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import axios from 'axios';

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default to CSV if not specified
  const requiredType = data.fileType || 'CSV';

  // Define border color based on type
  const borderColor = requiredType === 'JSON' ? '#fbbf24' : (requiredType === 'Excel' ? '#16a34a' : '#10b981');
  const icon = requiredType === 'JSON' ? '{}' : (requiredType === 'Excel' ? '📊' : '📄');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/datasources', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // --- DYNAMIC FILTERING LOGIC ---
        const filteredFiles = res.data.filter(f => {
            const name = f.name.toLowerCase();
            const type = f.type ? f.type.toUpperCase() : '';

            if (requiredType === 'CSV') {
                return type === 'CSV' || name.endsWith('.csv');
            }
            if (requiredType === 'JSON') {
                return type === 'JSON' || name.endsWith('.json');
            }
            if (requiredType === 'Excel') {
                return type === 'XLSX' || type === 'XLS' || name.endsWith('.xlsx') || name.endsWith('.xls');
            }
            return true;
        });
        
        setFiles(filteredFiles);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load files", err);
        setLoading(false);
      }
    };
    fetchFiles();
  }, [requiredType]); // Re-run if type changes

  const onChange = useCallback((evt) => {
    const selectedFile = evt.target.value;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, filename: selectedFile, label: selectedFile } };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onDelete = (evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div style={{ 
      background: '#18181b', 
      border: `1px solid ${borderColor}`, 
      borderRadius: '8px', 
      padding: '15px', 
      minWidth: '200px',
      color: 'white',
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
    }}>
      <button 
        className="nodrag" 
        onClick={onDelete} 
        style={{ 
          position: 'absolute', top: '-10px', right: '-10px', 
          background: '#ef4444', color: 'white', border: '3px solid #0f1115', 
          borderRadius: '50%', width: '24px', height: '24px', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '12px', fontWeight: 'bold' 
        }}
      >✕</button>

      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        style={{ background: '#555', width: '8px', height: '8px' }} 
      />
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: borderColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span> Source: {requiredType}
      </div>
      
      <div className="nodrag">
        {loading ? (
           <span style={{ fontSize: '12px', color: '#666' }}>Loading...</span>
        ) : (
            <select 
                onChange={onChange} 
                value={data.filename || ""}
                style={{
                    width: '100%',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: 'white',
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                <option value="" disabled>-- Select {requiredType} File --</option>
                {files.length === 0 ? (
                    <option disabled>No {requiredType} files found</option>
                ) : (
                    files.map(f => (
                        <option key={f.id} value={f.name}>
                            {f.name}
                        </option>
                    ))
                )}
            </select>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        style={{ background: '#555', width: '8px', height: '8px' }} 
      />
    </div>
  );
});