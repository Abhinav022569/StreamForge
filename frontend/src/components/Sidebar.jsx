import React from 'react';
import '../App.css'; // Import shared styles

export default () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar scrollable">
      
      {/* Title */}
      <div className="sidebar-title-section">
        <h3 className="sidebar-title">Toolbox</h3>
        <p className="sidebar-subtitle">Drag nodes to the canvas</p>
      </div>

      {/* 1. Source Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Sources</p>
        
        <div 
          className="sidebar-tool csv" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'source_csv', 'Source: CSV')}
        >
          <span style={{ fontSize: '16px' }}>📄</span> CSV Source
        </div>
        
        <div 
          className="sidebar-tool json" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'source_json', 'Source: JSON')}
        >
          <span style={{ fontSize: '16px' }}>{`{}`}</span> JSON Source
        </div>
        
        <div 
          className="sidebar-tool excel" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'source_excel', 'Source: Excel')}
        >
          <span style={{ fontSize: '16px' }}>📊</span> Excel Source
        </div>
      </div>

      {/* 2. Transformation Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Transformations</p>
        <div 
          className="sidebar-tool filter" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'filterNode', 'Transform: Filter')}
        >
          <span style={{ fontSize: '16px' }}>⚙️</span> Filter Data
        </div>
      </div>

      {/* 3. Destination Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Destinations</p>
        
        {/* Save to DB */}
        <div 
          className="sidebar-tool db" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'dest_db', 'Save: Database')}
        >
          <span style={{ fontSize: '16px' }}>💾</span> Save to DB
        </div>

        {/* Save as CSV */}
        <div 
          className="sidebar-tool csv" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'dest_csv', 'Save: CSV')}
        >
          <span style={{ fontSize: '16px' }}>📄</span> Save as CSV
        </div>

        {/* Save as JSON */}
        <div 
          className="sidebar-tool json" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'dest_json', 'Save: JSON')}
        >
          <span style={{ fontSize: '16px' }}>{`{}`}</span> Save as JSON
        </div>

        {/* Save as Excel */}
        <div 
          className="sidebar-tool excel" 
          draggable 
          onDragStart={(event) => onDragStart(event, 'dest_excel', 'Save: Excel')}
        >
          <span style={{ fontSize: '16px' }}>📊</span> Save as Excel
        </div>

      </div>

    </aside>
  );
};