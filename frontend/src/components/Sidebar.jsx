import React from 'react';

export default () => {
  // This function runs when you start dragging a block from the sidebar
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{ padding: '15px', borderRight: '1px solid #ddd', width: '250px', background: '#fcfcfc' }}>
      <h3>Toolbox</h3>
      <div style={{ marginBottom: '20px', color: '#555', fontSize: '12px' }}>
        Drag these nodes to the right pane.
      </div>

      {/* 1. Source Node Template */}
      <div 
        className="dndnode input" 
        onDragStart={(event) => onDragStart(event, 'input', 'Source: CSV')} 
        draggable
        style={{ padding: '10px', border: '1px solid #1a192b', borderRadius: '5px', marginBottom: '10px', cursor: 'grab' }}
      >
        📂 Source: CSV File
      </div>

      {/* 2. Transformation Node Template */}
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'filterNode', 'Transform: Filter')} 
        draggable
        style={{ padding: '10px', border: '1px solid #0041d0', borderRadius: '5px', marginBottom: '10px', cursor: 'grab' }}
      >
        ⚙️ Transform: Filter
      </div>

      {/* 3. Destination Node Template */}
      <div 
        className="dndnode output" 
        onDragStart={(event) => onDragStart(event, 'output', 'Dest: Database')} 
        draggable
        style={{ padding: '10px', border: '1px solid #ff0072', borderRadius: '5px', marginBottom: '10px', cursor: 'grab' }}
      >
        💾 Dest: Database
      </div>
    </aside>
  );
};