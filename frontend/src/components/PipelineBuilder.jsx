import axios from 'axios';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useBeforeUnload } from 'react-router-dom';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  ReactFlowProvider,
  useReactFlow 
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  LayoutTemplate, 
  Upload, 
  Download, 
  Play, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  X
} from 'lucide-react';

import Sidebar from './Sidebar';

// Custom Components
import FilterNode from './nodes/FilterNode';
import SourceNode from './nodes/SourceNode';           
import DestinationNode from './nodes/DestinationNode'; 
import DeletableEdge from './edges/DeletableEdge';    

// IMPORT ALL TRANSFORMATIONS
import { 
    SortNode, SelectNode, RenameNode, DedupeNode, FillNaNode, GroupByNode, JoinNode,
    CastNode, StringNode, CalcNode, LimitNode, ConstantNode, ChartNode 
} from './nodes/Transformations';

import { TEMPLATES } from '../data/templates';

const initialNodes = [];

const PipelineBuilderContent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const reactFlowWrapper = useRef(null);
    const fileInputRef = useRef(null);
    const { getNodes, getEdges } = useReactFlow(); 

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [pipelineName, setPipelineName] = useState("My New Pipeline");
    const [isRunning, setIsRunning] = useState(false); 
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const isLoadedRef = useRef(false);

    // --- REGISTER NODE TYPES ---
    const nodeTypes = useMemo(() => ({ 
        filterNode: FilterNode,
        source_csv: SourceNode, source_json: SourceNode, source_excel: SourceNode, sourceNode: SourceNode, 
        dest_db: DestinationNode, dest_csv: DestinationNode, dest_json: DestinationNode, dest_excel: DestinationNode, destinationNode: DestinationNode,
        trans_sort: SortNode, trans_select: SelectNode, trans_rename: RenameNode, trans_dedupe: DedupeNode,
        trans_fillna: FillNaNode, trans_group: GroupByNode, trans_join: JoinNode,
        trans_cast: CastNode, trans_string: StringNode, trans_calc: CalcNode, trans_limit: LimitNode,
        trans_constant: ConstantNode, vis_chart: ChartNode,
    }), []);

    const edgeTypes = useMemo(() => ({ deletableEdge: DeletableEdge }), []);

    // Load Data
    useEffect(() => {
        if (id) {
            isLoadedRef.current = false; 
            const token = localStorage.getItem('token');
            axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const { name, flow } = response.data;
                setPipelineName(name);
                if (flow) {
                    setNodes(flow.nodes || []);
                    const dbEdges = (flow.edges || []).map(edge => ({
                        ...edge,
                        type: 'deletableEdge'
                    }));
                    setEdges(dbEdges);
                }
                setTimeout(() => { setIsDirty(false); isLoadedRef.current = true; }, 500);
            })
            .catch(err => {
                console.error("Error loading pipeline:", err);
                alert("Could not load pipeline.");
                isLoadedRef.current = true; 
            });
        } else {
            isLoadedRef.current = true;
        }
    }, [id]);

    useBeforeUnload(
        React.useCallback((e) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        }, [isDirty])
    );

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
        if (isLoadedRef.current) setIsDirty(true);
    }, []);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
        if (isLoadedRef.current) setIsDirty(true);
    }, []);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, type: 'deletableEdge' }, eds));
        if (isLoadedRef.current) setIsDirty(true);
    }, []);

    const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');

            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let defaultData = { label: label };
            // (Keep existing logic for default data...)
            if (type.includes('source')) defaultData.fileType = type.split('_')[1]?.toUpperCase() || 'CSV';
            if (type.includes('dest')) defaultData.destinationType = type.split('_')[1]?.toUpperCase() || 'DB';
            if (type === 'filterNode') { defaultData.column = ''; defaultData.condition = '>'; defaultData.value = ''; }
            if (type === 'vis_chart') { defaultData.chartType = 'bar'; defaultData.x_col = ''; defaultData.y_col = ''; defaultData.outputName = 'my_chart'; }

            const newNode = {
                id: `${type}_${Date.now()}`, 
                type: type, 
                position,
                data: defaultData,
            };

            setNodes((nds) => nds.concat(newNode));
            setIsDirty(true);
        },
        [reactFlowInstance]
    );

    const savePipeline = async () => {
        const flow = { nodes, edges };
        const token = localStorage.getItem('token'); 

        try {
            const payload = { name: pipelineName, flow: flow };
            const url = id ? `http://127.0.0.1:5000/pipelines/${id}` : 'http://127.0.0.1:5000/pipelines';
            const method = id ? axios.put : axios.post;
            
            const res = await method(url, payload, { headers: { Authorization: `Bearer ${token}` } });
            
            // Replaced alert with custom UI logic or just console for now to keep it clean
            alert(id ? 'Pipeline Updated!' : 'Pipeline Created! ID: ' + res.data.id);
            setIsDirty(false); 
            if (!id) navigate(`/builder/${res.data.id}`);

        } catch (error) {
            alert('Error saving pipeline: ' + (error.response?.data?.msg || error.message));
        }
    };

    const handleExport = () => {
        const exportData = { name: pipelineName, nodes: nodes, edges: edges };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${pipelineName.replace(/\s+/g, '_')}_pipeline.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => { fileInputRef.current.click(); };

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (json.nodes && Array.isArray(json.nodes)) {
                    setNodes(json.nodes);
                    const importedEdges = (json.edges || []).map(edge => ({ ...edge, type: 'deletableEdge' }));
                    setEdges(importedEdges);
                    if (json.name) setPipelineName(json.name);
                    setIsDirty(true);
                } else {
                    alert("Invalid JSON format");
                }
            } catch (err) { alert("Failed to parse JSON file."); }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const handleLoadTemplate = (template) => {
        if (nodes.length > 0 && !window.confirm("Loading a template will replace your current canvas. Continue?")) return;
        const idMap = {};
        const timestamp = Date.now();
        const newNodes = template.nodes.map(n => {
            const newId = `${n.id}_${timestamp}`;
            idMap[n.id] = newId;
            return { ...n, id: newId };
        });
        const newEdges = template.edges.map(e => ({
            ...e,
            id: `e_${e.source}_${e.target}_${timestamp}`,
            source: idMap[e.source],
            target: idMap[e.target],
            type: 'deletableEdge'
        }));
        setNodes(newNodes);
        setEdges(newEdges);
        setPipelineName(template.name);
        setIsDirty(true);
        setShowTemplateModal(false);
    };

    const handleRun = async () => {
        if (nodes.length === 0) { alert("Canvas is empty."); return; }
        setIsRunning(true);
        try {
            const payload = {
                nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
                edges: edges.map(e => ({ source: e.source, target: e.target })),
                pipelineId: id 
            };
            const token = localStorage.getItem('token');
            const res = await axios.post('http://127.0.0.1:5000/run-pipeline', payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const logs = res.data.logs && res.data.logs.length > 0 ? res.data.logs.join('\n') : "Pipeline finished successfully.";
            alert(`✅ Success!\n\n${logs}`);
        } catch (error) {
            let errMsg = error.response?.data?.error || error.message;
            if (error.response?.data?.logs) errMsg += `\n\nLogs:\n${error.response.data.logs.join('\n')}`;
            alert(`❌ Execution Failed:\n${errMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f1115' }}>
            
            <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportFile} />

            {/* HEADER */}
            <motion.header 
                style={{ 
                    height: '60px', 
                    background: 'rgba(24, 24, 27, 0.8)', 
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
                    zIndex: 10
                }}
                initial={{ y: -50 }} animate={{ y: 0 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <motion.button 
                        onClick={handleBack} 
                        style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        whileHover={{ color: 'white', x: -3 }}
                    >
                        <ArrowLeft size={18} /> Back
                    </motion.button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                    
                    {/* PIPELINE NAME INPUT */}
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            value={pipelineName} 
                            onChange={(e) => { setPipelineName(e.target.value); setIsDirty(true); }} 
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'white', 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                outline: 'none', 
                                width: '300px' 
                            }} 
                        />
                        {isDirty && (
                            <span style={{ 
                                position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)',
                                fontSize: '11px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' 
                            }}>
                                <AlertCircle size={10} /> Unsaved
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <ActionButton icon={<LayoutTemplate size={16}/>} label="Templates" onClick={() => setShowTemplateModal(true)} />
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }}></div>
                    <ActionButton icon={<Upload size={16}/>} label="Import" onClick={handleImportClick} />
                    <ActionButton icon={<Download size={16}/>} label="Export" onClick={handleExport} />
                    
                    <motion.button 
                        onClick={handleRun} 
                        disabled={isRunning} 
                        className="btn" 
                        style={{ 
                            padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', 
                            background: isRunning ? 'rgba(16, 185, 129, 0.2)' : '#10b981', 
                            color: isRunning ? '#a1a1aa' : 'black', fontWeight: '600',
                            border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer', borderRadius: '6px'
                        }}
                        whileHover={!isRunning ? { scale: 1.05 } : {}}
                        whileTap={!isRunning ? { scale: 0.95 } : {}}
                    >
                        {isRunning ? <Loader2 size={16} className="spin" /> : <Play size={16} fill="black" />}
                        {isRunning ? 'Running...' : 'Run'}
                    </motion.button>

                    <motion.button 
                        className="btn" 
                        onClick={savePipeline} 
                        style={{ 
                            padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', 
                            background: '#3b82f6', color: 'white', fontWeight: '600',
                            border: 'none', cursor: 'pointer', borderRadius: '6px'
                        }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        <Save size={16} /> Save
                    </motion.button>
                </div>
            </motion.header>

            {/* WORKSPACE */}
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', backgroundColor: '#0f1115' }}>
                    <ReactFlow 
                        nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
                        nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}
                        fitView deleteKeyCode={['Backspace', 'Delete']}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="#27272a" gap={25} size={1} />
                        <Controls style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', fill: 'white' }} />
                    </ReactFlow>
                </div>
            </div>

            {/* TEMPLATE GALLERY MODAL */}
            <AnimatePresence>
            {showTemplateModal && (
                <motion.div 
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div 
                        style={{
                            width: '800px', maxHeight: '80vh', backgroundColor: '#18181b',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '22px' }}>Pipeline Templates</h2>
                            <button onClick={() => setShowTemplateModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '5px' }}>
                            {TEMPLATES.map(tpl => (
                                <motion.div 
                                    key={tpl.id} 
                                    onClick={() => handleLoadTemplate(tpl)}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '12px', padding: '20px',
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#3b82f6' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {tpl.name}
                                    </h3>
                                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '13px', lineHeight: '1.5' }}>{tpl.description}</p>
                                    <div style={{ marginTop: '15px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {tpl.nodes.slice(0, 4).map((n, i) => (
                                            <span key={i} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#e4e4e7' }}>
                                                {n.type.split('_')[1] || n.type}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

        </div>
    );
};

// Helper Component for Header Buttons
const ActionButton = ({ icon, label, onClick }) => (
    <motion.button 
        onClick={onClick}
        style={{ 
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#d4d4d8', 
            padding: '8px 12px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
        }}
        whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
        whileTap={{ scale: 0.95 }}
    >
        {icon} {label}
    </motion.button>
);

const PipelineBuilder = () => (<ReactFlowProvider><PipelineBuilderContent /></ReactFlowProvider>);
export default PipelineBuilder;