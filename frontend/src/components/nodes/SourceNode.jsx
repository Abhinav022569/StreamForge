import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements } = useReactFlow();

  const onDelete = (evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div style={{ 
      background: '#18181b', 
      border: '1px solid #10b981', 
      borderRadius: '8px', 
      padding: '15px', 
      minWidth: '180px',
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
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📂</span> Source File
      </div>
      
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        {data.label || "Select a file..."}
      </div>
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#555', width: '8px', height: '8px' }} />
    </div>
  );
});