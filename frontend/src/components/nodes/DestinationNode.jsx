import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import '../../App.css'; // Import shared styles

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

  // Determine styling & content based on type
  const type = data.destinationType || 'DB';
  
  let nodeClass = 'node-db';
  let textClass = 'text-db';
  let icon = '💾';
  let placeholder = 'Table Name';

  if (type === 'CSV') {
    nodeClass = 'node-csv';
    textClass = 'text-csv';
    icon = '📄';
    placeholder = 'output.csv';
  } else if (type === 'JSON') {
    nodeClass = 'node-json';
    textClass = 'text-json';
    icon = '{}';
    placeholder = 'output.json';
  } else if (type === 'Excel') {
    nodeClass = 'node-excel';
    textClass = 'text-excel';
    icon = '📊';
    placeholder = 'output.xlsx';
  }

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
        <span style={{ fontSize: '16px' }}>{icon}</span> Save as {type}
      </div>
      
      {/* Body */}
      <div className="node-body nodrag">
        <label 
            className="input-label" 
            style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
        >
            {type === 'DB' ? 'TABLE NAME' : 'OUTPUT FILENAME'}
        </label>
        <input 
            className="input-field"
            type="text" 
            placeholder={placeholder}
            defaultValue={data.outputName || ""}
            onChange={onChange}
        />
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