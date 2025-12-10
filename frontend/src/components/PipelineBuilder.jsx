import axios from 'axios';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import FilterNode from './nodes/FilterNode';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  addEdge,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css'; 

import Sidebar from './Sidebar'; 

const initialNodes = [];
const nodeTypes = { filterNode: FilterNode };

function PipelineBuilder() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL (if it exists)
  
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [pipelineName, setPipelineName] = useState("My New Pipeline");

  // --- 1. LOAD DATA ON START ---
  useEffect(() => {
    if (id) {
        const token = localStorage.getItem('token');
        axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            const { name, flow } = response.data;
            setPipelineName(name);
            // Restore nodes and edges
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
  }, [id]); // Runs whenever the ID changes

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
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

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`, 
        type,
        position,
        data: { label: label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // --- 2. INTELLIGENT SAVE ---
  const savePipeline = async () => {
    const flow = { nodes, edges };
    const token = localStorage.getItem('token'); 

    try {
      if (id) {
        // UPDATE EXISTING (PUT)
        await axios.put(
            `http://127.0.0.1:5000/pipelines/${id}`, 
            { name: pipelineName, flow: flow },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Pipeline Updated Successfully!');
      } else {
        // CREATE NEW (POST)
        const response = await axios.post(
            'http://127.0.0.1:5000/pipelines', 
            { name: pipelineName, flow: flow },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('New Pipeline Created! ID: ' + response.data.id);
        navigate(`/builder/${response.data.id}`); // Update URL to include new ID
      }
    } catch (error) {
      alert('Error saving pipeline: ' + (error.response?.data?.msg || error.message));
    }
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

        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Run Test</button>
            <button className="btn btn-primary" onClick={savePipeline} style={{ padding: '8px 16px', fontSize: '14px' }}>
                💾 {id ? 'Update' : 'Save'}
            </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div style={{ display: 'flex', flexGrow: 1 }}>
         <ReactFlowProvider>
             <Sidebar />
             <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', backgroundColor: '#0f1115' }}>
                  <ReactFlow 
                      nodes={nodes} 
                      edges={edges} 
                      onNodesChange={onNodesChange} 
                      onConnect={onConnect}
                      nodeTypes={nodeTypes} 
                      onInit={setReactFlowInstance}
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      fitView
                  >
                      <Background color="#3f3f46" gap={20} size={1} />
                      <Controls style={{ fill: '#fff' }} />
                  </ReactFlow>
             </div>
         </ReactFlowProvider>
      </div>
    </div>
  );
}

export default PipelineBuilder;