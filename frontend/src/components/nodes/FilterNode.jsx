import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import '../../App.css'; // Import shared styles

export default memo(({ id, data, isConnectable }) => {
  const { setNodes, deleteElements } = useReactFlow();

  // Unified handler for all inputs (Column, Condition, Value)
  const updateData = useCallback((evt) => {
    const { name, value } = evt.target;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          // Create a new data object to trigger a re-render/update
          return { 
            ...node, 
            data: { ...node.data, [name]: value } 
          };
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
            <label className="node-label">COLUMN</label>
            <input 
                className="input-field" 
                name="column" 
                type="text" 
                placeholder="e.g. age" 
                value={data.column || ''} // Controlled input
                onChange={updateData} 
            />
        </div>

        {/* Condition & Value Row */}
        <div className="flex gap-10 nodrag">
            <div style={{ flex: 1 }}>
                <label className="node-label">CONDITION</label>
                <select 
                    className="select-field" 
                    name="condition" 
                    value={data.condition || '>'} 
                    onChange={updateData} 
                >
                    <option value=">">&gt; (Greater)</option>
                    <option value="<">&lt; (Less)</option>
                    <option value="==">== (Equals)</option>
                    <option value="!=">!= (Not Eq)</option>
                </select>
            </div>
            
            <div style={{ flex: 1 }}>
                <label className="node-label">VALUE</label>
                <input 
                    className="input-field" 
                    name="value" 
                    type="text" 
                    placeholder="e.g. 25" 
                    value={data.value || ''} 
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