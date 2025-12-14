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
        
        <div className="sidebar-tool csv" draggable onDragStart={(event) => onDragStart(event, 'source_csv', 'Source: CSV')}>
          <span style={{ fontSize: '16px' }}>📄</span> CSV Source
        </div>
        <div className="sidebar-tool json" draggable onDragStart={(event) => onDragStart(event, 'source_json', 'Source: JSON')}>
          <span style={{ fontSize: '16px' }}>{`{}`}</span> JSON Source
        </div>
        <div className="sidebar-tool excel" draggable onDragStart={(event) => onDragStart(event, 'source_excel', 'Source: Excel')}>
          <span style={{ fontSize: '16px' }}>📊</span> Excel Source
        </div>
      </div>

      {/* 2. Transformation Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Transformations</p>
        
        <div className="sidebar-tool filter" draggable onDragStart={(event) => onDragStart(event, 'filterNode', 'Transform: Filter')}>
          <span style={{ fontSize: '16px' }}>⚡</span> Filter Data
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#f472b6', color: '#f472b6' }} draggable onDragStart={(event) => onDragStart(event, 'trans_sort', 'Sort Data')}>
          <span style={{ fontSize: '16px' }}>⇅</span> Sort
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#fbbf24', color: '#fbbf24' }} draggable onDragStart={(event) => onDragStart(event, 'trans_select', 'Select Cols')}>
          <span style={{ fontSize: '16px' }}>🎯</span> Select Cols
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#c084fc', color: '#c084fc' }} draggable onDragStart={(event) => onDragStart(event, 'trans_rename', 'Rename')}>
          <span style={{ fontSize: '16px' }}>🏷️</span> Rename
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#2dd4bf', color: '#2dd4bf' }} draggable onDragStart={(event) => onDragStart(event, 'trans_dedupe', 'Deduplicate')}>
          <span style={{ fontSize: '16px' }}>✂️</span> Dedupe
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#a78bfa', color: '#a78bfa' }} draggable onDragStart={(event) => onDragStart(event, 'trans_fillna', 'Fill Missing')}>
          <span style={{ fontSize: '16px' }}>💊</span> Fill Nulls
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#fb7185', color: '#fb7185' }} draggable onDragStart={(event) => onDragStart(event, 'trans_group', 'Group By')}>
          <span style={{ fontSize: '16px' }}>∑</span> Group By
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#38bdf8', color: '#38bdf8' }} draggable onDragStart={(event) => onDragStart(event, 'trans_join', 'Join')}>
          <span style={{ fontSize: '16px' }}>🔗</span> Join
        </div>

        {/* --- NEW ADVANCED NODES --- */}
        
        <div className="sidebar-tool" style={{ borderColor: '#a3e635', color: '#a3e635' }} draggable onDragStart={(event) => onDragStart(event, 'trans_cast', 'Convert Type')}>
          <span style={{ fontSize: '16px' }}>🔄</span> Convert Type
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#fcd34d', color: '#fcd34d' }} draggable onDragStart={(event) => onDragStart(event, 'trans_string', 'Text Clean')}>
          <span style={{ fontSize: '16px' }}>🔤</span> Text Clean
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#60a5fa', color: '#60a5fa' }} draggable onDragStart={(event) => onDragStart(event, 'trans_calc', 'Math Formula')}>
          <span style={{ fontSize: '16px' }}>🧮</span> Math Formula
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#f87171', color: '#f87171' }} draggable onDragStart={(event) => onDragStart(event, 'trans_limit', 'Limit Rows')}>
          <span style={{ fontSize: '16px' }}>🛑</span> Limit Rows
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#34d399', color: '#34d399' }} draggable onDragStart={(event) => onDragStart(event, 'trans_constant', 'Add Column')}>
          <span style={{ fontSize: '16px' }}>➕</span> Add Column
        </div>

        <div className="sidebar-tool" style={{ borderColor: '#34d399', color: '#34d399' }} draggable onDragStart={(event) => onDragStart(event, 'trans_constant', 'Add Column')}>
          <span style={{ fontSize: '16px' }}>➕</span> Add Column
        </div>

      </div>

      {/* 3. Visualization Nodes (NEW SECTION or add to transformations) */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Visualization</p>
        
        <div 
            className="sidebar-tool" 
            style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }} 
            draggable 
            onDragStart={(event) => onDragStart(event, 'vis_chart', 'Create Chart')}
        >
          <span style={{ fontSize: '16px' }}>📊</span> Create Chart
        </div>
      </div>

      {/* 4. Destination Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Destinations</p>
        <div className="sidebar-tool db" draggable onDragStart={(event) => onDragStart(event, 'dest_db', 'Save: Database')}>
          <span style={{ fontSize: '16px' }}>🗄️</span> Save to DB
        </div>
        <div className="sidebar-tool csv" draggable onDragStart={(event) => onDragStart(event, 'dest_csv', 'Save: CSV')}>
          <span style={{ fontSize: '16px' }}>📄</span> Save as CSV
        </div>
        <div className="sidebar-tool json" draggable onDragStart={(event) => onDragStart(event, 'dest_json', 'Save: JSON')}>
          <span style={{ fontSize: '16px' }}>{`{}`}</span> Save as JSON
        </div>
        <div className="sidebar-tool excel" draggable onDragStart={(event) => onDragStart(event, 'dest_excel', 'Save: Excel')}>
          <span style={{ fontSize: '16px' }}>📊</span> Save as Excel
        </div>
      </div>

    </aside>
  );
};