import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FileText, FileJson, FileSpreadsheet, File, ChevronDown, Check, Loader, FileOutput, Database } from 'lucide-react';
import axios from 'axios';
import '../../App.css'; 

export default memo(({ id, data, isConnectable }) => {
  const { deleteElements } = useReactFlow();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Dropdown state

  // 1. Fetch available files from backend (Unified Sources)
  useEffect(() => {
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:5000/datasources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(res.data);
        } catch (err) {
            console.error("Failed to load files", err);
        } finally {
            setLoading(false);
        }
    };
    fetchFiles();
  }, []);

  // 2. Determine Styling based on Filename Extension
  const nodeStyle = useMemo(() => {
    const filename = data.filename || '';
    const ext = filename.split('.').pop().toLowerCase();

    switch (ext) {
        case 'csv': 
            return { color: '#10b981', icon: <FileText size={16} />, typeLabel: 'CSV' };
        case 'json': 
            return { color: '#fbbf24', icon: <FileJson size={16} />, typeLabel: 'JSON' };
        case 'xlsx': 
        case 'xls': 
            return { color: '#16a34a', icon: <FileSpreadsheet size={16} />, typeLabel: 'Excel' };
        default: 
            return { color: '#64748b', icon: <Database size={16} />, typeLabel: 'Data' }; 
    }
  }, [data.filename]);

  // 3. Selection Handler
  const handleSelect = (filename) => {
    // Notify parent (PipelineBuilder) to update the unified state
    if (data.onUpdate) {
        data.onUpdate(id, { filename: filename });
    } else {
        // Fallback for direct update if onUpdate isn't passed (though it should be)
        data.filename = filename;
        data.label = filename;
    }
    setIsOpen(false);
  };

  // 4. Delete Handler
  const onDelete = useCallback((evt) => {
    evt.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div 
        className="pipeline-node"
        style={{ 
            borderLeft: `4px solid ${nodeStyle.color}`, 
            transition: 'all 0.3s ease',
            minWidth: '240px'
        }}
    >
      
      {/* Delete Button */}
      <button className="node-delete-btn nodrag" onClick={onDelete}>✕</button>

      {/* Hidden input handle for layout consistency */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="node-handle"
        style={{ visibility: 'hidden' }} 
      />
      
      {/* Dynamic Header */}
      <div className="node-header" style={{ color: nodeStyle.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {nodeStyle.icon}
        <span style={{ fontSize: '13px', fontWeight: '600' }}>
            {data.label && data.label !== "Source Node" ? (data.label.length > 20 ? data.label.substring(0,20)+"..." : data.label) : `${nodeStyle.typeLabel} Source`}
        </span>
      </div>

      <div className="node-body nodrag">
        <label className="node-label">SELECT INPUT FILE</label>
        
        {/* Custom Dropdown for Rich Content */}
        <div className="custom-select-container">
          <div 
            className={`custom-select-trigger ${isOpen ? 'open' : ''}`} 
            onClick={() => setIsOpen(!isOpen)}
            style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#e4e4e7' }}
          >
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {data.filename || "Choose a file..."}
            </span>
            {loading ? <Loader className="spin" size={14} /> : <ChevronDown size={14} />}
          </div>

          {isOpen && (
            <div className="custom-select-options" style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '6px', marginTop: '4px', zIndex: 100, maxHeight: '200px', overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              {files.length > 0 ? (
                files.map((file) => (
                  <div 
                    key={`${file.category}-${file.id}`} 
                    className="select-option"
                    onClick={() => handleSelect(file.name)}
                    style={{ 
                        padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {file.category === 'processed' ? (
                        <FileOutput size={16} color="#a855f7" /> 
                      ) : (
                        <FileText size={16} color="#10b981" />   
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', color: '#f4f4f5' }}>{file.name}</span>
                        <span style={{ fontSize: '10px', color: '#71717a' }}>
                          {file.category === 'processed' ? 'Pipeline Output' : 'Uploaded File'} • {file.size}
                        </span>
                      </div>
                    </div>
                    {data.filename === file.name && <Check size={14} color="#10b981" />}
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', fontSize: '12px', color: '#71717a', textAlign: 'center' }}>No files found</div>
              )}
            </div>
          )}
        </div>
        
        {!data.filename && (
            <p style={{ fontSize: '10px', color: '#fbbf24', marginTop: '8px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠</span> Select a file to configure
            </p>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="node-handle"
      />
    </div>
  );
});