import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

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

  const inputStyle = {
    background: '#27272a',
    border: '1px solid #3f3f46',
    color: 'white',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ 
      background: '#18181b', 
      border: '1px solid #3b82f6', 
      borderRadius: '8px', 
      padding: '15px', 
      minWidth: '200px',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'relative' 
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

      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#555', width: '8px', height: '8px' }} />

      <div style={{ fontWeight: 'bold', marginBottom: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚙️</span> Filter Data
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
            <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>COLUMN</label>
            <input className="nodrag" name="column" type="text" placeholder="e.g. age" defaultValue={data.column} onChange={updateData} style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
                <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CONDITION</label>
                <select className="nodrag" name="condition" defaultValue={data.condition} onChange={updateData} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value=">">&gt; (Gt)</option>
                    <option value="<">&lt; (Lt)</option>
                    <option value="==">== (Eq)</option>
                </select>
            </div>
            <div>
                <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>VALUE</label>
                <input className="nodrag" name="value" type="text" placeholder="25" defaultValue={data.value} onChange={updateData} style={inputStyle} />
            </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#555', width: '8px', height: '8px' }} />
    </div>
  );
});