import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  Network as NetworkIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  GitFork,
  Layers,
  X,
  Info
} from 'lucide-react';

/**
 * Generic Regulatory Topology & Subgraph Viewer:
 * - Generic DAG Topological Level Ranking (calculates levels dynamically for any graph depth)
 * - Anti-overlap physics and auto-wrapping bounding boxes
 * - Dual layout modes: Generic Hierarchical Tree & Organic Force-Directed
 * - Staggered curved edges with solid badge pill backgrounds to eliminate label collisions
 * - Smooth camera transitions, double-click focus, and interactive node drawer
 */
export default function ConflictingSubgraphNetwork({ 
  subgraph, 
  activeFindingTitle = null 
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [, setThemeVersion] = useState(0);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [layoutMode, setLayoutMode] = useState('tree'); // 'tree' (generic hierarchical) | 'force' (organic)

  // Sync theme changes dynamically
  useEffect(() => {
    const handleThemeChange = () => setThemeVersion(v => v + 1);
    window.addEventListener('themechange', handleThemeChange);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme' || m.attributeName === 'class') {
          setThemeVersion(v => v + 1);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // Compute generic topological levels and degree statistics across any arbitrary graph
  const { nodeLevels, inDegree, outDegree, targetEdgeCounts } = useMemo(() => {
    const nodes = subgraph?.nodes || [];
    const edges = subgraph?.edges || [];
    const nodeIds = nodes.map(n => n.id);

    const inDeg = {};
    const outDeg = {};
    const adj = {};
    const targetCounts = {};

    nodeIds.forEach(id => {
      inDeg[id] = 0;
      outDeg[id] = 0;
      adj[id] = [];
    });

    edges.forEach(e => {
      const from = e.from || e.source;
      const to = e.to || e.target;
      if (outDeg[from] !== undefined) outDeg[from]++;
      if (inDeg[to] !== undefined) inDeg[to]++;
      if (adj[from]) adj[from].push(to);
      targetCounts[to] = (targetCounts[to] || 0) + 1;
    });

    // Topological sort / longest path from root nodes (inDegree === 0)
    const queue = [];
    const levels = {};

    nodeIds.forEach(id => {
      if (inDeg[id] === 0) {
        queue.push(id);
        levels[id] = 0;
      }
    });

    // If graph has cycles or no zero-in-degree nodes, select node with maximum out-degree as root
    if (queue.length === 0 && nodeIds.length > 0) {
      const sortedByOut = [...nodeIds].sort((a, b) => (outDeg[b] || 0) - (outDeg[a] || 0));
      queue.push(sortedByOut[0]);
      levels[sortedByOut[0]] = 0;
    }

    // Assign generic rank: level(child) = max(level(child), level(parent) + 1)
    while (queue.length > 0) {
      const curr = queue.shift();
      const currLevel = levels[curr] || 0;
      (adj[curr] || []).forEach(neighbor => {
        const nextLevel = currLevel + 1;
        if (levels[neighbor] === undefined || nextLevel > levels[neighbor]) {
          levels[neighbor] = nextLevel;
          queue.push(neighbor);
        }
      });
    }

    // Default any remaining disconnected nodes to level 0
    nodeIds.forEach(id => {
      if (levels[id] === undefined) {
        levels[id] = 0;
      }
    });

    return {
      nodeLevels: levels,
      inDegree: inDeg,
      outDegree: outDeg,
      targetEdgeCounts: targetCounts
    };
  }, [subgraph]);

  useEffect(() => {
    setSelectedNodeData(null);

    if (!containerRef.current || !subgraph || (!subgraph.nodes?.length && !subgraph.edges?.length)) {
      return;
    }

    const isDark = document.documentElement.classList.contains('dark') || 
                   document.documentElement.getAttribute('data-theme') === 'dark';

    // Map nodes generically using calculated topological depth and semantic role
    const nodes = new DataSet(
      (subgraph.nodes || []).map((node) => {
        const rawType = (node.type || node.group || '').toLowerCase();
        const labelLower = (node.label || node.name || '').toLowerCase();
        const idLower = String(node.id || '').toLowerCase();
        const level = nodeLevels[node.id] ?? 0;

        // Generic conflict/anomaly detection
        const isConflictNode = 
          Boolean(node.is_conflict || node.conflict) ||
          rawType.includes('conflict') ||
          rawType.includes('faculty') ||
          labelLower.includes('[conflicted]') ||
          labelLower.includes('conflict') ||
          (node.color && (node.color.includes('e11d48') || node.color.includes('dc2626') || node.color.includes('ef4444')));

        // Generic source/origin identification
        const isRootNode = level === 0;

        // Generic intermediary/evidence identification
        const isIntermediary = 
          rawType.includes('document') || 
          rawType.includes('cert') || 
          rawType.includes('roster') || 
          idLower.startsWith('doc_') ||
          (level > 0 && (outDegree[node.id] || 0) > 0);

        // Palette configuration
        let bgColor = '#0284C7';
        let borderColor = isDark ? '#38BDF8' : '#0369A1';
        let fontColor = '#FFFFFF';
        let shape = node.shape || 'box';
        let size = 28;

        if (isConflictNode) {
          bgColor = isDark ? '#BE123C' : '#E11D48';
          borderColor = isDark ? '#FB7185' : '#9F1239';
          shape = node.shape || 'dot';
          size = 32;
        } else if (isIntermediary) {
          bgColor = isDark ? '#B45309' : '#D97706';
          borderColor = isDark ? '#FBBF24' : '#92400E';
          shape = node.shape || 'box';
          size = 24;
        } else if (isRootNode) {
          bgColor = isDark ? '#0369A1' : '#0284C7';
          borderColor = isDark ? '#38BDF8' : '#075985';
          shape = node.shape || 'box';
          size = 32;
        } else {
          bgColor = isDark ? '#334155' : '#475569';
          borderColor = isDark ? '#64748B' : '#334155';
          shape = node.shape || 'box';
          size = 26;
        }

        const displayName = node.label || node.name || node.doc_number || node.id || 'Node';

        return {
          id: node.id,
          label: displayName,
          level,
          rawNode: node,
          color: {
            background: node.color || bgColor,
            border: borderColor,
            highlight: { 
              background: '#F43F5E', 
              border: '#E11D48' 
            },
            hover: {
              background: node.color || bgColor,
              border: '#38BDF8'
            }
          },
          shape,
          size,
          font: { 
            color: fontColor, 
            size: shape === 'dot' ? 12 : 12.5, 
            face: 'Inter, system-ui, -apple-system, sans-serif', 
            bold: true,
            vadjust: shape === 'dot' ? 8 : 0,
          },
          // Auto-wrap box text cleanly within generic bounded width
          widthConstraint: shape === 'box' ? {
            minimum: 110,
            maximum: 180,
          } : undefined,
          margin: shape === 'box' ? {
            top: 10,
            bottom: 10,
            left: 14,
            right: 14,
          } : undefined,
          borderWidth: 2,
          shadow: { 
            enabled: true, 
            color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)', 
            size: 8, 
            x: 0, 
            y: 3 
          },
        };
      })
    );

    // Stagger edge curves and apply solid badge pill styling to eliminate label collisions
    const edges = new DataSet(
      (subgraph.edges || []).map((edge, idx) => {
        const fromId = edge.from || edge.source;
        const toId = edge.to || edge.target;
        const labelText = edge.label || edge.relation || edge.conflict_type || '';
        const isConflict = edge.conflict || 
                           edge.is_conflict || 
                           edge.relation === 'employs' ||
                           labelText.toLowerCase().includes('conflict') ||
                           labelText.toLowerCase().includes('overlap') ||
                           labelText.toLowerCase().includes('claimed');

        const multiEdges = (targetEdgeCounts[toId] || 0) > 1;
        const isEven = idx % 2 === 0;

        return {
          id: edge.id || `edge-${idx}`,
          from: fromId,
          to: toId,
          label: labelText,
          color: isConflict ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B'),
          width: isConflict ? 2.5 : 1.5,
          dashes: isConflict ? [5, 5] : false,
          arrows: {
            to: { enabled: true, scaleFactor: 0.85 },
          },
          font: {
            size: 11,
            color: isConflict 
              ? (isDark ? '#FCA5A5' : '#B91C1C') 
              : (isDark ? '#E2E8F0' : '#1E293B'),
            face: 'Inter, system-ui, -apple-system, sans-serif',
            bold: true,
            strokeWidth: 0,
            // Solid badge pill background prevents overlapping edge text collision
            background: isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            align: 'horizontal',
            margin: 5,
          },
          smooth: multiEdges ? {
            enabled: true,
            type: isEven ? 'curvedCW' : 'curvedCCW',
            roundness: 0.22,
          } : {
            enabled: true,
            type: 'continuous',
            roundness: 0.15,
          },
        };
      })
    );

    const isTree = layoutMode === 'tree';

    const options = {
      nodes: {
        borderWidth: 2,
      },
      edges: {
        selectionWidth: 3,
        hoverWidth: 2.5,
      },
      layout: isTree ? {
        hierarchical: {
          enabled: true,
          direction: 'UD', // Generic Top-to-Bottom DAG flow
          sortMethod: 'directed', // Respects computed topological ranks
          levelSeparation: 160,   // Vertical tier clearance
          nodeSpacing: 220,       // Generous horizontal spacing prevents node box collisions
          treeSpacing: 240,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          shakeTowards: 'roots',
        }
      } : {
        hierarchical: {
          enabled: false,
        }
      },
      physics: isTree ? {
        enabled: false,
      } : {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -260, // Strong repulsion separates boxes completely
          centralGravity: 0.008,
          springLength: 220,
          springConstant: 0.04,
          damping: 0.75,
          avoidOverlap: 1.0,           // 100% collision prevention on rendered bounding boxes
        },
        stabilization: {
          enabled: true,
          iterations: 160,
          updateInterval: 25,
          fit: true,
        },
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        dragNodes: true,
        navigationButtons: false,
      },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    // Smoothly fit canvas once initial stabilization is complete
    network.once('stabilizationIterationsDone', () => {
      network.fit({
        animation: {
          duration: 450,
          easingFunction: 'easeInOutQuad',
        },
      });
    });

    // Node click inspector
    network.on('click', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const clickedNode = nodes.get(nodeId);
        if (clickedNode) {
          setSelectedNodeData(clickedNode.rawNode || clickedNode);
        }
      } else {
        setSelectedNodeData(null);
      }
    });

    // Double-click to focus smoothly on target node
    network.on('doubleClick', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        network.focus(params.nodes[0], {
          scale: 1.25,
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
      }
    });

    // Auto-fit on container resize
    const resizeObserver = new ResizeObserver(() => {
      if (networkRef.current) {
        networkRef.current.fit({
          animation: { duration: 250, easingFunction: 'easeInOutQuad' },
        });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      network.destroy();
      networkRef.current = null;
    };
  }, [subgraph, layoutMode, nodeLevels, outDegree, targetEdgeCounts]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ 
        scale: scale * 1.3, 
        animation: { duration: 300, easingFunction: 'easeInOutQuad' } 
      });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ 
        scale: scale * 0.75, 
        animation: { duration: 300, easingFunction: 'easeInOutQuad' } 
      });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ 
        animation: { duration: 450, easingFunction: 'easeInOutQuad' } 
      });
    }
  };

  const nodesCount = subgraph?.nodes?.length || 0;
  const edgesCount = subgraph?.edges?.length || 0;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs relative">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 border-b border-border bg-surface-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <NetworkIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-text">{nodesCount} Nodes, {edgesCount} Edges</span>
        </div>

        {/* Layout Switcher & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Generic Layout Mode Switcher */}
          <div className="flex items-center bg-surface rounded-lg p-0.5 border border-border text-[11px]">
            <button
              onClick={() => setLayoutMode('tree')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                layoutMode === 'tree'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
              title="Generic Hierarchical Tree Layout"
              type="button"
            >
              <GitFork className="w-3 h-3" />
              <span>Tree</span>
            </button>
            <button
              onClick={() => setLayoutMode('force')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                layoutMode === 'force'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
              title="Force-Directed Organic Layout (Draggable)"
              type="button"
            >
              <Layers className="w-3 h-3" />
              <span>Organic</span>
            </button>
          </div>

          {/* Zoom & Fit Controls */}
          <div className="flex items-center space-x-1 bg-surface rounded-lg p-0.5 border border-border">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              title="Reset & Fit to Screen"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Vis Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-[460px] bg-bg/40 cursor-grab active:cursor-grabbing relative" 
      />

      {/* Generic Subtle Legend at Bottom-Left */}
      <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-xs border border-border rounded-lg px-2.5 py-1.5 shadow-xs flex items-center space-x-3 text-[10px] text-text-muted pointer-events-none select-none z-10">
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7] inline-block" />
          <span>Origin Entity</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] inline-block" />
          <span>Conflicted Target</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] inline-block" />
          <span>Evidence / Asset</span>
        </span>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNodeData && (
        <div className="absolute bottom-3 left-3 right-3 bg-surface border border-border rounded-xl p-3 shadow-xl z-20 text-xs text-text animate-fadeIn">
          <div className="flex items-center justify-between pb-1.5 border-b border-border font-bold">
            <span className="flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-primary" />
              <span>{selectedNodeData.label || selectedNodeData.name || selectedNodeData.id}</span>
            </span>
            <button 
              onClick={() => setSelectedNodeData(null)}
              className="text-text-muted hover:text-text cursor-pointer"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-2 text-[11px] text-text-muted space-y-0.5">
            {selectedNodeData.institution && <div>Institution: <strong className="text-text">{selectedNodeData.institution}</strong></div>}
            {selectedNodeData.role && <div>Designation: <strong className="text-text">{selectedNodeData.role}</strong></div>}
            {selectedNodeData.conflict_details && <div className="text-rose-600 dark:text-rose-400 font-medium mt-1">{selectedNodeData.conflict_details}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
