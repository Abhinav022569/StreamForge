import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table, AlertCircle, Loader2 } from 'lucide-react';

const DataPreviewPanel = ({ isOpen, onClose, data, columns, loading, error, nodeLabel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', 
            bottom: 0, 
            left: 250, // Offset for the Sidebar width
            right: 0, 
            height: '350px', // Fixed height for the panel
            backgroundColor: '#18181b',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          {/* --- HEADER --- */}
          <div style={{ 
            padding: '15px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#27272a' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
                <Table size={18} color="#3b82f6" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>
                  Data Preview: {nodeLabel || 'Unknown Node'}
                </span>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                  Showing first 5 rows (Snapshot)
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#a1a1aa', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* --- CONTENT AREA --- */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
            
            {/* 1. LOADING STATE */}
            {loading && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                gap: '12px',
                color: '#a1a1aa'
              }}>
                <Loader2 className="spin" size={32} color="#3b82f6" />
                <span style={{ fontSize: '13px' }}>Fetching preview data...</span>
              </div>
            )}

            {/* 2. ERROR STATE */}
            {!loading && error && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: '#ef4444', 
                gap: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#fca5a5' }}>Preview Failed</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', maxWidth: '400px', lineHeight: '1.5' }}>
                    {error}
                  </p>
                </div>
                <p style={{ fontSize: '12px', color: '#71717a', marginTop: '10px' }}>
                  Tip: Ensure parent nodes are connected and files are valid.
                </p>
              </div>
            )}

            {/* 3. DATA TABLE STATE */}
            {!loading && !error && data && data.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#d4d4d8' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#27272a', zIndex: 1 }}>
                  <tr>
                    {columns.map((col, i) => (
                      <th key={i} style={{ 
                        textAlign: 'left', 
                        padding: '12px 16px', 
                        borderBottom: '1px solid rgba(255,255,255,0.1)', 
                        color: '#a1a1aa',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {columns.map((col, j) => (
                        <td key={j} style={{ 
                          padding: '10px 16px', 
                          whiteSpace: 'nowrap',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {row[col] === null ? <em style={{ color: '#71717a' }}>null</em> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. EMPTY DATA STATE */}
            {!loading && !error && (!data || data.length === 0) && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: '#71717a' 
              }}>
                <Table size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <span>No data output from this node.</span>
              </div>
            )}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataPreviewPanel;