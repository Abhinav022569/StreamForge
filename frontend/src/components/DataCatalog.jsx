import React, { useState, useEffect } from 'react';
import { 
    Search, Database, FileText, ArrowRight, Layers, Table, 
    Filter, Activity, ChevronRight, Clock, AlertCircle, XCircle, GitCommit 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from './layout/AppLayout';
import '../App.css';

const DataCatalog = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [lineage, setLineage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        searchCatalog('');
    }, []);

    const searchCatalog = async (q) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:5000/api/catalog/search?q=${q}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
            if (!hasSearched) setHasSearched(true);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchLineage = async (asset) => {
        // Force refresh even if clicking same asset to ensure latest data
        // if (selectedAsset?.id === asset.id && selectedAsset?.type === asset.type) return;
        
        setSelectedAsset(asset);
        setLineage(null); 

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:5000/api/catalog/lineage/${asset.type}/${asset.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Lineage Data:", res.data); // DEBUG LOG
            setLineage(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchCatalog(query);
    };

    const listVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.05,
                delayChildren: 0.1
            } 
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <AppLayout>
            <div style={{ padding: '10px 48px 32px 48px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', width: '100%' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ 
                            fontSize: '36px', 
                            fontWeight: '800', 
                            color: 'white', 
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            letterSpacing: '-0.5px'
                        }}>
                            <div style={{ 
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                                padding: '10px', 
                                borderRadius: '14px',
                                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Database size={28} color="white" />
                            </div>
                            Data Catalog
                        </h1>
                        <p style={{ color: '#a1a1aa', fontSize: '16px', maxWidth: '650px', lineHeight: '1.6' }}>
                            The central intelligence hub for your data assets. Explore schemas, uncover hidden dependencies, and visualize data lineage across your entire pipeline ecosystem.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ marginBottom: '24px', position: 'relative', zIndex: 10, width: '100%' }}
                >
                    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: '16px',
                            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                            opacity: 0.3, filter: 'blur(20px)', zIndex: -1,
                            transform: 'translateY(4px) scale(0.98)'
                        }} />
                        
                        <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', pointerEvents: 'none' }} />
                        
                        <input 
                            type="text" 
                            placeholder="Search assets by name, column, or tag..." 
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if(e.target.value === '') searchCatalog('');
                            }}
                            style={{ 
                                width: '100%', 
                                padding: '18px 50px 18px 56px', 
                                background: 'rgba(24, 24, 27, 0.8)', 
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                borderRadius: '16px', 
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                e.target.style.background = 'rgba(24, 24, 27, 0.95)';
                                e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.background = 'rgba(24, 24, 27, 0.8)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        
                        {query && (
                            <button 
                                type="button"
                                onClick={() => { setQuery(''); searchCatalog(''); }}
                                style={{
                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#71717a'
                                }}
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </form>
                </motion.div>

                <div style={{ display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>
                    
                    <div style={{ width: '35%', display: 'flex', flexDirection: 'column', minWidth: '350px', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                                Results ({results.length})
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', opacity: 0.7 }}>
                                <Filter size={14} color="#a1a1aa" />
                                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Filter</span>
                            </div>
                        </div>

                        <motion.div 
                            className="scrollable custom-scrollbar"
                            style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }}
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            key={loading ? 'loading' : 'loaded'} 
                        >
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))
                            ) : results.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ textAlign: 'center', padding: '60px 20px', color: '#52525b', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                >
                                    <div style={{ background: 'rgba(255,255,255,0.03)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <AlertCircle size={32} style={{ opacity: 0.5 }} />
                                    </div>
                                    <p style={{ fontWeight: '500', color: '#a1a1aa' }}>No data assets found</p>
                                    <p style={{ fontSize: '13px' }}>Try searching for a different keyword or check spelling.</p>
                                </motion.div>
                            ) : (
                                results.map(asset => (
                                    <AssetCard 
                                        key={`${asset.type}-${asset.id}`} 
                                        asset={asset} 
                                        isSelected={selectedAsset?.id === asset.id && selectedAsset?.type === asset.type}
                                        onClick={() => fetchLineage(asset)}
                                        variants={itemVariants}
                                    />
                                ))
                            )}
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedAsset ? (
                            <motion.div 
                                key={selectedAsset.id}
                                initial={{ x: 50, opacity: 0, scale: 0.98 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: 50, opacity: 0, scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                                style={{ 
                                    flex: 1, 
                                    background: 'rgba(24, 24, 27, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    backdropFilter: 'blur(40px)',
                                    padding: '32px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '32px',
                                    boxShadow: '-10px 0 40px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: '64px', height: '64px', borderRadius: '16px',
                                                background: selectedAsset.type === 'Source' 
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.2))' 
                                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 64, 175, 0.2))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: selectedAsset.type === 'Source' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                                                boxShadow: selectedAsset.type === 'Source' ? '0 8px 20px rgba(16, 185, 129, 0.1)' : '0 8px 20px rgba(59, 130, 246, 0.1)'
                                            }}>
                                                {selectedAsset.type === 'Source' 
                                                    ? <FileText size={32} color="#34d399" strokeWidth={1.5} /> 
                                                    : <Table size={32} color="#60a5fa" strokeWidth={1.5} />
                                                }
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                                                    <Badge type={selectedAsset.type} />
                                                    <span style={{ fontSize: '12px', color: '#71717a' }}>ID: {selectedAsset.id}</span>
                                                </div>
                                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                                                    {selectedAsset.name}
                                                </h2>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                             <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '4px' }}>Row Count</div>
                                             <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{selectedAsset.rows?.toLocaleString() || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ 
                                        color: '#e4e4e7', fontSize: '15px', fontWeight: '600', marginBottom: '20px',
                                        display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px'
                                    }}>
                                        <Activity size={18} color="#f472b6" /> DATA LINEAGE
                                    </h4>
                                    
                                    <div style={{ 
                                        background: 'rgba(0,0,0,0.2)', 
                                        borderRadius: '16px', 
                                        padding: '24px', 
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {!lineage ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                                <Activity className="spin" size={24} color="#71717a" />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                                                
                                                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                                                    <line x1="28" y1="30" x2="28" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 4" />
                                                </svg>

                                                <LineageStep 
                                                    icon={<Clock size={16} />} color="#f472b6"
                                                    label="PROVENANCE"
                                                    title={lineage.created_by?.name || "Manual Upload"}
                                                    subtitle={lineage.created_by?.id ? `Generated via Pipeline #${lineage.created_by.id}` : "Direct user upload"}
                                                />

                                                <div style={{ padding: '16px 0', marginLeft: '56px' }}>
                                                    <div style={{ 
                                                        background: 'rgba(139, 92, 246, 0.1)', 
                                                        border: '1px solid rgba(139, 92, 246, 0.3)', 
                                                        borderRadius: '8px', 
                                                        padding: '10px 16px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#e9d5ff',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <Database size={14} /> {selectedAsset.name}
                                                    </div>
                                                </div>

                                                <LineageStep 
                                                    icon={<GitCommit size={16} />} color="#38bdf8"
                                                    label="DOWNSTREAM USAGE"
                                                    isList={true}
                                                    listItems={lineage.used_in}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ 
                                        color: '#e4e4e7', fontSize: '15px', fontWeight: '600', marginBottom: '16px',
                                        display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px'
                                    }}>
                                        <Layers size={18} color="#a855f7" /> SCHEMA DEFINITION
                                    </h4>
                                    <div style={{ 
                                        background: 'rgba(0,0,0,0.2)', 
                                        borderRadius: '16px', 
                                        flex: 1,
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        display: 'flex', flexDirection: 'column'
                                    }}>
                                        {Object.keys(selectedAsset.columns || {}).length > 0 ? (
                                            <>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#71717a', textTransform: 'uppercase' }}>Column Name</span>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#71717a', textTransform: 'uppercase' }}>Data Type</span>
                                                </div>
                                                <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                                                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                                                        <tbody>
                                                            {Object.entries(selectedAsset.columns || {}).map(([col, type], idx) => (
                                                                <tr key={col} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                                    <td style={{ padding: '12px 20px', color: '#e4e4e7', fontWeight: '500' }}>{col}</td>
                                                                    <td style={{ padding: '12px 20px', color: '#a1a1aa' }}>
                                                                        <span style={{ 
                                                                            fontFamily: 'JetBrains Mono, monospace', 
                                                                            background: 'rgba(255,255,255,0.05)', 
                                                                            padding: '4px 8px', 
                                                                            borderRadius: '6px', 
                                                                            fontSize: '12px',
                                                                            color: '#d4d4d8'
                                                                        }}>{type}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', fontStyle: 'italic' }}>
                                                Schema information not available for this asset.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: '#52525b',
                                    border: '2px dashed rgba(255,255,255,0.05)',
                                    borderRadius: '24px',
                                    background: 'rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ 
                                    width: '80px', height: '80px', borderRadius: '50%', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <Search size={32} style={{ opacity: 0.3 }} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>No Asset Selected</h3>
                                <p style={{ fontSize: '14px', maxWidth: '300px', textAlign: 'center' }}>Select an asset from the list to view its schema definition and lineage graph.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
};

const SkeletonCard = () => (
    <div style={{ 
        padding: '16px', marginBottom: '12px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
    }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
            </div>
        </div>
    </div>
);

const AssetCard = ({ asset, isSelected, onClick, variants }) => (
    <motion.div 
        variants={variants}
        onClick={onClick}
        whileHover={{ 
            scale: 1.01, 
            backgroundColor: 'rgba(255,255,255,0.04)', 
            x: 2 
        }}
        whileTap={{ scale: 0.99 }}
        style={{ 
            padding: '18px', 
            marginBottom: '12px', 
            background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(24, 24, 27, 0.6)',
            border: isSelected ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'border 0.2s',
            boxShadow: isSelected ? '0 4px 20px rgba(139, 92, 246, 0.15)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            transformOrigin: 'center center'
        }}
    >
        {isSelected && (
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#8b5cf6' }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: asset.type === 'Source' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: asset.type === 'Source' ? '#10b981' : '#3b82f6'
                }}>
                    {asset.type === 'Source' ? <FileText size={20} strokeWidth={2} /> : <Table size={20} strokeWidth={2} />}
                </div>
                <div>
                    <h4 style={{ margin: 0, color: isSelected ? 'white' : '#e4e4e7', fontSize: '15px', fontWeight: '600' }}>{asset.name}</h4>
                    <p style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '12px', fontFamily: 'monospace' }}>ID: {asset.id}</p>
                </div>
            </div>
            {isSelected && <ChevronRight size={18} color="#8b5cf6" />}
        </div>
        
        <div style={{ paddingLeft: '50px' }}>
            {asset.matches && asset.matches.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {asset.matches.map((m, i) => (
                        <span key={i} style={{ 
                            fontSize: '10px', 
                            background: 'rgba(255,255,255,0.08)', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            color: '#e4e4e7',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {m}
                        </span>
                    ))}
                </div>
            )}
            <div style={{ fontSize: '12px', color: '#71717a', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} /> {Object.keys(asset.columns || {}).length} columns
                </span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Database size={12} /> {asset.rows?.toLocaleString()} rows
                </span>
            </div>
        </div>
    </motion.div>
);

const Badge = ({ type }) => (
    <span style={{ 
        fontSize: '10px', 
        padding: '3px 10px', 
        borderRadius: '20px', 
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: type === 'Source' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        color: type === 'Source' ? '#34d399' : '#60a5fa',
        border: type === 'Source' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
    }}>
        {type}
    </span>
);

const LineageStep = ({ icon, color, label, title, subtitle, isList, listItems }) => (
    <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, padding: '8px 0' }}>
        <div style={{ 
            width: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
            <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: `${color}15`, 
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 15px ${color}20`,
                marginBottom: '4px'
            }}>
                {React.cloneElement(icon, { size: 16, color: color })}
            </div>
        </div>
        
        <div style={{ flex: 1, paddingTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: color, letterSpacing: '1px', marginBottom: '6px' }}>
                {label}
            </div>
            
            {isList ? (
                listItems && listItems.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {listItems.map(p => (
                            <motion.div 
                                whileHover={{ y: -2 }}
                                key={p.id} 
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '8px 14px', 
                                    borderRadius: '10px', 
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <span style={{ color: '#e4e4e7', fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#a1a1aa' }}>#{p.id}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: '#52525b', fontStyle: 'italic', fontSize: '13px' }}>
                        No active downstream usage detected.
                    </div>
                )
            ) : (
                <div>
                    <div style={{ color: '#e4e4e7', fontWeight: '600', fontSize: '15px' }}>{title}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '2px' }}>{subtitle}</div>
                </div>
            )}
        </div>
    </div>
);

export default DataCatalog;