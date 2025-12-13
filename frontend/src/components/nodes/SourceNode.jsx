import React, { memo, useEffect, useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import axios from 'axios';
import '../../App.css'; // Import shared styles

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default to CSV if not specified
  const requiredType = data.fileType || 'CSV';

  // Determine styling based on type
  let nodeClass = 'node-csv';
  let textClass = 'text-csv';
  let icon = '📄';

  if (requiredType === 'JSON') {
    nodeClass = 'node-json';
    textClass = 'text-json';
    icon = '{}';
  } else if (requiredType === 'Excel') {
    nodeClass = 'node-excel';
    textClass = 'text-excel';
    icon = '📊';
  }

  // Fetch Files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/datasources', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter logic based on requiredType
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
  }, [requiredType]);

  // Handle Selection Change
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
    <div className={`pipeline-node ${nodeClass}`}>
      
      {/* Delete Button */}
      <button className="node-delete-btn nodrag" onClick={onDelete}>✕</button>

      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="node-handle"
      />
      
      {/* Header */}
      <div className={`node-header ${textClass}`}>
        <span style={{ fontSize: '16px' }}>{icon}</span> Source: {requiredType}
      </div>
      
      {/* Body: Dropdown */}
      <div className="node-body nodrag">
        {loading ? (
           <span className="text-muted" style={{ fontSize: '12px' }}>Loading files...</span>
        ) : (
            <select 
                className="select-field"
                onChange={onChange} 
                value={data.filename || ""}
                style={{ cursor: 'pointer' }}
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
      
      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="node-handle"
      />
    </div>
  );
});