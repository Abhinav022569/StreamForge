import axios from 'axios';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// IMPORT ALL TRANSFORMATIONS
import { 
    SortNode, SelectNode, RenameNode, DedupeNode, FillNaNode, GroupByNode, JoinNode,
    CastNode, StringNode, CalcNode, LimitNode, ConstantNode 
} from './nodes/Transformations';

const initialNodes = [];

const PipelineBuilderContent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const reactFlowWrapper = useRef(null);
    const { getNodes, getEdges } = useReactFlow(); 

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [pipelineName, setPipelineName] = useState("My New Pipeline");
    const [isRunning, setIsRunning] = useState(false); 

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
        
        // NEW NODES
        trans_cast: CastNode,
        trans_string: StringNode,
        trans_calc: CalcNode,
        trans_limit: LimitNode,
        trans_constant: ConstantNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        deletableEdge: DeletableEdge
    }), []);

    // Load Data
    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const { name, flow } = response.data;
                setPipelineName(name);
                if (flow) {
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                }
            })
            .catch(err => {
                console.error("Error loading pipeline:", err);
                alert("Could not load pipeline.");
            });
        }
    }, [id]);

    // Handlers
    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'deletableEdge' }, eds)), []);
    const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

    // --- 2. UPDATED DROP HANDLER ---
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

            const newNode = {
                id: `${type}_${Date.now()}`, 
                type: type, 
                position,
                data: defaultData,
            };

            setNodes((nds) => nds.concat(newNode));
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
            if (!id) navigate(`/builder/${res.data.id}`);

        } catch (error) {
            alert('Error saving pipeline: ' + (error.response?.data?.msg || error.message));
        }
    };

    const deleteSelected = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
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
            
            {/* HEADER */}
            <header style={{ height: '60px', borderBottom: '1px solid #27272a', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>← Back</button>
                    <div style={{ width: '1px', height: '20px', background: '#3f3f46' }}></div>
                    <input type="text" value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', fontWeight: '600', outline: 'none', width: '300px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={deleteSelected} style={{ background: '#27272a', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete Selected</button>
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
        </div>
    );
};

const PipelineBuilder = () => (<ReactFlowProvider><PipelineBuilderContent /></ReactFlowProvider>);
export default PipelineBuilder;