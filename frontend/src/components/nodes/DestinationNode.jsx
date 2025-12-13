import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements, setNodes } = useReactFlow();

  const onDelete = (evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  // Handle Input Change (Filename)
  const onChange = useCallback((evt) => {
    const value = evt.target.value;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, outputName: value } };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  // Determine styling based on type
  const type = data.destinationType || 'DB';
  
  let borderColor = '#a855f7'; // Default DB Purple
  let icon = '💾';
  let placeholder = 'Table Name';

  if (type === 'CSV') {
    borderColor = '#10b981'; // Green
    icon = '📄';
    placeholder = 'output.csv';
  } else if (type === 'JSON') {
    borderColor = '#fbbf24'; // Amber
    icon = '{}';
    placeholder = 'output.json';
  } else if (type === 'Excel') {
    borderColor = '#16a34a'; // Dark Green
    icon = '📊';
    placeholder = 'output.xlsx';
  }

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
      {/* Delete Button */}
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

      {/* Handle (Left) */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#555', width: '8px', height: '8px' }} />

      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: borderColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span> Save as {type}
      </div>
      
      {/* Filename Input */}
      <div className="nodrag">
        <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
            {type === 'DB' ? 'TABLE NAME' : 'OUTPUT FILENAME'}
        </label>
        <input 
            type="text" 
            placeholder={placeholder}
            defaultValue={data.outputName || ""}
            onChange={onChange}
            style={{
                width: '100%',
                background: '#27272a',
                border: '1px solid #3f3f46',
                color: 'white',
                padding: '6px',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
            }}
        />
      </div>

      {/* Handle (Right) - for chaining */}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#555', width: '8px', height: '8px' }} />
    </div>
  );
});