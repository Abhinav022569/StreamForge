import axios from 'axios';
import React, { useState, useCallback, useRef } from 'react';
import FilterNode from './nodes/FilterNode';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges,
  addEdge,
  ReactFlowProvider // NEW: We need this to calculate positions
} from 'reactflow';
import 'reactflow/dist/style.css'; 

import Sidebar from './Sidebar'; // Import the new sidebar

// Start with an empty canvas now!
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

  // 1. Handle when dragging is hovering over the canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 2. Handle the actual DROP event
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      // Check if the drop is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get the position where the user dropped it
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`, // Give it a unique ID
        type,
        position,
        data: { label: label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Add this function to handle saving
  const savePipeline = async () => {
    // We combine nodes and edges into one object
    const flow = { nodes, edges };
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/pipelines', {
        name: "My First Project", // Hardcoded for now, you can add an input box later
        flow: flow
      });
      alert('Success! Saved with ID: ' + response.data.id);
    } catch (error) {
      alert('Error saving pipeline');
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '80vh', border: '1px solid #ccc' }}>
        <ReactFlowProvider>
            
            {/* Left: The Toolbox */}
            <Sidebar />

            {/* Right: The Canvas */}
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
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
             {/* ... (Your existing Sidebar and ReactFlow code) ... */}
             <Sidebar />
             {/* ... make sure you keep the rest of your layout logic here ... */}
             <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
                  <ReactFlow 
                      nodes={nodes} 
                      edges={edges} 
                      onNodesChange={onNodesChange} 
                      onConnect={onConnect}
                      nodeTypes={nodeTypes} // Don't forget your custom nodes!
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
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance} // Save the instance so we can calculate positions
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    nodeTypes={nodeTypes}
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />
                </ReactFlow>
            </div>

        </ReactFlowProvider>
    </div>
  );
}

export default PipelineBuilder;