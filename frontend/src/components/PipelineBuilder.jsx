import axios from 'axios';
import React, { useState, useCallback, useRef } from 'react';
import FilterNode from './nodes/FilterNode';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges,
  addEdge,
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css'; 

import Sidebar from './Sidebar'; 

const initialNodes = [];
const nodeTypes = { filterNode: FilterNode };

function PipelineBuilder() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

  const savePipeline = async () => {
    const flow = { nodes, edges };
    const token = localStorage.getItem('token'); // Get the token

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/pipelines', 
        {
          name: "My First Project", 
          flow: flow
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Success! Saved with ID: ' + response.data.id);
    } catch (error) {
      alert('Error saving pipeline: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* The Toolbar */}
      <div style={{ padding: '10px', background: '#eee', borderBottom: '1px solid #ccc' }}>
        <button onClick={savePipeline} style={{ padding: '5px 15px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
            💾 Save Pipeline
        </button>
      </div>

      {/* The Existing Editor */}
      <div style={{ display: 'flex', flexGrow: 1 }}>
         <ReactFlowProvider>
             <Sidebar />
             <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
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
                      <Background color="#aaa" gap={16} />
                      <Controls />
                  </ReactFlow>
             </div>
         </ReactFlowProvider>
      </div>
    </div>
  );
}

export default PipelineBuilder;