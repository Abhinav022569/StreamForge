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
  useReactFlow,
  useViewport 
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client'; 
import { 
  ArrowLeft, LayoutTemplate, Upload, Download, Play, Save, 
  Loader2, AlertCircle, CheckCircle2, X, Info, MousePointer2, Clock, Menu, Eye, Wand2, Calendar
} from 'lucide-react';

import Sidebar from './Sidebar';
import DataPreviewPanel from './DataPreviewPanel';

// Custom Components
import FilterNode from './nodes/FilterNode';
import SourceNode from './nodes/SourceNode';           
import DestinationNode from './nodes/DestinationNode'; 
import DeletableEdge from './edges/DeletableEdge';    

// IMPORT ALL TRANSFORMATIONS
import { 
    SortNode, SelectNode, RenameNode, DedupeNode, FillNaNode, GroupByNode, JoinNode,
    CastNode, StringNode, CalcNode, LimitNode, ConstantNode, ChartNode, PythonNode 
} from './nodes/Transformations';

import { TEMPLATES } from '../data/templates';

// Helper to generate consistent colors for users
const getUserColor = (username) => {
    const safeName = username || 'Anonymous';
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Cursor Component
const RemoteCursor = ({ x, y, name, color }) => (
    <div style={{ 
        position: 'absolute', 
        left: x, 
        top: y, 
        pointerEvents: 'none', 
        zIndex: 1000,
        transition: 'all 0.1s ease'
    }}>
        <MousePointer2 size={18} fill={color} color="white" />
        <div style={{ 
            backgroundColor: color, 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '10px', 
            whiteSpace: 'nowrap',
            marginLeft: '12px',
            marginTop: '2px',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            {name}
        </div>
    </div>
);

// Cursor Renderer Component
const CursorsRenderer = ({ cursors }) => {
    const { x, y, zoom } = useViewport();

    return (
        <>
            {Object.entries(cursors).map(([userId, cursor]) => (
                <RemoteCursor 
                    key={userId} 
                    x={cursor.x * zoom + x} 
                    y={cursor.y * zoom + y} 
                    name={cursor.name} 
                    color={cursor.color} 
                />
            ))}
        </>
    );
};

const initialNodes = [];

// --- NEW: Schedule Modal Component ---
const ScheduleModal = ({ isOpen, onClose, onSave, currentSchedule }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState('daily'); // 'daily' or 'date'
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState('');

  // Initialize state when modal opens
  useEffect(() => {
    if (currentSchedule) {
      if (currentSchedule.startsWith('cron:')) {
        setMode('daily');
        const [_, val] = currentSchedule.split(':', 1); // Split only first colon? No, wait. cron:HH:MM
        // Correct splitting for cron:HH:MM
        const parts = currentSchedule.split(':');
        if (parts.length >= 3) {
             setTime(`${parts[1]}:${parts[2]}`);
        }
      } else if (currentSchedule.startsWith('date:')) {
        setMode('date');
        // date:YYYY-MM-DD HH:MM:SS
        // Remove "date:" prefix
        const raw = currentSchedule.substring(5);
        const [d, t] = raw.split(' ');
        setDate(d);
        if(t) setTime(t.slice(0, 5));
      }
    }
  }, [currentSchedule]);

  const handleSave = () => {
    if (mode === 'daily') {
      onSave('cron', time);
    } else {
      if (!date || !time) return alert("Please select both date and time");
      const formattedDate = `${date} ${time}:00`;
      onSave('date', formattedDate);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#18181b', padding: '30px', borderRadius: '16px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
            <Clock size={20} color="#a78bfa" /> Schedule Pipeline
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Toggle Switches */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
          <button 
            onClick={() => setMode('daily')}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: mode === 'daily' ? '#27272a' : 'transparent',
              color: mode === 'daily' ? '#fff' : '#a1a1aa',
              boxShadow: mode === 'daily' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            Run Daily
          </button>
          <button 
            onClick={() => setMode('date')}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: mode === 'date' ? '#27272a' : 'transparent',
              color: mode === 'date' ? '#fff' : '#a1a1aa',
              boxShadow: mode === 'date' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            Specific Date
          </button>
        </div>

        <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px' }}>
          {mode === 'daily' ? 'Run this pipeline automatically every day at a specific time.' : 'Run this pipeline exactly once on a specific date.'}
        </p>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Date Picker (Only for Specific Date mode) */}
          {mode === 'date' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ 
                    width: '100%', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'white', outline: 'none' 
                  }}
                />
              </div>
            </div>
          )}

          {/* Time Picker (Always visible) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>Time (Server Time)</label>
            <div style={{ position: 'relative' }}>
              <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ 
                  width: '100%', background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'white', outline: 'none' 
                }}
              />
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#e4e4e7', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button 
            onClick={handleSave}
            style={{ 
              background: '#3b82f6', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
            }}
          >
            Save Schedule
          </button>
        </div>

      </div>
    </div>
  );
};
// ------------------------------------

const PipelineBuilderContent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const reactFlowWrapper = useRef(null);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null); 
    
    const { getNodes, getEdges, screenToFlowPosition } = useReactFlow(); 

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [pipelineName, setPipelineName] = useState("My New Pipeline");
    const [isRunning, setIsRunning] = useState(false); 
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null); 
    
    // --- RESPONSIVE STATE ---
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isToolboxOpen, setIsToolboxOpen] = useState(!isMobile);
    
    // --- SCHEDULING STATE ---
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [currentScheduleStr, setCurrentScheduleStr] = useState(''); // Store the string from DB to pass to modal
    
    // --- AI MODAL STATE ---
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [isDirty, setIsDirty] = useState(false);
    const isLoadedRef = useRef(false);

    // --- Remote Cursors State ---
    const [remoteCursors, setRemoteCursors] = useState({});
    const lastCursorUpdate = useRef(0);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsToolboxOpen(true);
            else if (mobile) setIsToolboxOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getUserInfo = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                return { 
                    name: parsed.username || 'Anonymous', 
                    id: parsed.id ? String(parsed.id) : `user_${Date.now()}` 
                };
            } catch (e) {
                console.error("Failed to parse user info", e);
            }
        }
        return { name: 'Anonymous', id: `user_${Date.now()}` };
    };

    const currentUser = useRef(getUserInfo());
    const myColor = useMemo(() => getUserColor(currentUser.current.name), []);

    // --- Preview Panel State ---
    const [previewPanel, setPreviewPanel] = useState({ 
        isOpen: false, loading: false, data: [], columns: [], error: null, nodeLabel: '' 
    });

    const [notification, setNotification] = useState(null); 

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const updateNodeData = useCallback((nodeId, newData) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
        setIsDirty(true);
    }, []);

    const nodeTypes = useMemo(() => ({ 
        filterNode: FilterNode,
        source_unified: SourceNode,
        source_csv: SourceNode, source_json: SourceNode, source_excel: SourceNode, sourceNode: SourceNode, 
        dest_db: DestinationNode, dest_csv: DestinationNode, dest_json: DestinationNode, dest_excel: DestinationNode, destinationNode: DestinationNode,
        trans_sort: SortNode, trans_select: SelectNode, trans_rename: RenameNode, trans_dedupe: DedupeNode,
        trans_fillna: FillNaNode, trans_group: GroupByNode, trans_join: JoinNode,
        trans_cast: CastNode, trans_string: StringNode, trans_calc: CalcNode, trans_limit: LimitNode,
        trans_constant: ConstantNode, vis_chart: ChartNode, trans_python: PythonNode
    }), []);

    const edgeTypes = useMemo(() => ({ deletableEdge: DeletableEdge }), []);

    // --- Socket.IO Connection ---
    useEffect(() => {
        if (!id) return; 

        socketRef.current = io('http://127.0.0.1:5000');
        socketRef.current.emit('join_pipeline', { pipeline_id: id });

        socketRef.current.on('pipeline_updated', (data) => {
            if (data.type === 'node_change') {
                setNodes((nds) => applyNodeChanges(data.changes, nds));
            } else if (data.type === 'edge_change') {
                setEdges((eds) => applyEdgeChanges(data.changes, eds));
            } else if (data.type === 'connection') {
                setEdges((eds) => addEdge({ ...data.changes, type: 'deletableEdge' }, eds));
            }
        });

        socketRef.current.on('cursor_moved', (data) => {
            setRemoteCursors((prev) => ({
                ...prev,
                [data.userId]: { x: data.x, y: data.y, name: data.userName, color: data.color }
            }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave', { pipeline_id: id });
                socketRef.current.disconnect();
            }
        };
    }, [id]);

    const onMouseMove = useCallback((event) => {
        if (!reactFlowInstance || !socketRef.current) return;

        const now = Date.now();
        if (now - lastCursorUpdate.current > 50) { 
            const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });

            socketRef.current.emit('cursor_move', {
                pipelineId: id,
                userId: currentUser.current.id,
                userName: currentUser.current.name,
                color: myColor,
                x: flowPos.x,
                y: flowPos.y
            });
            lastCursorUpdate.current = now;
        }
    }, [reactFlowInstance, id, screenToFlowPosition, myColor]);

    useEffect(() => {
        if (id) {
            isLoadedRef.current = false; 
            const token = localStorage.getItem('token');
            axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const { name, flow, schedule } = response.data;
                setPipelineName(name);
                setCurrentScheduleStr(schedule); // Store raw schedule string

                if (flow) {
                    const loadedNodes = (flow.nodes || []).map(n => ({
                        ...n,
                        data: { ...n.data, onUpdate: updateNodeData }
                    }));
                    setNodes(loadedNodes);
                    
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
                showToast("Could not load pipeline.", "error");
                isLoadedRef.current = true; 
            });
        } else {
            isLoadedRef.current = true;
        }
    }, [id, updateNodeData]);

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
        const selectionChange = changes.find(c => c.type === 'select');
        if (selectionChange && !selectionChange.selected) {
             if (selectedNode && selectedNode.id === selectionChange.id) {
                 setSelectedNode(null);
             }
        }

        if (isLoadedRef.current) setIsDirty(true);

        if (socketRef.current && id) {
            socketRef.current.emit('pipeline_update', {
                pipelineId: id, type: 'node_change', changes: changes
            });
        }
    }, [id, selectedNode]);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
        if (isLoadedRef.current) setIsDirty(true);

        if (socketRef.current && id) {
            socketRef.current.emit('pipeline_update', {
                pipelineId: id, type: 'edge_change', changes: changes
            });
        }
    }, [id]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, type: 'deletableEdge' }, eds));
        if (isLoadedRef.current) setIsDirty(true);

        if (socketRef.current && id) {
            socketRef.current.emit('pipeline_update', {
                pipelineId: id, type: 'connection', changes: params
            });
        }
    }, [id]);

    const fetchPreview = async (node) => {
        if (!node) return;
        setPreviewPanel({
            isOpen: true,
            loading: true,
            data: [],
            columns: [],
            error: null,
            nodeLabel: node.data.label || node.type
        }); 

        const token = localStorage.getItem('token');
        const currentNodes = getNodes(); 
        const currentEdges = getEdges();

        try {
            const payload = {
                targetNodeId: node.id,
                nodes: currentNodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
                edges: currentEdges.map(e => ({ source: e.source, target: e.target }))
            };

            const res = await axios.post('http://127.0.0.1:5000/preview-node', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let previewData = res.data.data || [];
            let previewColumns = res.data.columns || [];

            if (previewData.length === 0) {
                 let msg = "No data returned from server.";
                 if (node.type.includes('source')) {
                     msg = "Source preview empty (Lazy Loaded). Add a transformation to see data.";
                     showToast(msg, "info");
                 } else {
                     showToast("No data returned for this node.", "info");
                 }
                 
                 setPreviewPanel(prev => ({
                    ...prev,
                    loading: false,
                    data: [],
                    columns: [],
                    error: msg
                 }));
            } else {
                 setPreviewPanel(prev => ({
                    ...prev,
                    loading: false,
                    data: previewData,
                    columns: previewColumns,
                    error: null
                 }));
            }

        } catch (err) {
            console.error("Preview error:", err);
            setPreviewPanel(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.error || "Failed to fetch preview."
            }));
        }
    };

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
        setPreviewPanel(prev => ({ ...prev, isOpen: false }));
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault(); 
        setSelectedNode(node); 
        fetchPreview(node);
    }, [getNodes, getEdges]);

    const handleToolbarPreview = () => {
        if (selectedNode) {
            fetchPreview(selectedNode);
        } else {
            showToast("Please select a node to preview", "info");
        }
    };

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
            
            if (type.includes('source') || type === 'sourceNode' || type === 'source_unified') {
                defaultData.fileType = 'UNIFIED'; 
            }
            if (type.includes('dest')) defaultData.destinationType = type.split('_')[1]?.toUpperCase() || 'DB';
            if (type === 'filterNode') { defaultData.column = ''; defaultData.condition = '>'; defaultData.value = ''; }
            if (type === 'vis_chart') { defaultData.chartType = 'bar'; defaultData.x_col = ''; defaultData.y_col = ''; defaultData.outputName = 'my_chart'; }
            if (type === 'trans_python') { defaultData.code = "df['new_col'] = df['old_col'] * 2"; }

            defaultData.onUpdate = updateNodeData;

            const newNode = {
                id: `${type}_${Date.now()}`, 
                type: type, 
                position,
                data: defaultData,
            };

            setNodes((nds) => nds.concat(newNode));
            setIsDirty(true);
            setSelectedNode(newNode); 
            
            if (isMobile) setIsToolboxOpen(false);
        },
        [reactFlowInstance, updateNodeData, isMobile]
    );

    const savePipeline = async () => {
        const currentNodes = getNodes(); 
        const currentEdges = getEdges();
        
        const flow = { nodes: currentNodes, edges: currentEdges };
        const token = localStorage.getItem('token'); 

        try {
            const payload = { name: pipelineName, flow: flow };
            const url = id ? `http://127.0.0.1:5000/pipelines/${id}` : 'http://127.0.0.1:5000/pipelines';
            const method = id ? axios.put : axios.post;
            
            const res = await method(url, payload, { headers: { Authorization: `Bearer ${token}` } });
            
            showToast(id ? 'Pipeline Updated Successfully!' : 'Pipeline Created Successfully!', 'success');
            setIsDirty(false); 
            if (!id) navigate(`/builder/${res.data.id}`);

        } catch (error) {
            showToast('Error saving pipeline: ' + (error.response?.data?.msg || error.message), 'error');
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://127.0.0.1:5000/api/generate_pipeline', 
                { prompt: aiPrompt },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            
            const data = res.data;
            
            if (data.nodes && data.edges) {
                const newNodes = data.nodes.map(n => ({
                    ...n,
                    data: { ...n.data, onUpdate: updateNodeData }
                }));
                const newEdges = data.edges.map(e => ({ ...e, type: 'deletableEdge', animated: true }));

                setNodes(newNodes);
                setEdges(newEdges);
                setShowAIModal(false);
                setAiPrompt("");
                setIsDirty(true);
                showToast("Pipeline generated from text!", "success");
            } else if (data.error) {
                showToast(`AI Error: ${data.error}`, "error");
            } else {
                showToast("AI could not generate a valid pipeline. Try a more specific prompt.", "error");
            }
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.error || error.message || "Connection failed";
            showToast(`Server Error: ${errMsg}`, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- SCHEDULING LOGIC (UPDATED) ---
    const saveSchedule = async (type, value) => {
        try {
            const token = localStorage.getItem('token');
            if (!id) {
                showToast("Please save the pipeline first.", "error");
                return;
            }
            
            await axios.post(`http://127.0.0.1:5000/pipelines/${id}/schedule`, {
                type: type,
                value: value
            }, { headers: { Authorization: `Bearer ${token}` }});
            
            setCurrentScheduleStr(`${type}:${value}`); // Update local state
            showToast('Schedule Saved!', 'success');
            setShowScheduleModal(false);
        } catch (err) {
            console.error(err);
            showToast('Failed to save schedule', 'error');
        }
    };
    // ----------------------------------

    const handleExport = () => {
        const currentNodes = getNodes(); 
        const currentEdges = getEdges();
        const exportData = { name: pipelineName, nodes: currentNodes, edges: currentEdges };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${pipelineName.replace(/\s+/g, '_')}_pipeline.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Pipeline exported to JSON", 'info');
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
                    const importedNodes = json.nodes.map(n => ({
                        ...n,
                        data: { ...n.data, onUpdate: updateNodeData }
                    }));
                    setNodes(importedNodes);
                    
                    const importedEdges = (json.edges || []).map(edge => ({ ...edge, type: 'deletableEdge' }));
                    setEdges(importedEdges);
                    if (json.name) setPipelineName(json.name);
                    setIsDirty(true);
                    showToast("Pipeline imported successfully!", 'success');
                } else {
                    showToast("Invalid JSON format", 'error');
                }
            } catch (err) { showToast("Failed to parse JSON file.", 'error'); }
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
            return { 
                ...n, 
                id: newId,
                data: { ...n.data, onUpdate: updateNodeData }
            };
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
        showToast(`Template '${template.name}' loaded`, 'success');
    };

    const handleRun = async () => {
        const currentNodes = getNodes(); 
        const currentEdges = getEdges();
        if (currentNodes.length === 0) { showToast("Canvas is empty.", 'error'); return; }
        
        setIsRunning(true);
        try {
            const payload = {
                nodes: currentNodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
                edges: currentEdges.map(e => ({ source: e.source, target: e.target })),
                pipelineId: id 
            };
            const token = localStorage.getItem('token');
            const res = await axios.post('http://127.0.0.1:5000/run-pipeline', payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            console.log(res.data.logs); 
            showToast("Pipeline executed successfully!", 'success');
        } catch (error) {
            let errMsg = error.response?.data?.error || error.message;
            showToast(`Execution Failed: ${errMsg}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const ActionButton = ({ icon, label, onClick, disabled = false, special = false }) => (
        <motion.button 
            onClick={onClick}
            disabled={disabled}
            style={{ 
                background: special ? 'linear-gradient(45deg, #ec4899, #8b5cf6)' : 'transparent', 
                border: special ? 'none' : '1px solid rgba(255,255,255,0.1)', 
                color: disabled ? '#52525b' : (special ? 'white' : '#d4d4d8'), 
                padding: '8px 12px', fontSize: '13px', borderRadius: '6px', 
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: special ? '0 4px 15px rgba(236, 72, 153, 0.3)' : 'none',
                fontWeight: special ? '600' : 'normal'
            }}
            whileHover={!disabled ? { 
                background: special ? 'linear-gradient(45deg, #db2777, #7c3aed)' : 'rgba(255,255,255,0.05)', 
                borderColor: special ? 'none' : 'rgba(255,255,255,0.2)', 
                color: 'white' 
            } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
        >
            {icon} {label}
        </motion.button>
    );

    const ToastNotification = () => (
        <AnimatePresence>
            {notification && (
                <motion.div 
                    initial={{ opacity: 0, y: -50, x: '-50%' }} 
                    animate={{ opacity: 1, y: 20, x: '-50%' }} 
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    style={{
                        position: 'fixed', left: '50%', top: 0, zIndex: 2000,
                        background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                                    notification.type === 'info' ? 'rgba(59, 130, 246, 0.9)' : 
                                    'rgba(16, 185, 129, 0.9)',
                        color: 'white', padding: '12px 24px', borderRadius: '50px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)', minWidth: '300px', justifyContent: 'center'
                    }}
                >
                    {notification.type === 'error' ? <AlertCircle size={20} /> : 
                     notification.type === 'info' ? <Info size={20} /> :
                     <CheckCircle2 size={20} />}
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
                    <button 
                        onClick={() => setNotification(null)}
                        style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: 'auto', cursor: 'pointer', display: 'flex' }}
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f1115', position: 'relative' }}>
            
            <ToastNotification />
            <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportFile} />

            <motion.header 
                style={{ 
                    height: '60px', 
                    background: 'rgba(24, 24, 27, 0.8)', 
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
                    zIndex: 10,
                    overflowX: 'auto', 
                    whiteSpace: 'nowrap'
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
                    
                    {/* --- AI GENERATE BUTTON --- */}
                    <ActionButton 
                        icon={<Wand2 size={16}/>} 
                        label="AI Generate" 
                        onClick={() => setShowAIModal(true)} 
                        special={true}
                    />

                    <ActionButton icon={<LayoutTemplate size={16}/>} label="Templates" onClick={() => setShowTemplateModal(true)} />
                    
                    {/* --- PREVIEW BUTTON --- */}
                    <ActionButton 
                        icon={<Eye size={16}/>} 
                        label="Preview" 
                        onClick={handleToolbarPreview} 
                        disabled={!selectedNode} 
                    />
                    
                    {/* --- SCHEDULE BUTTON (Use updated state) --- */}
                    <ActionButton icon={<Clock size={16}/>} label="Schedule" onClick={() => setShowScheduleModal(true)} />

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
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
                
                {isMobile && (
                    <button 
                        onClick={() => setIsToolboxOpen(!isToolboxOpen)}
                        style={{
                            position: 'absolute', top: '10px', left: '10px', zIndex: 50,
                            background: '#27272a', border: '1px solid #3f3f46', color: 'white',
                            padding: '8px', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {isToolboxOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}

                <div style={{ 
                    display: isToolboxOpen ? 'block' : 'none', 
                    position: isMobile ? 'absolute' : 'relative',
                    zIndex: 40, 
                    height: '100%',
                    backgroundColor: isMobile ? '#0f1115' : 'transparent',
                    boxShadow: isMobile ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
                }}>
                    <Sidebar />
                </div>

                <div 
                    className="reactflow-wrapper" 
                    ref={reactFlowWrapper} 
                    style={{ width: '100%', height: '100%', backgroundColor: '#0f1115' }}
                    onMouseMove={onMouseMove} 
                >
                      <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'none', zIndex: 10, background: 'rgba(24, 24, 27, 0.8)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        <span style={{ fontWeight: 'bold', color: '#e5e7eb' }}>Left-click</span> to select, <span style={{ fontWeight: 'bold', color: '#e5e7eb' }}>Preview</span> in toolbar
                        </p>
                    </div>

                    <ReactFlow 
                        nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
                        nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}
                        onNodeClick={onNodeClick} 
                        onPaneClick={onPaneClick}
                        onNodeContextMenu={onNodeContextMenu}
                        fitView deleteKeyCode={['Backspace', 'Delete']}
                        proOptions={{ hideAttribution: true }}
                    >
                        <CursorsRenderer cursors={remoteCursors} />
                        <Background color="#27272a" gap={25} size={1} />
                        <Controls style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', fill: 'white' }} />
                    </ReactFlow>
                </div>
            </div>

            <DataPreviewPanel 
                isOpen={previewPanel.isOpen}
                onClose={() => setPreviewPanel(prev => ({ ...prev, isOpen: false }))}
                data={previewPanel.data}
                columns={previewPanel.columns}
                loading={previewPanel.loading}
                error={previewPanel.error}
                nodeLabel={previewPanel.nodeLabel}
            />

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

            {/* --- AI GENERATE MODAL --- */}
            <AnimatePresence>
            {showAIModal && (
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
                            width: '500px', backgroundColor: '#18181b',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Wand2 size={20} color="#d946ef" /> AI Pipeline Generator
                            </h2>
                            <button onClick={() => setShowAIModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: 0, marginBottom: '20px' }}>
                            Describe your pipeline in plain English. For example: <br/>
                            <i style={{ color: '#94a3b8' }}>"Load sales.csv, filter rows where Amount = 500, and save as high_value.json"</i>
                        </p>

                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Type your request here..."
                            style={{
                                width: '100%', height: '100px', background: '#27272a',
                                border: '1px solid #3f3f46', borderRadius: '8px',
                                color: 'white', padding: '12px', marginBottom: '20px',
                                resize: 'none', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setShowAIModal(false)}
                                style={{ 
                                    background: 'transparent', border: '1px solid #3f3f46', color: '#e4e4e7',
                                    padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAIGenerate}
                                disabled={isGenerating}
                                style={{ 
                                    background: 'linear-gradient(45deg, #ec4899, #8b5cf6)', 
                                    border: 'none', color: 'white',
                                    padding: '10px 20px', borderRadius: '6px', cursor: isGenerating ? 'not-allowed' : 'pointer', 
                                    fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center',
                                    opacity: isGenerating ? 0.7 : 1
                                }}
                            >
                                {isGenerating ? <Loader2 size={16} className="spin"/> : <Wand2 size={16}/>}
                                {isGenerating ? 'Generating...' : 'Generate Pipeline'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* --- SCHEDULE MODAL (UPDATED) --- */}
            <ScheduleModal 
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSave={saveSchedule}
                currentSchedule={currentScheduleStr}
            />

        </div>
    );
};

const PipelineBuilder = () => (<ReactFlowProvider><PipelineBuilderContent /></ReactFlowProvider>);
export default PipelineBuilder;