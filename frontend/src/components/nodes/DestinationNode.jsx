import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import '../../App.css';

export default memo(({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const onChange = (evt) => {
    const newVal = evt.target.value;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { ...node.data, outputName: newVal } 
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="pipeline-node node-db">
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="node-handle"
      />
      
      <div className="node-header text-db">
        <span style={{ fontSize: '16px' }}>💾</span> {data.label || 'Destination'}
      </div>

      <div className="node-body nodrag">
        <label className="node-label">OUTPUT FILENAME</label>
        <input 
            className="input-field" 
            type="text" 
            placeholder="e.g. output_data"
            value={data.outputName || ''}
            onChange={onChange}
        />
        <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '5px', marginBottom: 0 }}>
            Will save to /processed folder
        </p>
      </div>
    </div>
  );
});