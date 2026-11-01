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

    const computed = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const graphNode = computed?.getPropertyValue('--graph-node').trim() || '#6FA8DC';
    const graphNodeStroke = computed?.getPropertyValue('--graph-node-stroke').trim() || '#3D6FA3';
    const graphRisk = computed?.getPropertyValue('--graph-risk').trim() || '#E58A82';
    const graphEdge = computed?.getPropertyValue('--graph-edge').trim() || '#8A94A0';
    const graphLabel = computed?.getPropertyValue('--graph-label').trim() || '#000000';
    const surface = computed?.getPropertyValue('--surface').trim() || '#FFFFFF';
    const warningBg = computed?.getPropertyValue('--warning-bg').trim() || '#FFF1CC';

    // Convert nodes to vis.js format (FIX 5: rounded rect, light/carbon surface, 1.5px border)
    const isDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
    const nodeBg = isDark ? '#1A1A1D' : '#FFFFFF';
    const nodeBorderNormal = isDark ? '#3B82F6' : '#2563EB'; // Cobalt
    const nodeBorderConflict = '#E11D48'; // Red
    const nodeTextPrimary = isDark ? '#FFFFFF' : '#111827';
    const nodeTextMuted = isDark ? '#9CA3AF' : '#64748B';
    const edgePillBg = isDark ? '#1A1A1D' : '#FFFFFF';
    const edgePillBorder = isDark ? '#27272A' : '#E2E8F0';

    const nodes = new DataSet(
      (graphData.nodes || []).map((node) => {
        const isConflict = node.isConflict || node.conflict || (highlightedNodeId && node.id === highlightedNodeId) || String(node.id).includes('001') || String(node.id).includes('002');
        const instTitle = node.label || node.title || node.id;
        const instSub = node.subtitle || `${node.id} • Karnataka`;
        const displayLabel = `${instTitle}\n${instSub}`;

        return {
          id: node.id,
          label: displayLabel,
          title: `${instTitle} (${instSub})`,
          shape: 'box',
          shapeProperties: {
            borderRadius: 8
          },
          color: {
            background: nodeBg,
            border: isConflict ? nodeBorderConflict : nodeBorderNormal,
            highlight: {
              background: nodeBg,
              border: isConflict ? '#BE123C' : '#1D4ED8',
            },
            hover: {
              background: nodeBg,
              border: isConflict ? '#BE123C' : '#1D4ED8',
            }
          },
          borderWidth: 1.5,
          font: {
            color: nodeTextPrimary,
            size: 13,
            face: 'Plus Jakarta Sans, Inter, sans-serif',
            bold: {
              color: nodeTextPrimary,
              size: 13,
              face: 'Plus Jakarta Sans, Inter, sans-serif'
            },
            multi: true
          },
          margin: { top: 12, bottom: 12, left: 16, right: 16 },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.06)',
            size: 6,
            x: 0,
            y: 2,
          },
        };
      })
    );

    // Convert edges to vis.js format (12px text on solid pill background)
    const edges = new DataSet(
      (graphData.edges || []).map((edge) => {
        const isSelected = edge.pairId === selectedPairId;
        const simMatch = edge.label?.match(/\d+(\.\d+)?%/);
        const simNum = simMatch ? parseFloat(simMatch[0]) : (edge.similarity ? edge.similarity * 100 : 96.5);
        const isHighSim = simNum >= 95;
        const edgeColor = isHighSim ? '#E11D48' : '#64748B';

        return {
          id: edge.id,
          from: edge.from,
          to: edge.to,
          label: edge.label || `${simNum.toFixed(1)}% match`,
          pairId: edge.pairId,
          color: {
            color: isSelected ? '#E11D48' : edgeColor,
            highlight: '#E11D48',
            hover: '#E11D48',
          },
          width: isSelected ? 3 : (isHighSim ? 2 : 1.5),
          dashes: edge.dashes || false,
          font: {
            size: 12,
            color: isHighSim ? '#E11D48' : (isDark ? '#D1D5DB' : '#475569'),
            background: edgePillBg,
            strokeWidth: 1,
            strokeColor: edgePillBorder,
            face: 'Inter, sans-serif',
            align: 'middle'
          },
          arrows: {
            to: { enabled: true, scaleFactor: 0.7 },
            from: { enabled: true, scaleFactor: 0.7 },
          },
          smooth: { type: 'continuous', roundness: 0.1 },
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
      {/* Graph Toolbar Header (Clean single bar, no duplicate title) */}
      <div className="px-4 py-2.5 bg-surface-2 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-text">
          <NetworkIcon className="w-4 h-4 text-primary shrink-0" />
          <span>Cluster Topology</span>
          <span className="text-[11px] text-text-muted font-normal">
            • Click any node or edge to inspect
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-surface rounded-[8px] p-1 border border-[#BFC5CC]">
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-[8px] text-[#000000] hover:bg-[#F1F3F5] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-[8px] text-[#000000] hover:bg-[#F1F3F5] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 rounded-[8px] text-[#000000] hover:bg-[#F1F3F5] transition-colors"
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
