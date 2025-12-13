import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import '../../App.css'; // Import shared styles

export default memo(({ id, data, isConnectable }) => {
  const { setNodes, deleteElements } = useReactFlow();

  const updateData = useCallback((evt) => {
    const { name, value } = evt.target;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, [name]: value } };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onDelete = useCallback((evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div className="pipeline-node node-filter">
      
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
      <div className="node-header text-filter">
        <span style={{ fontSize: '16px' }}>⚙️</span> Filter Data
      </div>

      {/* Body */}
      <div className="node-body">
        
        {/* Column Input */}
        <div className="nodrag input-group" style={{ marginBottom: '10px' }}>
            <label className="input-label" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                COLUMN
            </label>
            <input 
                className="input-field" 
                name="column" 
                type="text" 
                placeholder="e.g. age" 
                defaultValue={data.column} 
                onChange={updateData} 
            />
        </div>

        {/* Condition & Value Row */}
        <div className="flex gap-10 nodrag">
            <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                    CONDITION
                </label>
                <select 
                    className="select-field" 
                    name="condition" 
                    defaultValue={data.condition} 
                    onChange={updateData} 
                    style={{ cursor: 'pointer' }}
                >
                    <option value=">">&gt; (Gt)</option>
                    <option value="<">&lt; (Lt)</option>
                    <option value="==">== (Eq)</option>
                </select>
            </div>
            
            <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                    VALUE
                </label>
                <input 
                    className="input-field" 
                    name="value" 
                    type="text" 
                    placeholder="25" 
                    defaultValue={data.value} 
                    onChange={updateData} 
                />
            </div>
        </div>

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