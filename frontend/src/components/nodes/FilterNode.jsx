import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// This is the custom design for the "Filter" box
export default memo(({ data, isConnectable }) => {
  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #777', 
      borderRadius: '5px', 
      padding: '10px', 
      minWidth: '150px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      {/* 1. The Input Dot (Left Side) */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0041d0' }}>
        ⚙️ Filter Data
      </div>

      {/* 2. The Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '10px' }}>Column Name:</label>
        <input 
            className="nodrag" // IMPORTANT: Class 'nodrag' allows typing without dragging the node
            type="text" 
            placeholder="e.g. Age" 
            style={{ fontSize: '12px', padding: '2px' }}
        />

        <label style={{ fontSize: '10px' }}>Condition:</label>
        <select className="nodrag" style={{ fontSize: '12px' }}>
            <option value=">">Greater Than</option>
            <option value="<">Less Than</option>
            <option value="==">Equals</option>
        </select>

        <label style={{ fontSize: '10px' }}>Value:</label>
        <input 
            className="nodrag" 
            type="text" 
            placeholder="e.g. 25" 
            style={{ fontSize: '12px', padding: '2px' }}
        />
      </div>

      {/* 3. The Output Dot (Right Side) */}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
});