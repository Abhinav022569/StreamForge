import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import '../../App.css';

// --- SHARED STYLE FOR ALL NODES ---
const NodeShell = ({ title, icon, color, children, id, isConnectable, onDelete }) => (
    <div className="pipeline-node" style={{ borderColor: color || '#7dd3fc' }}>
        <button className="node-delete-btn nodrag" onClick={onDelete}>✕</button>
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="node-handle" />
        <div className="node-header" style={{ color: color || '#7dd3fc' }}>
            <span style={{ marginRight: '5px' }}>{icon}</span> {title}
        </div>
        <div className="node-body nodrag">{children}</div>
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="node-handle" />
    </div>
);

const useNodeState = (id, data) => {
    const { setNodes, deleteElements } = useReactFlow();
    
    const update = (field, value) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, [field]: value } };
            }
            return node;
        }));
    };

    const remove = (evt) => {
        evt.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    return { update, remove };
};

// --- EXISTING NODES (Sort, Select, Rename, Dedupe, FillNa, GroupBy, Join) ---

export const SortNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Sort" icon="⇅" color="#f472b6" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">COLUMN</label>
            <input className="input-field" type="text" value={data.column || ''} onChange={(e) => update('column', e.target.value)} placeholder="e.g. age" />
            <label className="node-label" style={{ marginTop: '5px' }}>ORDER</label>
            <select className="input-field" value={data.order || 'true'} onChange={(e) => update('order', e.target.value)}>
                <option value="true">Ascending (A-Z)</option>
                <option value="false">Descending (Z-A)</option>
            </select>
        </NodeShell>
    );
});

export const SelectNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Select Cols" icon="🎯" color="#fbbf24" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">COLUMNS (Comma separated)</label>
            <input className="input-field" type="text" value={data.columns || ''} onChange={(e) => update('columns', e.target.value)} placeholder="name, email, id" />
        </NodeShell>
    );
});

export const RenameNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Rename" icon="🏷️" color="#c084fc" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">OLD NAME</label>
            <input className="input-field" type="text" value={data.oldName || ''} onChange={(e) => update('oldName', e.target.value)} />
            <label className="node-label" style={{ marginTop: '5px' }}>NEW NAME</label>
            <input className="input-field" type="text" value={data.newName || ''} onChange={(e) => update('newName', e.target.value)} />
        </NodeShell>
    );
});

export const DedupeNode = memo(({ id, data, isConnectable }) => {
    const { remove } = useNodeState(id, data);
    return (
        <NodeShell title="Deduplicate" icon="✂️" color="#2dd4bf" id={id} isConnectable={isConnectable} onDelete={remove}>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Removes duplicate rows automatically.</p>
        </NodeShell>
    );
});

export const FillNaNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Fill Missing" icon="💊" color="#a78bfa" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">COLUMN (Leave empty for all)</label>
            <input className="input-field" type="text" value={data.column || ''} onChange={(e) => update('column', e.target.value)} />
            <label className="node-label" style={{ marginTop: '5px' }}>VALUE</label>
            <input className="input-field" type="text" value={data.value || ''} onChange={(e) => update('value', e.target.value)} placeholder="0 or Unknown" />
        </NodeShell>
    );
});

export const GroupByNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Group By" icon="∑" color="#fb7185" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">GROUP BY (Col)</label>
            <input className="input-field" type="text" value={data.groupCol || ''} onChange={(e) => update('groupCol', e.target.value)} placeholder="e.g. Region" />
            <label className="node-label" style={{ marginTop: '5px' }}>TARGET (Col)</label>
            <input className="input-field" type="text" value={data.targetCol || ''} onChange={(e) => update('targetCol', e.target.value)} placeholder="e.g. Sales" />
            <label className="node-label" style={{ marginTop: '5px' }}>OPERATION</label>
            <select className="input-field" value={data.operation || 'sum'} onChange={(e) => update('operation', e.target.value)}>
                <option value="sum">Sum</option>
                <option value="mean">Average</option>
                <option value="count">Count</option>
                <option value="max">Max</option>
                <option value="min">Min</option>
            </select>
        </NodeShell>
    );
});

export const JoinNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <div className="pipeline-node" style={{ borderColor: '#38bdf8' }}>
            <button className="node-delete-btn nodrag" onClick={remove}>✕</button>
            <Handle type="target" position={Position.Left} id="a" style={{ top: '30%' }} isConnectable={isConnectable} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '70%' }} isConnectable={isConnectable} />
            
            <div className="node-header" style={{ color: '#38bdf8' }}>
                <span style={{ marginRight: '5px' }}>🔗</span> Join
            </div>
            <div className="node-body nodrag">
                <label className="node-label">JOIN KEY (Column)</label>
                <input className="input-field" type="text" value={data.key || ''} onChange={(e) => update('key', e.target.value)} placeholder="e.g. ID" />
                <label className="node-label" style={{ marginTop: '5px' }}>TYPE</label>
                <select className="input-field" value={data.how || 'inner'} onChange={(e) => update('how', e.target.value)}>
                    <option value="inner">Inner</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="outer">Full Outer</option>
                </select>
                <p style={{ fontSize: '9px', color: '#64748b', marginTop: '5px' }}>Connect 2 nodes to left inputs</p>
            </div>
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="node-handle" />
        </div>
    );
});

// --- NEW NODES ---

// 8. CAST (Convert Type)
export const CastNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Convert Type" icon="🔄" color="#a3e635" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">COLUMN</label>
            <input className="input-field" type="text" value={data.column || ''} onChange={(e) => update('column', e.target.value)} />
            <label className="node-label" style={{ marginTop: '5px' }}>TARGET TYPE</label>
            <select className="input-field" value={data.targetType || 'string'} onChange={(e) => update('targetType', e.target.value)}>
                <option value="string">Text (String)</option>
                <option value="int">Integer (123)</option>
                <option value="float">Decimal (1.23)</option>
                <option value="date">Date</option>
            </select>
        </NodeShell>
    );
});

// 9. TEXT CLEAN (String Ops)
export const StringNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Text Clean" icon="🔤" color="#fcd34d" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">COLUMN</label>
            <input className="input-field" type="text" value={data.column || ''} onChange={(e) => update('column', e.target.value)} />
            <label className="node-label" style={{ marginTop: '5px' }}>OPERATION</label>
            <select className="input-field" value={data.operation || 'upper'} onChange={(e) => update('operation', e.target.value)}>
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="strip">Trim Whitespace</option>
                <option value="title">Title Case</option>
            </select>
        </NodeShell>
    );
});

// 10. CALC (Math)
export const CalcNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Math Formula" icon="🧮" color="#60a5fa" id={id} isConnectable={isConnectable} onDelete={remove}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <input className="input-field" style={{ width: '45%' }} placeholder="Col A" value={data.colA || ''} onChange={(e) => update('colA', e.target.value)} />
                <select className="input-field" style={{ width: '40px', padding: '0 2px', textAlign: 'center' }} value={data.op || '+'} onChange={(e) => update('op', e.target.value)}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="*">×</option>
                    <option value="/">÷</option>
                </select>
                <input className="input-field" style={{ width: '45%' }} placeholder="Col B" value={data.colB || ''} onChange={(e) => update('colB', e.target.value)} />
            </div>
            <label className="node-label" style={{ marginTop: '8px' }}>RESULT COLUMN NAME</label>
            <input className="input-field" type="text" value={data.newCol || ''} onChange={(e) => update('newCol', e.target.value)} placeholder="New_Result" />
        </NodeShell>
    );
});

// 11. LIMIT (Sample)
export const LimitNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Limit Rows" icon="🛑" color="#f87171" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">KEEP TOP N ROWS</label>
            <input className="input-field" type="number" value={data.limit || 100} onChange={(e) => update('limit', e.target.value)} />
        </NodeShell>
    );
});

// 12. CONSTANT (Add Column)
export const ConstantNode = memo(({ id, data, isConnectable }) => {
    const { update, remove } = useNodeState(id, data);
    return (
        <NodeShell title="Add Column" icon="➕" color="#34d399" id={id} isConnectable={isConnectable} onDelete={remove}>
            <label className="node-label">NEW COLUMN NAME</label>
            <input className="input-field" type="text" value={data.colName || ''} onChange={(e) => update('colName', e.target.value)} />
            <label className="node-label" style={{ marginTop: '5px' }}>VALUE</label>
            <input className="input-field" type="text" value={data.value || ''} onChange={(e) => update('value', e.target.value)} />
        </NodeShell>
    );
});