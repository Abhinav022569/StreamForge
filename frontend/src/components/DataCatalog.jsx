import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Database, FileText, ArrowRight, Layers, Table, 
    Filter, Activity, ChevronRight, Clock, AlertCircle, XCircle, GitCommit,
    Hash, Type, Calendar, CheckCircle2, MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from './layout/AppLayout';
import '../App.css';

const DataCatalog = () => {
    // Core State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [lineage, setLineage] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // UI State
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'Source', 'Pipeline'
    const [schemaSearch, setSchemaSearch] = useState(''); // Search within schema table

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
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchLineage = async (asset) => {
        if (selectedAsset?.id === asset.id && selectedAsset?.type === asset.type) return;
        
        setSelectedAsset(asset);
        setLineage(null);
        setSchemaSearch(''); // Reset schema search when changing assets
        
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:5000/api/catalog/lineage/${asset.type}/${asset.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLineage(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Filter Logic
    const filteredResults = useMemo(() => {
        if (filterType === 'ALL') return results;
        if (filterType === 'Source') return results.filter(r => r.type === 'Source');
        if (filterType === 'Pipeline') return results.filter(r => r.type !== 'Source'); // Assuming non-sources are pipelines/transformations
        return results;
    }, [results, filterType]);

    // Schema Filter Logic
    const filteredSchema = useMemo(() => {
        if (!selectedAsset || !selectedAsset.columns) return [];
        const entries = Object.entries(selectedAsset.columns);
        if (!schemaSearch) return entries;
        return entries.filter(([col, type]) => 
            col.toLowerCase().includes(schemaSearch.toLowerCase()) || 
            String(type).toLowerCase().includes(schemaSearch.toLowerCase())
        );
    }, [selectedAsset, schemaSearch]);

    return (
        <AppLayout>
            <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                
                {/* 1. HEADER SECTION */}
                <div style={{ marginBottom: '24px', flexShrink: 0 }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                            <Database size={20} color="white" />
                        </div>
                        Data Catalog
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0, paddingLeft: '4px' }}>
                        Central intelligence for your data assets. Explore schemas and visualize dependencies.
                    </p>
                </div>

                {/* 2. MAIN 3-COLUMN LAYOUT */}
                <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
                    
                    {/* COLUMN 1: FILTERS (Fixed Width) */}
                    <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0 }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                            <input 
                                type="text" 
                                placeholder="Search catalog..." 
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); if(e.target.value === '') searchCatalog(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && searchCatalog(query)}
                                style={{ 
                                    width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(24, 24, 27, 0.6)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', 
                                    color: 'white', fontSize: '13px', outline: 'none', transition: 'all 0.2s'
                                }}
                            />
                        </div>

                        {/* Filter Groups */}
                        <div>
                            <SectionLabel label="Asset Type" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <FilterButton 
                                    label="All Assets" 
                                    count={results.length} 
                                    active={filterType === 'ALL'} 
                                    onClick={() => setFilterType('ALL')}
                                    icon={<Database size={14} />}
                                />
                                <FilterButton 
                                    label="Sources" 
                                    count={results.filter(r => r.type === 'Source').length} 
                                    active={filterType === 'Source'} 
                                    onClick={() => setFilterType('Source')}
                                    icon={<FileText size={14} />}
                                />
                                <FilterButton 
                                    label="Pipelines" 
                                    count={results.filter(r => r.type !== 'Source').length} 
                                    active={filterType === 'Pipeline'} 
                                    onClick={() => setFilterType('Pipeline')}
                                    icon={<Activity size={14} />}
                                />
                            </div>
                        </div>

                        {/* Stats / Info */}
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <SectionLabel label="Catalog Stats" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#a1a1aa', fontSize: '12px' }}>Total Rows</span>
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
                                    {results.reduce((acc, curr) => acc + (curr.rows || 0), 0).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '65%', height: '100%', background: '#10b981' }} />
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: ASSET LIST (Fixed Width) */}
                    <div style={{ width: '380px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <SectionLabel label={`Results (${filteredResults.length})`} noMargin />
                            <div style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
                                <Filter size={12} /> Sort by: Newest
                            </div>
                        </div>

                        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                            ) : filteredResults.length === 0 ? (
                                <EmptyState message="No assets match your filters." />
                            ) : (
                                filteredResults.map(asset => (
                                    <CompactAssetCard 
                                        key={`${asset.type}-${asset.id}`} 
                                        asset={asset} 
                                        isSelected={selectedAsset?.id === asset.id}
                                        onClick={() => fetchLineage(asset)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* COLUMN 3: DETAIL VIEW (Flexible) */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence mode="wait">
                            {selectedAsset ? (
                                <motion.div 
                                    key={selectedAsset.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ 
                                        height: '100%', 
                                        background: 'rgba(24, 24, 27, 0.4)', 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(20px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Detail Header */}
                                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ 
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: selectedAsset.type === 'Source' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    border: selectedAsset.type === 'Source' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {selectedAsset.type === 'Source' ? <FileText size={24} color="#34d399" /> : <Table size={24} color="#60a5fa" />}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <Badge type={selectedAsset.type} />
                                                        <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'monospace' }}>ID: {selectedAsset.id}</span>
                                                    </div>
                                                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{selectedAsset.name}</h2>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '24px' }}>
                                                <StatBox label="Rows" value={selectedAsset.rows?.toLocaleString() || 0} icon={<Layers size={14}/>} />
                                                <StatBox label="Columns" value={Object.keys(selectedAsset.columns || {}).length} icon={<Table size={14}/>} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detail Scrollable Body */}
                                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                                        
                                        {/* Lineage Section */}
                                        <div style={{ marginBottom: '32px' }}>
                                            <SectionHeader icon={<Activity size={16} color="#f472b6" />} title="DATA LINEAGE" />
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', 
                                                border: '1px solid rgba(255,255,255,0.03)', position: 'relative'
                                            }}>
                                                {!lineage ? <div style={{ textAlign: 'center', padding: '10px' }}><Activity className="spin" size={20} color="#71717a" /></div> : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                        {/* Source/Origin */}
                                                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Clock size={14} color="#a1a1aa" />
                                                            <span style={{ color: '#a1a1aa' }}>{lineage.created_by?.name || "User Upload"}</span>
                                                        </div>
                                                        
                                                        <ArrowRight size={14} color="#52525b" />
                                                        
                                                        {/* Current Node */}
                                                        <div style={{ padding: '8px 12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#e9d5ff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Database size={14} />
                                                            {selectedAsset.name}
                                                        </div>
                                                        
                                                        {/* Downstream */}
                                                        {lineage.used_in?.length > 0 && (
                                                            <>
                                                                <ArrowRight size={14} color="#52525b" />
                                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                    {lineage.used_in.map(p => (
                                                                        <div key={p.id} style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', color: '#7dd3fc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <GitCommit size={14} />
                                                                            {p.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Schema Section */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <SectionHeader icon={<Layers size={16} color="#a855f7" />} title="SCHEMA DEFINITION" noMargin />
                                                
                                                {/* Schema Search */}
                                                <div style={{ position: 'relative', width: '200px' }}>
                                                    <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Filter columns..." 
                                                        value={schemaSearch}
                                                        onChange={(e) => setSchemaSearch(e.target.value)}
                                                        style={{ 
                                                            width: '100%', padding: '6px 10px 6px 30px', background: 'rgba(0,0,0,0.2)', 
                                                            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', 
                                                            color: 'white', fontSize: '11px', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                    <thead>
                                                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <th style={{ padding: '12px 20px', fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>Column Name</th>
                                                            <th style={{ padding: '12px 20px', fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>Data Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredSchema.length > 0 ? (
                                                            filteredSchema.map(([col, type], idx) => (
                                                                <tr key={col} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.005)' }}>
                                                                    <td style={{ padding: '10px 20px', color: '#e4e4e7', fontSize: '13px', fontWeight: '500' }}>{col}</td>
                                                                    <td style={{ padding: '10px 20px' }}>
                                                                        <TypeBadge type={type} />
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={2} style={{ padding: '30px', textAlign: 'center', color: '#71717a', fontSize: '13px', fontStyle: 'italic' }}>
                                                                    No columns found matching "{schemaSearch}"
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ 
                                    height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px', color: '#52525b', gap: '16px' 
                                }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Search size={24} style={{ opacity: 0.5 }} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#a1a1aa', marginBottom: '4px' }}>No Asset Selected</h3>
                                        <p style={{ fontSize: '13px', color: '#52525b' }}>Select an item from the list to view lineage and schema.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

/* --- HELPER COMPONENTS --- */

const SectionLabel = ({ label, noMargin }) => (
    <h4 style={{ 
        fontSize: '11px', fontWeight: '700', color: '#52525b', textTransform: 'uppercase', 
        letterSpacing: '1px', marginBottom: noMargin ? 0 : '12px' 
    }}>
        {label}
    </h4>
);

const FilterButton = ({ label, count, active, onClick, icon }) => (
    <button 
        onClick={onClick}
        style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px',
            background: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            transition: 'all 0.2s',
            color: active ? '#a78bfa' : '#a1a1aa'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: active ? '600' : '500' }}>
            {icon}
            {label}
        </div>
        {count !== undefined && (
            <span style={{ fontSize: '11px', background: active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                {count}
            </span>
        )}
    </button>
);

const CompactAssetCard = ({ asset, isSelected, onClick }) => (
    <div 
        onClick={onClick}
        style={{
            padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
            background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
            border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            position: 'relative', overflow: 'hidden'
        }}
    >
        {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#8b5cf6' }} />}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: asset.type === 'Source' ? '#10b981' : '#3b82f6', opacity: 0.8 }}>
                {asset.type === 'Source' ? <FileText size={16} /> : <Table size={16} />}
            </div>
            <div>
                <div style={{ color: isSelected ? 'white' : '#e4e4e7', fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{asset.name}</div>
                <div style={{ color: '#52525b', fontSize: '11px', display: 'flex', gap: '8px' }}>
                    <span>{asset.type}</span>
                    <span>•</span>
                    <span>{asset.rows?.toLocaleString() ?? 0} rows</span>
                </div>
            </div>
        </div>
        {isSelected && <ChevronRight size={14} color="#8b5cf6" />}
    </div>
);

const TypeBadge = ({ type }) => {
    const typeStr = String(type).toUpperCase();
    const colors = {
        'INTEGER': '#f59e0b', 'INT': '#f59e0b', 'NUMBER': '#f59e0b',
        'TEXT': '#3b82f6', 'STRING': '#3b82f6', 'VARCHAR': '#3b82f6',
        'FLOAT': '#10b981', 'DECIMAL': '#10b981', 'DOUBLE': '#10b981',
        'BOOLEAN': '#ec4899', 'BOOL': '#ec4899',
        'DATE': '#8b5cf6', 'DATETIME': '#8b5cf6', 'TIMESTAMP': '#8b5cf6'
    };
    const color = colors[typeStr] || '#71717a'; // Default Gray
    
    return (
        <span style={{ 
            fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: '700', padding: '3px 8px', 
            borderRadius: '4px', background: `${color}15`, color: color, border: `1px solid ${color}30`,
            display: 'inline-block'
        }}>
            {typeStr}
        </span>
    );
};

const StatBox = ({ label, value, icon }) => (
    <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            {icon} {label}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', fontFamily: 'Inter, sans-serif' }}>{value}</div>
    </div>
);

const SectionHeader = ({ icon, title, noMargin }) => (
    <h4 style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', color: '#e4e4e7', 
        fontSize: '13px', fontWeight: '600', marginBottom: noMargin ? 0 : '16px', letterSpacing: '0.5px' 
    }}>
        {icon} {title}
    </h4>
);

const Badge = ({ type }) => (
    <span style={{ 
        fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700',
        background: type === 'Source' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        color: type === 'Source' ? '#34d399' : '#60a5fa',
        textTransform: 'uppercase'
    }}>{type}</span>
);

const SkeletonCard = () => (
    <div style={{ height: '46px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }} />
);

const EmptyState = ({ message }) => (
    <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <AlertCircle size={24} color="#52525b" style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>{message}</p>
    </div>
);

export default DataCatalog;