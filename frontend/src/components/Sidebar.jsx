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
      flexDirection: 'column',
      height: '100%',        // Force full height
      overflowY: 'auto',     // Enable vertical scrolling
      boxSizing: 'border-box' // Ensure padding doesn't break width
    }}>
      
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Toolbox</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Drag nodes to the canvas</p>
      </div>

      {/* 1. Source Nodes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Sources</p>
        <div onDragStart={(event) => onDragStart(event, 'source_csv', 'Source: CSV')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '16px' }}>📄</span> CSV Source
        </div>
        <div onDragStart={(event) => onDragStart(event, 'source_json', 'Source: JSON')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #fbbf24' }}>
          <span style={{ fontSize: '16px' }}>{}</span> JSON Source
        </div>
        <div onDragStart={(event) => onDragStart(event, 'source_excel', 'Source: Excel')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '16px' }}>📊</span> Excel Source
        </div>
      </div>

      {/* 2. Transformation Nodes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Transformations</p>
        <div onDragStart={(event) => onDragStart(event, 'filterNode', 'Transform: Filter')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '16px' }}>⚙️</span> Filter Data
        </div>
      </div>

      {/* 3. Destination Nodes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '10px' }}>Destinations</p>
        
        {/* Save to DB */}
        <div onDragStart={(event) => onDragStart(event, 'dest_db', 'Save: Database')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #a855f7' }}>
          <span style={{ fontSize: '16px' }}>💾</span> Save to DB
        </div>

        {/* Save as CSV */}
        <div onDragStart={(event) => onDragStart(event, 'dest_csv', 'Save: CSV')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '16px' }}>📄</span> Save as CSV
        </div>

        {/* Save as JSON */}
        <div onDragStart={(event) => onDragStart(event, 'dest_json', 'Save: JSON')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #fbbf24' }}>
          <span style={{ fontSize: '16px' }}>{}</span> Save as JSON
        </div>

        {/* Save as Excel */}
        <div onDragStart={(event) => onDragStart(event, 'dest_excel', 'Save: Excel')} draggable style={{ ...nodeStyle, borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '16px' }}>📊</span> Save as Excel
        </div>

      </div>

    </aside>
  );
};