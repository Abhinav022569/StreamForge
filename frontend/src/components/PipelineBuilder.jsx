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

import Sidebar from './Sidebar';

// Custom Components
import FilterNode from './nodes/FilterNode';
import SourceNode from './nodes/SourceNode';           
import DestinationNode from './nodes/DestinationNode'; 
import DeletableEdge from './edges/DeletableEdge';    

// IMPORT ALL TRANSFORMATIONS (Consolidated Import)
import { 
    SortNode, SelectNode, RenameNode, DedupeNode, FillNaNode, GroupByNode, JoinNode,
    CastNode, StringNode, CalcNode, LimitNode, ConstantNode, ChartNode 
} from './nodes/Transformations';

// IMPORT TEMPLATES
import { TEMPLATES } from '../data/templates';

const initialNodes = [];

const PipelineBuilderContent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const reactFlowWrapper = useRef(null);
    // Reference for the hidden file input
    const fileInputRef = useRef(null);
    const { getNodes, getEdges } = useReactFlow(); 

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [pipelineName, setPipelineName] = useState("My New Pipeline");
    const [isRunning, setIsRunning] = useState(false); 
    
    // NEW: Template Modal State
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    
    // NEW: Track unsaved changes
    const [isDirty, setIsDirty] = useState(false);
    
    // Ref to track if initial load is complete to prevent false dirty states
    const isLoadedRef = useRef(false);

    // --- 1. REGISTER NODE TYPES ---
    const nodeTypes = useMemo(() => ({ 
        filterNode: FilterNode,
        source_csv: SourceNode, source_json: SourceNode, source_excel: SourceNode, sourceNode: SourceNode, 
        dest_db: DestinationNode, dest_csv: DestinationNode, dest_json: DestinationNode, dest_excel: DestinationNode, destinationNode: DestinationNode,

        // TRANSFORMATIONS
        trans_sort: SortNode,
        trans_select: SelectNode,
        trans_rename: RenameNode,
        trans_dedupe: DedupeNode,
        trans_fillna: FillNaNode,
        trans_group: GroupByNode,
        trans_join: JoinNode,
        
        // ADVANCED NODES
        trans_cast: CastNode,
        trans_string: StringNode,
        trans_calc: CalcNode,
        trans_limit: LimitNode,
        trans_constant: ConstantNode,
        
        // VISUALIZATION
        vis_chart: ChartNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        deletableEdge: DeletableEdge
    }), []);

    // Load Data
    useEffect(() => {
        if (id) {
            isLoadedRef.current = false; // Reset on ID change
            const token = localStorage.getItem('token');
            axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const { name, flow } = response.data;
                setPipelineName(name);
                if (flow) {
                    setNodes(flow.nodes || []);
                    // Ensure edges from DB also have the correct type
                    const dbEdges = (flow.edges || []).map(edge => ({
                        ...edge,
                        type: 'deletableEdge'
                    }));
                    setEdges(dbEdges);
                }
                
                // Delay enabling dirty tracking to allow ReactFlow to settle initial dimensions
                setTimeout(() => {
                    setIsDirty(false);
                    isLoadedRef.current = true;
                }, 500);
            })
            .catch(err => {
                console.error("Error loading pipeline:", err);
                alert("Could not load pipeline.");
                isLoadedRef.current = true; // Enable anyway so user can retry/edit
            });
        } else {
            // New Pipeline
            isLoadedRef.current = true;
        }
    }, [id]);

    // NEW: Handle Browser Reload/Close Warning
    useBeforeUnload(
        React.useCallback(
            (e) => {
                if (isDirty) {
                    e.preventDefault();
                    e.returnValue = ''; // Trigger browser warning
                }
            },
            [isDirty]
        )
    );

    // NEW: Handle "Back" Button Click
    const handleBack = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    // Handlers (Set Dirty to True on changes, guarded by isLoadedRef)
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

    // --- 2. DROP HANDLER ---
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

            // Default Data
            let defaultData = { label: label };

            if (type.includes('source')) defaultData.fileType = type.split('_')[1]?.toUpperCase() || 'CSV';
            if (type.includes('dest')) defaultData.destinationType = type.split('_')[1]?.toUpperCase() || 'DB';
            if (type === 'filterNode') { defaultData.column = ''; defaultData.condition = '>'; defaultData.value = ''; }

            // Existing Trans Defaults
            if (type === 'trans_sort') { defaultData.column = ''; defaultData.order = 'true'; }
            if (type === 'trans_select') { defaultData.columns = ''; }
            if (type === 'trans_rename') { defaultData.oldName = ''; defaultData.newName = ''; }
            if (type === 'trans_fillna') { defaultData.column = ''; defaultData.value = ''; }
            if (type === 'trans_group') { defaultData.groupCol = ''; defaultData.targetCol = ''; defaultData.operation = 'sum'; }
            if (type === 'trans_join') { defaultData.key = ''; defaultData.how = 'inner'; }

            // NEW TRANS DEFAULTS
            if (type === 'trans_cast') { defaultData.column = ''; defaultData.targetType = 'string'; }
            if (type === 'trans_string') { defaultData.column = ''; defaultData.operation = 'upper'; }
            if (type === 'trans_calc') { defaultData.colA = ''; defaultData.colB = ''; defaultData.op = '+'; defaultData.newCol = 'Result'; }
            if (type === 'trans_limit') { defaultData.limit = 100; }
            if (type === 'trans_constant') { defaultData.colName = 'New_Col'; defaultData.value = 'Value'; }
            
            // CHART DEFAULT
            if (type === 'vis_chart') { 
                defaultData.chartType = 'bar'; 
                defaultData.x_col = ''; 
                defaultData.y_col = '';
                defaultData.outputName = 'my_chart';
            }

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
            
            alert(id ? 'Pipeline Updated!' : 'Pipeline Created! ID: ' + res.data.id);
            setIsDirty(false); // Reset dirty state on save
            if (!id) navigate(`/builder/${res.data.id}`);

        } catch (error) {
            alert('Error saving pipeline: ' + (error.response?.data?.msg || error.message));
        }
    };

    const deleteSelected = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        setIsDirty(true);
    };

    // --- IMPORT / EXPORT HANDLERS ---

    const handleExport = () => {
        const exportData = {
            name: pipelineName,
            nodes: nodes,
            edges: edges
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${pipelineName.replace(/\s+/g, '_')}_pipeline.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                
                // Basic validation
                if (json.nodes && Array.isArray(json.nodes)) {
                    // Update state
                    setNodes(json.nodes);
                    
                    // FIX: Force edges to be 'deletableEdge' type
                    const importedEdges = (json.edges || []).map(edge => ({
                        ...edge,
                        type: 'deletableEdge' // <--- THIS LINE ADDS THE CROSS
                    }));
                    setEdges(importedEdges);

                    if (json.name) setPipelineName(json.name);
                    
                    setIsDirty(true);
                    alert("Pipeline imported successfully!");
                } else {
                    alert("Invalid JSON format: Missing 'nodes' array.");
                }
            } catch (err) {
                console.error("Error parsing JSON:", err);
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
        // Reset so same file can be selected again
        event.target.value = null;
    };

    // --- TEMPLATE HANDLER ---
    const handleLoadTemplate = (template) => {
        if (nodes.length > 0) {
            if (!window.confirm("Loading a template will replace your current canvas. Continue?")) return;
        }

        // Generate unique IDs for the template nodes to avoid conflict on re-import
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
        if (nodes.length === 0) {
            alert("Canvas is empty. Add some nodes first!");
            return;
        }

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

            console.log("Run Success:", res.data);
            const logs = res.data.logs && res.data.logs.length > 0 ? res.data.logs.join('\n') : "Pipeline finished successfully.";
            alert(`✅ Success!\n\n${logs}`);

        } catch (error) {
            console.error("Run Error:", error);
            let errMsg = "Unknown error";
            if (error.response && error.response.data) {
                errMsg = error.response.data.error || JSON.stringify(error.response.data);
                if (error.response.data.logs) errMsg += `\n\nLogs:\n${error.response.data.logs.join('\n')}`;
            } else if (error.message) {
                errMsg = error.message;
            }
            alert(`❌ Execution Failed:\n${errMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f1115' }}>
            
            {/* Hidden Input for Import */}
            <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImportFile}
            />

            {/* HEADER */}
            <header style={{ height: '60px', borderBottom: '1px solid #27272a', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={handleBack} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>← Back</button>
                    <div style={{ width: '1px', height: '20px', background: '#3f3f46' }}></div>
                    
                    {/* PIPELINE NAME BOX (ENCLOSED) */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: '#27272a', 
                        border: '1px solid #3f3f46', 
                        borderRadius: '6px', 
                        padding: '4px 12px' 
                    }}>
                        <input 
                            type="text" 
                            value={pipelineName} 
                            onChange={(e) => { setPipelineName(e.target.value); setIsDirty(true); }} 
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'white', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                outline: 'none', 
                                width: '250px' 
                            }} 
                        />
                        {isDirty && <span style={{ fontSize: '12px', color: '#fbbf24', marginLeft: '10px' }}>● Unsaved</span>}
                    </div>

                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    
                    {/* NEW: Templates Button */}
                    <button 
                        onClick={() => setShowTemplateModal(true)} 
                        style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#60a5fa', padding: '8px 16px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px' }}
                        title="Load from Template"
                    >
                        📋 Templates
                    </button>

                    <div style={{ width: '1px', height: '20px', background: '#3f3f46', alignSelf: 'center' }}></div>

                    {/* Import/Export Buttons */}
                    <button 
                        onClick={handleImportClick} 
                        style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '8px 16px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Import JSON pipeline file"
                    >
                        📥 Import
                    </button>
                    <button 
                        onClick={handleExport} 
                        style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '8px 16px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Export pipeline to JSON"
                    >
                        📤 Export
                    </button>

                    <button onClick={handleRun} disabled={isRunning} className="btn btn-success" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', opacity: isRunning ? 0.7 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}>{isRunning ? '⏳ Running...' : '▶ Run Pipeline'}</button>
                    <button className="btn btn-primary" onClick={savePipeline} style={{ padding: '8px 16px', fontSize: '14px' }}>💾 {id ? 'Update' : 'Save'}</button>
                </div>
            </header>

            {/* WORKSPACE */}
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', backgroundColor: '#0f1115' }}>
                    <ReactFlow 
                        nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
                        nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}
                        fitView deleteKeyCode={['Backspace', 'Delete']}
                    >
                        <Background color="#3f3f46" gap={20} size={1} />
                        <Controls style={{ fill: '#fff' }} />
                    </ReactFlow>
                </div>
            </div>

            {/* TEMPLATE GALLERY MODAL */}
            {showTemplateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        width: '800px', maxHeight: '80vh', backgroundColor: '#18181b',
                        border: '1px solid #3f3f46', borderRadius: '12px', padding: '24px',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Pipeline Templates</h2>
                            <button onClick={() => setShowTemplateModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '4px' }}>
                            {TEMPLATES.map(tpl => (
                                <div 
                                    key={tpl.id} 
                                    onClick={() => handleLoadTemplate(tpl)}
                                    style={{
                                        backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', padding: '16px',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    className="template-card"
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.backgroundColor = '#3f3f46'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.backgroundColor = '#27272a'; }}
                                >
                                    <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '16px' }}>{tpl.name}</h3>
                                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px', lineHeight: '1.4' }}>{tpl.description}</p>
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                        {tpl.nodes.slice(0, 3).map((n, i) => (
                                            <span key={i} style={{ fontSize: '10px', background: '#52525b', padding: '2px 6px', borderRadius: '4px', color: '#e4e4e7' }}>
                                                {n.type.replace('trans_', '').replace('source_', '').replace('dest_', '')}
                                            </span>
                                        ))}
                                        {tpl.nodes.length > 3 && <span style={{ fontSize: '10px', color: '#9ca3af' }}>+{tpl.nodes.length - 3} more</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const PipelineBuilder = () => (<ReactFlowProvider><PipelineBuilderContent /></ReactFlowProvider>);
export default PipelineBuilder;