import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  Network as NetworkIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Building2,
  Info
} from 'lucide-react';

// In-memory image cache for canvas avatar rendering
const imageCache = new Map();
function getOrLoadImage(url, onLoaded) {
  if (!url) return null;
  if (imageCache.has(url)) return imageCache.get(url);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  img.onload = () => onLoaded();
  img.onerror = () => {
    img._failed = true;
    onLoaded();
  };
  imageCache.set(url, img);
  return img;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
}

/**
 * Image-Based Institution Radar Graph:
 * - 7 institution nodes rendered as 168x72px cards with 40px circular thumbnails
 * - 1 aggregated edge per institution pair with solid pill labels
 * - Physics stabilizes and freezes for zero jitter
 */
export default function PhotoClusterGraph({ 
  graphData, 
  selectedPairId, 
  onSelectPair,
  highlightedNodeId = null,
  onSelectNode = null
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [, setThemeVersion] = useState(0);

  // Re-render when theme changes
  useEffect(() => {
    const handleThemeChange = () => setThemeVersion((v) => v + 1);
    window.addEventListener('themechange', handleThemeChange);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme' || m.attributeName === 'class') {
          setThemeVersion((v) => v + 1);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.25, animation: { duration: 300 } });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8, animation: { duration: 300 } });
    }
  };

  const handleReset = () => {
    if (networkRef.current) {
      networkRef.current.setOptions({ physics: { enabled: true } });
      networkRef.current.stabilize(100);
      setTimeout(() => {
        if (networkRef.current) {
          networkRef.current.setOptions({ physics: { enabled: false } });
          networkRef.current.fit({ animation: { duration: 400 } });
        }
      }, 250);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes) return;

    const isDark = 
      document.documentElement.classList.contains('dark') || 
      document.documentElement.getAttribute('data-theme') === 'dark';

    // 1. Prepare Nodes: 168x72px cards
    const rawNodes = graphData.nodes || [];
    const rawEdges = graphData.edges || [];

    // Pre-calculate connectivity for dimming when a node is highlighted
    const connectedToHighlight = new Set();
    if (highlightedNodeId) {
      connectedToHighlight.add(highlightedNodeId);
      rawEdges.forEach((e) => {
        if (e.from === highlightedNodeId) connectedToHighlight.add(e.to);
        if (e.to === highlightedNodeId) connectedToHighlight.add(e.from);
      });
    }

    const nodes = new DataSet(
      rawNodes.map((node) => {
        const isConflict = Boolean(node.isConflict || node.conflict || (node.sharedCount && node.sharedCount > 0 && !node.isClean));
        const isClean = Boolean(node.isClean || node.sharedCount === 0);
        const isWarning = Boolean(node.isWarning && !isClean);

        const fullName = node.name || node.label || node.id;
        const line1 = node.shortNameLine1 || fullName.substring(0, 20);
        const line2 = node.shortNameLine2 || '';
        const city = node.city || 'Karnataka';
        const sharedText = node.sharedCount > 0 ? `${node.sharedCount} shared photos` : 'Clean reference';

        return {
          id: node.id,
          label: ' ', // Rendered via custom afterDrawing canvas pass
          title: `${fullName}\nLocation: ${city}\nStatus: ${sharedText}\n(Click to filter shared photos)`,
          shape: 'box',
          widthConstraint: { minimum: 168, maximum: 168 },
          heightConstraint: { minimum: 72, maximum: 72 },
          shapeProperties: {
            borderRadius: 10
          },
          color: {
            background: isDark ? '#1A1A1D' : '#FFFFFF',
            border: isConflict ? '#D97706' : isClean ? '#10B981' : (isDark ? '#52525B' : '#94A3B8'),
            highlight: {
              background: isDark ? '#1A1A1D' : '#FFFFFF',
              border: '#2563EB',
            },
            hover: {
              background: isDark ? '#1A1A1D' : '#FFFFFF',
              border: '#3B82F6',
            }
          },
          borderWidth: 1.5,
          shadow: {
            enabled: true,
            color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)',
            size: 8,
            x: 0,
            y: 3
          },
          // Custom attributes for canvas drawing
          _nodeData: {
            ...node,
            isConflict,
            isClean,
            isWarning,
            line1,
            line2,
            city,
            sharedCount: node.sharedCount ?? 0,
            thumbnail: node.thumbnail || (isClean ? '/images/INST_006_distinct_solar_rooftop.jpg' : '/images/computer_lab_reused.jpg')
          }
        };
      })
    );

    // 2. Prepare Edges: Aggregated pairwise edges with solid pill labels
    const edges = new DataSet(
      rawEdges.map((edge) => {
        const isSelected = edge.pairId === selectedPairId;
        const simNum = Number(edge.maxSimilarity || edge.similarity || 96.5);
        const count = edge.sharedCount || 1;
        
        // Edge color by max similarity: >=95% red, 85-94% amber, else muted grey
        let edgeColor = '#64748B';
        if (simNum >= 95) edgeColor = '#D97706';
        else if (simNum >= 85) edgeColor = '#F59E0B';

        // Edge width scales with shared count (2px to 6px)
        const edgeWidth = Math.min(6, Math.max(2, Math.round(2 + (count / 24) * 4)));
        const pillText = edge.label || `${count} photos • ${simNum.toFixed(1)}%`;

        return {
          id: edge.id,
          from: edge.from,
          to: edge.to,
          label: pillText,
          pairId: edge.pairId,
          width: isSelected ? Math.max(edgeWidth, 3.5) : edgeWidth,
          color: {
            color: isSelected ? '#B45309' : edgeColor,
            highlight: '#B45309',
            hover: '#B45309',
          },
          font: {
            size: 11,
            color: simNum >= 95 ? (isDark ? '#FBBF24' : '#B45309') : simNum >= 85 ? (isDark ? '#FBBF24' : '#B45309') : (isDark ? '#D1D5DB' : '#475569'),
            background: isDark ? '#1A1A1D' : '#FFFFFF',
            strokeWidth: 1.5,
            strokeColor: simNum >= 95 ? '#D97706' : simNum >= 85 ? '#F59E0B' : (isDark ? '#3F3F46' : '#CBD5E1'),
            face: 'Inter, system-ui, sans-serif',
            bold: true,
            align: 'middle'
          },
          arrows: {
            to: { enabled: false },
            from: { enabled: false }
          },
          smooth: { type: 'continuous', roundness: 0.15 }
        };
      })
    );

    // 3. Options: Force-directed physics that stabilizes then freezes
    const options = {
      autoResize: true,
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -180,
          centralGravity: 0.008,
          springLength: 260,
          springConstant: 0.04,
          damping: 0.6,
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
        tooltipDelay: 120,
      },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    // Freeze physics upon stabilization so cards don't jitter or jump when clicked
    const handleStabilized = () => {
      network.setOptions({ physics: { enabled: false } });
      network.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    };

    network.once('stabilizationIterationsDone', handleStabilized);
    network.once('stabilized', handleStabilized);

    const safetyTimer = setTimeout(() => {
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: { enabled: false } });
        networkRef.current.fit();
      }
    }, 400);

    // 4. Custom canvas drawing pass for the 168x72px card interior
    network.on('afterDrawing', (ctx) => {
      const positions = network.getPositions();
      const nodeItems = nodes.get();

      nodeItems.forEach((nodeItem) => {
        const pos = positions[nodeItem.id];
        if (!pos) return;

        const data = nodeItem._nodeData;
        const isNodeHighlighted = highlightedNodeId === nodeItem.id;
        const isDimmed = highlightedNodeId && !connectedToHighlight.has(nodeItem.id);

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.28;
        }

        const w = 168;
        const h = 72;
        const left = pos.x - w / 2;
        const top = pos.y - h / 2;

        // Card Surface
        ctx.beginPath();
        drawRoundedRect(ctx, left, top, w, h, 10);
        ctx.fillStyle = isDark ? '#1A1A1D' : '#FFFFFF';
        ctx.fill();

        // Card Border
        let borderColor = isDark ? '#3F3F46' : '#E2E8F0';
        if (data.isConflict) borderColor = '#D97706';
        else if (data.isClean) borderColor = '#10B981';
        else if (data.isWarning) borderColor = '#F59E0B';
        if (isNodeHighlighted) borderColor = '#2563EB';

        ctx.lineWidth = isNodeHighlighted ? 2.5 : 1.5;
        ctx.strokeStyle = borderColor;
        ctx.stroke();

        // 40px Circular Thumbnail Avatar
        const avatarCx = left + 28;
        const avatarCy = pos.y;
        const avatarR = 20;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const img = getOrLoadImage(data.thumbnail, () => {
          if (networkRef.current) networkRef.current.redraw();
        });

        if (img && img.complete && !img._failed && img.naturalWidth > 0) {
          ctx.drawImage(img, avatarCx - avatarR, avatarCy - avatarR, avatarR * 2, avatarR * 2);
        } else {
          // Fallback building placeholder
          ctx.fillStyle = isDark ? '#27272A' : '#F1F5F9';
          ctx.fillRect(avatarCx - avatarR, avatarCy - avatarR, avatarR * 2, avatarR * 2);
          ctx.fillStyle = isDark ? '#A1A1AA' : '#64748B';
          ctx.font = 'bold 12px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(data.label ? data.label.substring(0, 2).toUpperCase() : 'IN', avatarCx, avatarCy);
        }
        ctx.restore();

        // Circular Avatar Border
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = data.isConflict ? '#D97706' : data.isClean ? '#10B981' : (isDark ? '#3F3F46' : '#CBD5E1');
        ctx.stroke();

        // Institution Name (13px, font-semibold, 2 lines max)
        const textX = left + 54;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
        ctx.font = '600 12px "Plus Jakarta Sans", "Inter", sans-serif';

        if (data.line2) {
          ctx.fillText(data.line1, textX, top + 21, 106);
          ctx.fillText(data.line2, textX, top + 35, 106);
        } else {
          ctx.fillText(data.line1, textX, top + 26, 106);
        }

        // City, State (11px muted)
        ctx.fillStyle = isDark ? '#9CA3AF' : '#64748B';
        ctx.font = '400 11px "Inter", sans-serif';
        const cityY = data.line2 ? top + 50 : top + 42;
        ctx.fillText(data.city, textX, cityY, 68);

        // Flagged Shared Count Chip
        const chipText = data.sharedCount > 0 ? `${data.sharedCount} shared` : 'Clean';
        const chipW = data.sharedCount > 0 ? 54 : 38;
        const chipH = 16;
        const chipX = left + w - chipW - 6;
        const chipY = top + h - chipH - 6;

        ctx.beginPath();
        drawRoundedRect(ctx, chipX, chipY, chipW, chipH, 4);
        ctx.fillStyle = data.sharedCount > 0 
          ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2')
          : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7');
        ctx.fill();
        ctx.strokeStyle = data.sharedCount > 0 
          ? (isDark ? '#7F1D1D' : '#FCA5A5')
          : (isDark ? '#065F46' : '#86EFAC');
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = data.sharedCount > 0 
          ? (isDark ? '#FCA5A5' : '#991B1B')
          : (isDark ? '#86EFAC' : '#166534');
        ctx.font = '600 9.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chipText, chipX + chipW / 2, chipY + chipH / 2 + 0.5);

        ctx.restore();
      });
    });

    // 5. Interaction: Node & Edge selection
    network.on('click', (params) => {
      // Clicked an Edge: Select corresponding pair
      if (params.edges.length > 0 && params.nodes.length === 0) {
        const edgeId = params.edges[0];
        const edgeObj = rawEdges.find((e) => e.id === edgeId);
        if (edgeObj && edgeObj.pairId && onSelectPair) {
          onSelectPair(edgeObj.pairId);
        }
        return;
      }

      // Clicked a Node: Filter shared photo pairs involving this institution
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        if (onSelectNode) {
          onSelectNode(nodeId);
        }
        // Also select first edge connected to this node
        const connectedEdge = rawEdges.find((e) => e.from === nodeId || e.to === nodeId);
        if (connectedEdge && connectedEdge.pairId && onSelectPair) {
          onSelectPair(connectedEdge.pairId);
        }
        return;
      }

      // Clicked background: Clear node filter
      if (params.nodes.length === 0 && params.edges.length === 0) {
        if (onSelectNode) {
          onSelectNode(null);
        }
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, selectedPairId, highlightedNodeId, onSelectPair, onSelectNode]);

  return (
    <div className="relative border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-surface/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-xs">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="Re-stabilize layout"
          aria-label="Re-stabilize layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Network Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[580px] cursor-grab active:cursor-grabbing"
      />

      {/* Legend Footer */}
      <div className="border-t border-border bg-surface-2 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[#D97706] bg-surface" />
            <span className="text-[11px] font-medium text-text">Review Indicator (&gt;90% match)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[#F59E0B] bg-surface" />
            <span className="text-[11px] font-medium text-text">Review (85-94%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[#10B981] bg-surface" />
            <span className="text-[11px] font-medium text-text">Clean Reference</span>
          </div>
        </div>

        <div className="text-[11px] text-text-subtle font-mono">
          7 Institution Nodes • 104 Shared Photo Links
        </div>
      </div>
    </div>
  );
}
