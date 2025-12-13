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

    // Register Types
    const nodeTypes = useMemo(() => ({ 
        filterNode: FilterNode,
        sourceNode: SourceNode,          
        destinationNode: DestinationNode 
    }), []);

    const edgeTypes = useMemo(() => ({
        deletableEdge: DeletableEdge
    }), []);

    // Load Data if editing an existing pipeline
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
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'deletableEdge' }, eds)),
        []
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // --- DROP HANDLER (Maps Sidebar Items to Nodes) ---
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

            // Default Values
            let nodeType = type;
            let fileType = 'CSV';         // For Sources
            let destinationType = 'DB';   // For Destinations

            // 1. Handle Sources
            if (type.startsWith('source_')) {
                nodeType = 'sourceNode';
                if (type === 'source_csv') fileType = 'CSV';
                if (type === 'source_json') fileType = 'JSON';
                if (type === 'source_excel') fileType = 'Excel';
            }
            
            // 2. Handle Destinations
            else if (type.startsWith('dest_')) {
                nodeType = 'destinationNode';
                if (type === 'dest_csv') destinationType = 'CSV';
                if (type === 'dest_json') destinationType = 'JSON';
                if (type === 'dest_excel') destinationType = 'Excel';
                if (type === 'dest_db') destinationType = 'DB';
            }
            
            // 3. Handle Legacy/Other Types
            else if (type === 'input') { nodeType = 'sourceNode'; } 
            else if (type === 'output') { nodeType = 'destinationNode'; }

            const newNode = {
                id: `node_${Date.now()}`, 
                type: nodeType,
                position,
                data: { 
                    label: label, 
                    fileType: fileType,             // For SourceNode
                    destinationType: destinationType // For DestinationNode
                },
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

    const handleRun = () => {
        alert("Run functionality coming soon! This will trigger the backend execution.");
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f1115' }}>
            
            {/* HEADER */}
            <header style={{ 
                height: '60px', 
                borderBottom: '1px solid #27272a', 
                backgroundColor: '#18181b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0 20px'
            }}>
                {/* LEFT: Back & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        ← Back
                    </button>
                    <div style={{ width: '1px', height: '20px', background: '#3f3f46' }}></div>
                    <input 
                        type="text" 
                        value={pipelineName} 
                        onChange={(e) => setPipelineName(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', fontWeight: '600', outline: 'none', width: '300px' }}
                    />
                </div>

                {/* RIGHT: Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={deleteSelected}
                        style={{ 
                            background: '#27272a', 
                            border: '1px solid #ef4444', 
                            color: '#ef4444', 
                            padding: '8px 16px', 
                            fontSize: '14px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Delete Selected
                    </button>

                    <button 
                        onClick={handleRun}
                        style={{ 
                            background: '#3f3f46', 
                            border: '1px solid #52525b', 
                            color: 'white', 
                            padding: '8px 16px', 
                            fontSize: '14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        ▶ Run Test
                    </button>

                    <button className="btn btn-primary" onClick={savePipeline} style={{ padding: '8px 16px', fontSize: '14px' }}>
                        💾 {id ? 'Update' : 'Save'}
                    </button>
                </div>
            </header>

            {/* WORKSPACE */}
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', backgroundColor: '#0f1115' }}>
                    <ReactFlow 
                        nodes={nodes} 
                        edges={edges} 
                        onNodesChange={onNodesChange} 
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes} 
                        edgeTypes={edgeTypes}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        deleteKeyCode={['Backspace', 'Delete']}
                    >
                        <Background color="#3f3f46" gap={20} size={1} />
                        <Controls style={{ fill: '#fff' }} />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

const PipelineBuilder = () => (
    <ReactFlowProvider>
        <PipelineBuilderContent />
    </ReactFlowProvider>
);

export default PipelineBuilder;