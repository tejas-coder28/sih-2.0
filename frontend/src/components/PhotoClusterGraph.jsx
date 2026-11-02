import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  Network as NetworkIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

/**
 * Force-Directed Cluster Graph Component:
 * - Institutions are NODES
 * - Shared photos are EDGES
 * Renders interactive network with vis-network, supporting click-to-inspect,
 * physics simulation, and smooth edge selection.
 */
export default function PhotoClusterGraph({ 
  graphData, 
  selectedPairId, 
  onSelectPair,
  highlightedNodeId = null 
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [, setThemeVersion] = React.useState(0);

  React.useEffect(() => {
    const handleThemeChange = () => setThemeVersion(v => v + 1);
    window.addEventListener('themechange', handleThemeChange);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          setThemeVersion(v => v + 1);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const isDark = typeof document !== 'undefined' && (
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark')
    );
    const nodeBg = isDark ? '#1A1A1D' : '#FFFFFF';
    const nodeText = isDark ? '#F4F4F5' : '#111827';
    const nodeMuted = isDark ? '#A1A1AA' : '#64748B';
    const accentBorder = isDark ? '#3B82F6' : '#2563EB';
    const conflictBorder = isDark ? '#F87171' : '#C0262D';
    const selectedBg = isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(37, 99, 235, 0.12)';
    const edgeMuted = isDark ? '#52525B' : '#94A3B8';
    const edgeConflict = isDark ? '#F87171' : '#C0262D';
    const pillBorder = isDark ? '#27272A' : '#E2E8F0';

    // Convert nodes to vis.js format: light surface fill (#FFFFFF / #1A1A1D), 1.5px border, 13px font, 150px min width
    const nodes = new DataSet(
      (graphData.nodes || []).map((node) => {
        const isHighlighted = highlightedNodeId && node.id === highlightedNodeId;
        const isConflict = node.isConflict || node.conflict || isHighlighted || (node.id === 'INST_001' || node.id === 'INST_002');
        const borderColor = isConflict ? conflictBorder : accentBorder;
        return {
          id: node.id,
          label: node.label,
          title: node.title || node.label,
          shape: 'box',
          shapeProperties: {
            borderRadius: 8,
          },
          color: {
            background: isHighlighted ? selectedBg : nodeBg,
            border: borderColor,
            highlight: {
              background: selectedBg,
              border: borderColor,
            },
            hover: {
              background: selectedBg,
              border: borderColor,
            }
          },
          font: {
            color: nodeText,
            size: 13,
            face: 'Inter, system-ui, sans-serif',
            bold: true,
          },
          margin: { top: 8, bottom: 8, left: 14, right: 14 },
          borderWidth: 1.5,
          widthConstraint: { min: 150 },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.06)',
            size: 4,
            x: 0,
            y: 1,
          },
        };
      })
    );

    // Convert edges to vis.js format: readable 12px text on solid pill background with border
    const edges = new DataSet(
      (graphData.edges || []).map((edge) => {
        const isSelected = edge.pairId === selectedPairId;
        const matchPercent = edge.similarity || (edge.label ? Number(edge.label.match(/(\d+(?:\.\d+)?)/)?.[1]) : null) || 90;
        const isHighMatch = matchPercent >= 95;
        const eColor = isSelected ? edgeConflict : (isHighMatch ? edgeConflict : edgeMuted);
        return {
          id: edge.id,
          from: edge.from,
          to: edge.to,
          label: edge.label,
          pairId: edge.pairId,
          color: {
            color: eColor,
            highlight: edgeConflict,
          },
          width: isSelected ? 3.5 : (isHighMatch ? 2.5 : 1.5),
          dashes: !isHighMatch,
          font: {
            size: 12,
            color: nodeText,
            background: nodeBg,
            strokeWidth: 1,
            strokeColor: pillBorder,
            bold: true,
            face: 'Inter, system-ui, sans-serif',
            align: 'horizontal'
          },
          arrows: {
            to: { enabled: true, scaleFactor: 0.8 },
            from: { enabled: true, scaleFactor: 0.8 },
          },
          smooth: { type: 'curvedCW', roundness: 0.15 },
        };
      })
    );

    const options = {
      autoResize: true,
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -130,
          centralGravity: 0.006,
          springLength: 210,
          springConstant: 0.05,
          damping: 0.5,
        },
        stabilization: {
          enabled: true,
          iterations: 150,
          updateInterval: 25,
        },
      },
      interaction: {
        hover: true,
        zoomView: true,
        dragView: true,
        dragNodes: true,
        tooltipDelay: 150,
      },
      nodes: {
        scaling: { min: 20, max: 40 },
      },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    // Automatically zoom to fit once layout settles
    network.once('stabilizationIterationsDone', () => {
      network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    });
    network.once('stabilized', () => {
      network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    });

    const initTimer = setTimeout(() => {
      if (networkRef.current) {
        networkRef.current.fit();
      }
    }, 350);

    const resizeObserver = new ResizeObserver(() => {
      if (networkRef.current) {
        networkRef.current.fit();
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Handle Edge or Node selection
    network.on('click', (params) => {
      if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const edgeObj = graphData.edges.find((e) => e.id === edgeId);
        if (edgeObj && edgeObj.pairId && onSelectPair) {
          onSelectPair(edgeObj.pairId);
          return;
        }
      }

      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const connectedEdge = graphData.edges.find((e) => e.from === nodeId || e.to === nodeId);
        if (connectedEdge && connectedEdge.pairId && onSelectPair) {
          onSelectPair(connectedEdge.pairId);
        }
      }
    });

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      if (network) network.destroy();
    };
  }, [graphData, selectedPairId, highlightedNodeId]);

  const handleZoomIn = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 1.25 });
  };

  const handleZoomOut = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 0.8 });
  };

  const handleFit = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
  };

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
      {/* Graph Toolbar Header (Single clean title + legend line) */}
      <div className="px-4 py-3 bg-surface-2 text-text border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <NetworkIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text flex items-center space-x-2">
              <span>Photo Cluster Network</span>
              <span className="text-[11px] text-text-muted font-normal">
                • Nodes: institutions • Edges: reused photos
              </span>
            </h3>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-surface rounded-[8px] p-1 border border-border">
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 rounded-[8px] text-text hover:bg-surface-2 transition-colors"
            title="Fit Graph to Viewport"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Mount */}
      <div 
        ref={containerRef} 
        id="photo-cluster-graph-canvas"
        className="w-full h-[540px] min-h-[520px] bg-surface cursor-grab active:cursor-grabbing relative"
      />

      {/* Interactive Legend & Stats Footer */}
      <div className="px-4 py-3 bg-surface border-t border-border text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="text-text-subtle uppercase font-bold text-[10px]">Legend:</span>
          
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
            <span className="text-text-muted font-medium">Applicant Institution</span>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" />
            <span className="text-text-muted font-medium">Re-use Counterpart</span>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block" />
            <span className="text-text-muted font-medium">Cluster B Colleges</span>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            <span className="text-text-muted font-medium">Clean / Verified</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-text-subtle">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Edge = Shared Infrastructure Photo</span>
        </div>
      </div>
    </div>
  );
}
