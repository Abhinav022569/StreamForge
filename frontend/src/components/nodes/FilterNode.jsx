import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

export default memo(({ id, data, isConnectable }) => {
  // Access the main flow state to update data
  const { setNodes } = useReactFlow();

  // Helper function to update specific fields (column, value, etc.)
  const updateData = useCallback((evt) => {
    const { name, value } = evt.target;
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          // Update ONLY this node's data
          return { 
            ...node, 
            data: { ...node.data, [name]: value } 
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #777', 
      borderRadius: '5px', 
      padding: '10px', 
      minWidth: '150px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0041d0' }}>
        ⚙️ Filter Data
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '10px' }}>Column Name:</label>
        <input 
            className="nodrag" 
            name="column" // This matches the data key
            type="text" 
            placeholder="e.g. Age" 
            defaultValue={data.column} // Load saved value
            onChange={updateData}      // Update on typing
            style={{ fontSize: '12px', padding: '2px' }}
        />

        <label style={{ fontSize: '10px' }}>Condition:</label>
        <select 
            className="nodrag" 
            name="condition"
            defaultValue={data.condition}
            onChange={updateData}
            style={{ fontSize: '12px' }}
        >
            <option value=">">Greater Than</option>
            <option value="<">Less Than</option>
            <option value="==">Equals</option>
        </select>

        <label style={{ fontSize: '10px' }}>Value:</label>
        <input 
            className="nodrag" 
            name="value"
            type="text" 
            placeholder="e.g. 25" 
            defaultValue={data.value}
            onChange={updateData}
            style={{ fontSize: '12px', padding: '2px' }}
        />
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
});