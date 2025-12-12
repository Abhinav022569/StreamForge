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

            // Map Drag Types to Custom Node Types
            let nodeType = type;
            if (type === 'input') nodeType = 'sourceNode';
            if (type === 'output') nodeType = 'destinationNode';

            const newNode = {
                id: `node_${Date.now()}`, 
                type: nodeType,
                position,
                data: { label: label },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    const savePipeline = async () => {
        const flow = { nodes, edges };
        const token = localStorage.getItem('token'); 

        try {
            if (id) {
                await axios.put(
                    `http://127.0.0.1:5000/pipelines/${id}`, 
                    { name: pipelineName, flow: flow },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Pipeline Updated Successfully!');
            } else {
                const response = await axios.post(
                    'http://127.0.0.1:5000/pipelines', 
                    { name: pipelineName, flow: flow },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('New Pipeline Created! ID: ' + response.data.id);
                navigate(`/builder/${response.data.id}`);
            }
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
                    
                    {/* 1. Delete Button */}
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

                    {/* 2. Run Test Button (RESTORED) */}
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

                    {/* 3. Save Button */}
                    <button 
                        className="btn btn-primary" 
                        onClick={savePipeline} 
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                        💾 {id ? 'Update' : 'Save'}
                    </button>
                </div>
            </header>

            {/* WORKSPACE */}
            <div style={{ display: 'flex', flexGrow: 1 }}>
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