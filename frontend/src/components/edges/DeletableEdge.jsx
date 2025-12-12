import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from 'reactflow';

export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onEdgeClick}
            style={{
              width: '20px',
              height: '20px',
              background: '#18181b',
              border: '1px solid #ef4444',
              color: '#ef4444',
              cursor: 'pointer',
              borderRadius: '50%',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Delete Connection"
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}