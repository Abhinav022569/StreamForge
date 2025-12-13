import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import axios from 'axios';
import '../../App.css'; // Import shared styles

export default memo(({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch available files from backend
  useEffect(() => {
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:5000/datasources', {
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

  // 2. Update node data when selection changes
  const onChange = (evt) => {
    const selectedFile = evt.target.value;
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { 
                ...node.data, 
                filename: selectedFile  // <--- Backend needs this!
            } 
          };
        }
        return node;
      })
    );
  };

  return (
    <div className={`pipeline-node node-csv`}>
      {/* Hidden input handle for layout consistency */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="node-handle"
        style={{ visibility: 'hidden' }} 
      />
      
      <div className="node-header text-csv">
        <span style={{ fontSize: '16px' }}>📄</span> {data.label || 'Source'}
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
            <p style={{ fontSize: '10px', color: '#fbbf24', marginTop: '5px', marginBottom: 0 }}>
                ⚠ Please select a file
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