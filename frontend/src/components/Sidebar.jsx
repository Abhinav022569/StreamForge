import React from 'react';

export default () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeStyle = {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '10px',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    transition: 'all 0.2s',
  };

  return (
    <aside style={{ 
      width: '260px', 
      backgroundColor: '#18181b', 
      borderRight: '1px solid #27272a', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Toolbox</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Drag nodes to the canvas</p>
      </div>

      {/* 1. Source Nodes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Sources</p>
        <div 
          onDragStart={(event) => onDragStart(event, 'input', 'Source: CSV')} 
          draggable 
          style={{ ...nodeStyle, borderLeft: '4px solid #10b981' }} // Green Accent
        >
          <span style={{ fontSize: '16px' }}>📂</span> CSV Source
        </div>
      </div>

      {/* 2. Transformation Nodes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Transformations</p>
        <div 
          onDragStart={(event) => onDragStart(event, 'filterNode', 'Transform: Filter')} 
          draggable 
          style={{ ...nodeStyle, borderLeft: '4px solid #3b82f6' }} // Blue Accent
        >
          <span style={{ fontSize: '16px' }}>⚙️</span> Filter Data
        </div>
      </div>

      {/* 3. Destination Nodes */}
      <div>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Destinations</p>
        <div 
          onDragStart={(event) => onDragStart(event, 'output', 'Dest: Database')} 
          draggable 
          style={{ ...nodeStyle, borderLeft: '4px solid #f43f5e' }} // Red Accent
        >
          <span style={{ fontSize: '16px' }}>💾</span> Save to DB
        </div>
      </div>

    </aside>
  );
};