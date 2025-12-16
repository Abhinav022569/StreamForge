import React from 'react';
import { 
  FileText, FileJson, FileSpreadsheet, 
  Filter, ArrowUpDown, MousePointerClick, Tag, Scissors, Sparkles, Sigma, Link, 
  RefreshCw, Type, Calculator, ListMinus, PlusSquare, 
  BarChart3, Database, Save 
} from 'lucide-react';
import '../App.css'; 

export default () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar scrollable" style={{ 
        width: '240px', 
        background: 'rgba(24, 24, 27, 0.6)', 
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '20px',
        overflowY: 'auto'
    }}>
      
      {/* Title */}
      <div className="sidebar-title-section" style={{ marginBottom: '25px' }}>
        <h3 className="sidebar-title" style={{ fontSize: '16px', color: 'white', fontWeight: '700' }}>Toolbox</h3>
        <p className="sidebar-subtitle" style={{ fontSize: '12px', color: '#a1a1aa' }}>Drag nodes to the canvas</p>
      </div>

      {/* 1. Source Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Sources</p>
        <ToolItem type="source_csv" label="CSV Source" icon={<FileText size={16} />} color="#10b981" onDragStart={onDragStart} />
        <ToolItem type="source_json" label="JSON Source" icon={<FileJson size={16} />} color="#fbbf24" onDragStart={onDragStart} />
        <ToolItem type="source_excel" label="Excel Source" icon={<FileSpreadsheet size={16} />} color="#16a34a" onDragStart={onDragStart} />
      </div>

      {/* 2. Transformation Nodes */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Transformations</p>
        <ToolItem type="filterNode" label="Filter Data" icon={<Filter size={16} />} color="#3b82f6" onDragStart={onDragStart} />
        <ToolItem type="trans_sort" label="Sort Data" icon={<ArrowUpDown size={16} />} color="#f472b6" onDragStart={onDragStart} />
        <ToolItem type="trans_select" label="Select Cols" icon={<MousePointerClick size={16} />} color="#fbbf24" onDragStart={onDragStart} />
        <ToolItem type="trans_rename" label="Rename" icon={<Tag size={16} />} color="#c084fc" onDragStart={onDragStart} />
        <ToolItem type="trans_dedupe" label="Deduplicate" icon={<Scissors size={16} />} color="#2dd4bf" onDragStart={onDragStart} />
        <ToolItem type="trans_fillna" label="Fill Nulls" icon={<Sparkles size={16} />} color="#a78bfa" onDragStart={onDragStart} />
        <ToolItem type="trans_group" label="Group By" icon={<Sigma size={16} />} color="#fb7185" onDragStart={onDragStart} />
        <ToolItem type="trans_join" label="Join" icon={<Link size={16} />} color="#38bdf8" onDragStart={onDragStart} />
        
        {/* Advanced */}
        <p className="sidebar-section-label" style={{ marginTop: '15px' }}>Advanced</p>
        <ToolItem type="trans_cast" label="Convert Type" icon={<RefreshCw size={16} />} color="#a3e635" onDragStart={onDragStart} />
        <ToolItem type="trans_string" label="Text Clean" icon={<Type size={16} />} color="#fcd34d" onDragStart={onDragStart} />
        <ToolItem type="trans_calc" label="Math Formula" icon={<Calculator size={16} />} color="#60a5fa" onDragStart={onDragStart} />
        <ToolItem type="trans_limit" label="Limit Rows" icon={<ListMinus size={16} />} color="#f87171" onDragStart={onDragStart} />
        <ToolItem type="trans_constant" label="Add Column" icon={<PlusSquare size={16} />} color="#34d399" onDragStart={onDragStart} />
      </div>

      {/* 3. Visualization */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Visualization</p>
        <ToolItem type="vis_chart" label="Create Chart" icon={<BarChart3 size={16} />} color="#8b5cf6" onDragStart={onDragStart} />
      </div>

      {/* 4. Destinations */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Destinations</p>
        <ToolItem type="dest_db" label="Save to DB" icon={<Database size={16} />} color="#a855f7" onDragStart={onDragStart} />
        <ToolItem type="dest_csv" label="Save as CSV" icon={<FileText size={16} />} color="#94a3b8" onDragStart={onDragStart} />
        <ToolItem type="dest_json" label="Save as JSON" icon={<FileJson size={16} />} color="#94a3b8" onDragStart={onDragStart} />
        <ToolItem type="dest_excel" label="Save as Excel" icon={<FileSpreadsheet size={16} />} color="#94a3b8" onDragStart={onDragStart} />
      </div>

    </aside>
  );
};

// Helper Component for Tool Items
const ToolItem = ({ type, label, icon, color, onDragStart }) => (
    <div 
        className="sidebar-tool" 
        draggable 
        onDragStart={(event) => onDragStart(event, type, label)}
        style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', 
            padding: '10px 12px', marginBottom: '8px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px',
            cursor: 'grab', color: '#e4e4e7', fontSize: '13px', fontWeight: '500',
            borderLeft: `3px solid ${color || '#71717a'}`,
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    >
        <span style={{ color: color }}>{icon}</span> 
        {label}
    </div>
);