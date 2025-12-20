import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const DataPreviewPanel = ({ isOpen, onClose, data, columns, loading, error, nodeLabel, imageSrc }) => {
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
            left: 250, 
            right: 0, 
            height: '400px', // Increased height slightly for images
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
              <div style={{ padding: '6px', background: imageSrc ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
                {imageSrc ? <ImageIcon size={18} color="#ec4899" /> : <Table size={18} color="#3b82f6" />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>
                  {imageSrc ? 'Image Preview' : 'Data Preview'}: {nodeLabel || 'Unknown Node'}
                </span>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                  {imageSrc ? 'Generated Visualization' : 'Showing first 100 rows (Snapshot)'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* --- CONTENT AREA --- */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* 1. LOADING STATE */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px', color: '#a1a1aa', width: '100%' }}>
                <Loader2 className="spin" size={32} color="#3b82f6" />
                <span style={{ fontSize: '13px' }}>Loading...</span>
              </div>
            )}

            {/* 2. ERROR STATE */}
            {!loading && error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444', gap: '12px', padding: '20px', textAlign: 'center', width: '100%' }}>
                <AlertCircle size={32} />
                <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{error}</p>
              </div>
            )}

            {/* 3. IMAGE PREVIEW STATE (NEW) */}
            {!loading && !error && imageSrc && (
                <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#09090b' }}>
                    <img 
                        src={imageSrc} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                    />
                </div>
            )}

            {/* 4. DATA TABLE STATE */}
            {!loading && !error && !imageSrc && data && data.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#d4d4d8' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#27272a', zIndex: 1 }}>
                  <tr>
                    {columns.map((col, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {columns.map((col, j) => (
                        <td key={j} style={{ padding: '10px 16px', whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row[col] === null ? <em style={{ color: '#71717a' }}>null</em> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. EMPTY STATE */}
            {!loading && !error && !imageSrc && (!data || data.length === 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a', width: '100%' }}>
                <Table size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <span>No data output.</span>
              </div>
            )}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataPreviewPanel;