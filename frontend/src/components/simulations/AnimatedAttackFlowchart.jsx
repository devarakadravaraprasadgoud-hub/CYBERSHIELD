import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Send,
  Server,
  AlertTriangle,
  Inbox,
  Search,
  HelpCircle,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Database,
  FileText,
  FileLock2,
  Trash2,
  Activity,
  Network,
  History,
  Laptop,
  Wifi,
  Lock,
  Binary,
  FileWarning,
  Bot,
  Zap,
  ServerCrash,
  Cloud,
  TrendingUp,
  Sliders,
  XCircle,
  Cpu,
  Check,
  Smartphone,
  Shield,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  List,
  Eye,
  Play
} from 'lucide-react';

const NODE_TYPE_META = {
  start: {
    label: 'Start Stage',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    border: 'border-slate-300 hover:border-slate-500',
    activeRing: 'ring-4 ring-slate-400/40',
    icon: Globe
  },
  attacker_action: {
    label: 'Attacker Action',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    border: 'border-rose-300 hover:border-rose-500',
    activeRing: 'ring-4 ring-rose-400/50',
    icon: Send
  },
  user_action: {
    label: 'User Action',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    border: 'border-blue-300 hover:border-blue-500',
    activeRing: 'ring-4 ring-blue-400/50',
    icon: Laptop
  },
  system: {
    label: 'System / Network',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    border: 'border-indigo-300 hover:border-indigo-500',
    activeRing: 'ring-4 ring-indigo-400/50',
    icon: Server
  },
  weakness: {
    label: 'Security Weakness',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    border: 'border-amber-300 hover:border-amber-500',
    activeRing: 'ring-4 ring-amber-400/50',
    icon: AlertTriangle
  },
  attack_event: {
    label: 'Attack Event',
    badgeBg: 'bg-red-100 text-red-900 border-red-300',
    border: 'border-red-400 hover:border-red-600',
    activeRing: 'ring-4 ring-red-500/50',
    icon: Zap
  },
  warning: {
    label: 'Warning / Detection',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
    border: 'border-amber-300 hover:border-amber-500',
    activeRing: 'ring-4 ring-amber-400/50',
    icon: Activity
  },
  decision: {
    label: 'Decision Checkpoint',
    badgeBg: 'bg-purple-100 text-[#6D28D9] border-purple-300',
    border: 'border-purple-300 hover:border-purple-500',
    activeRing: 'ring-4 ring-purple-400/60',
    icon: HelpCircle
  },
  outcome: {
    label: 'Breach Outcome',
    badgeBg: 'bg-rose-200 text-rose-950 border-rose-400',
    border: 'border-rose-400 hover:border-rose-600',
    activeRing: 'ring-4 ring-rose-500/50',
    icon: Unlock
  },
  defense_control: {
    label: 'Defensive Control',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    border: 'border-emerald-300 hover:border-emerald-500',
    activeRing: 'ring-4 ring-emerald-400/50',
    icon: ShieldCheck
  },
  recovery: {
    label: 'Mitigation / Recovery',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    border: 'border-teal-300 hover:border-teal-500',
    activeRing: 'ring-4 ring-teal-400/50',
    icon: CheckCircle2
  }
};

const ICON_MAP = {
  Globe,
  Send,
  Server,
  AlertTriangle,
  Inbox,
  Search,
  HelpCircle,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Database,
  FileText,
  FileLock2,
  Trash2,
  Activity,
  Network,
  History,
  Laptop,
  Wifi,
  Lock,
  Binary,
  FileWarning,
  Bot,
  Zap,
  ServerCrash,
  Cloud,
  TrendingUp,
  Sliders,
  XCircle,
  Cpu,
  Check,
  Smartphone,
  Shield
};

export const AnimatedAttackFlowchart = ({
  nodes = [],
  edges = [],
  activeNodeId,
  mode = 'attack', // 'attack' | 'defense'
  onSelectNode,
  reducedMotion = false
}) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState('flowchart'); // 'flowchart' | 'list'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter nodes & edges based on mode
  const visibleNodes = nodes.filter(
    (n) => !n.mode || n.mode === 'both' || n.mode === mode
  );

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  const visibleEdges = edges.filter(
    (e) =>
      (!e.mode || e.mode === 'both' || e.mode === mode) &&
      visibleNodeIds.has(e.from) &&
      visibleNodeIds.has(e.to)
  );

  // Compute bounding box for auto-scaling
  const minX = Math.min(...visibleNodes.map((n) => n.x), 50);
  const maxX = Math.max(...visibleNodes.map((n) => n.x), 1200);
  const minY = Math.min(...visibleNodes.map((n) => n.y), 50);
  const maxY = Math.max(...visibleNodes.map((n) => n.y), 350);

  const canvasWidth = Math.max(maxX + 260, 1000);
  const canvasHeight = Math.max(maxY + 180, 480);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.6));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#FAF8FF] border border-[#DDD6FE] rounded-2xl overflow-hidden shadow-xs flex flex-col ${
        isFullscreen ? 'p-6 bg-white h-screen' : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-white px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between gap-3 z-20 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D28D9] flex items-center gap-1.5">
            <Network className="w-4 h-4 text-[#6D28D9]" />
            <span>Interactive Attack Flowchart</span>
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono border ${
              mode === 'attack'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {mode === 'attack' ? 'Attack Execution Path' : 'Defense Mitigation Replay'}
          </span>
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center gap-1.5 bg-[#FAF8FF] border border-[#DDD6FE] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'flowchart' ? 'list' : 'flowchart')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              viewMode === 'list'
                ? 'bg-[#EDE9FE] text-[#6D28D9]'
                : 'text-[#64748B] hover:text-[#1E1B4B]'
            }`}
            title="Toggle Sequential Step Outline"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>

          <div className="h-4 w-px bg-[#E5E7EB]" />

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E1B4B] hover:bg-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-[#64748B] px-1 font-semibold">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E1B4B] hover:bg-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E1B4B] hover:bg-white transition"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E1B4B] hover:bg-white transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      {viewMode === 'list' ? (
        /* Accessible List Outline View */
        <div className="p-6 overflow-y-auto max-h-[520px] space-y-3 bg-white">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold mb-4">
            Sequential Simulation Stages ({mode === 'attack' ? 'Attack Mode' : 'Defense Mode'})
          </h4>
          <div className="space-y-3">
            {visibleNodes.map((node, idx) => {
              const meta = NODE_TYPE_META[node.type] || NODE_TYPE_META.start;
              const Icon = ICON_MAP[node.icon] || meta.icon;
              const isActive = node.id === activeNodeId;

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-[#EDE9FE] border-[#8B5CF6] shadow-sm ring-2 ring-[#8B5CF6]/30'
                      : 'bg-[#FAF8FF] border-[#E5E7EB] hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${meta.badgeBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-[#64748B]">
                        Stage {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${meta.badgeBg}`}
                      >
                        {meta.label}
                      </span>
                      {isActive && (
                        <span className="text-[10px] bg-[#6D28D9] text-white px-2 py-0.5 rounded-full font-bold">
                          Active Stage
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-[#1E1B4B]">{node.label}</h5>
                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Visual Graph Diagram Board */
        <div className="flex-1 overflow-auto relative p-6 flex items-center justify-center min-h-[460px]">
          <div
            className="transition-transform duration-200 origin-center relative"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${zoom})`
            }}
          >
            {/* SVG Edges Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <marker
                  id="arrow-attack"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626" />
                </marker>
                <marker
                  id="arrow-defense"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
                </marker>
                <marker
                  id="arrow-neutral"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
                </marker>
              </defs>

              {visibleEdges.map((edge) => {
                const sourceNode = visibleNodes.find((n) => n.id === edge.from);
                const targetNode = visibleNodes.find((n) => n.id === edge.to);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.x + 95;
                const startY = sourceNode.y + 38;
                const endX = targetNode.x;
                const endY = targetNode.y + 38;

                // Curved Bézier path
                const deltaX = endX - startX;
                const controlX1 = startX + deltaX * 0.45;
                const controlX2 = startX + deltaX * 0.55;

                const pathData = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;

                const isEdgeActive =
                  activeNodeId === edge.from || activeNodeId === edge.to;
                const edgeColor =
                  mode === 'attack'
                    ? edge.mode === 'attack' || isEdgeActive
                      ? '#DC2626'
                      : '#C4B5FD'
                    : edge.mode === 'defense' || isEdgeActive
                    ? '#059669'
                    : '#C4B5FD';

                const markerId =
                  mode === 'attack'
                    ? 'url(#arrow-attack)'
                    : edge.mode === 'defense'
                    ? 'url(#arrow-defense)'
                    : 'url(#arrow-neutral)';

                return (
                  <g key={edge.id}>
                    {/* Shadow / Base edge */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={edgeColor}
                      strokeWidth={isEdgeActive ? '3.5' : '2'}
                      strokeDasharray={
                        isEdgeActive && !reducedMotion ? '6,5' : 'none'
                      }
                      className={
                        isEdgeActive && !reducedMotion ? 'animate-pulse' : ''
                      }
                      markerEnd={markerId}
                      opacity={isEdgeActive ? 1 : 0.65}
                    />

                    {/* Edge Label */}
                    {edge.label && (
                      <g
                        transform={`translate(${(startX + endX) / 2}, ${
                          (startY + endY) / 2 - 8
                        })`}
                      >
                        <rect
                          x="-45"
                          y="-9"
                          width="90"
                          height="18"
                          rx="9"
                          fill="#FFFFFF"
                          stroke="#E5E7EB"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#64748B"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {visibleNodes.map((node) => {
              const meta = NODE_TYPE_META[node.type] || NODE_TYPE_META.start;
              const Icon = ICON_MAP[node.icon] || meta.icon;
              const isActive = node.id === activeNodeId;

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '200px',
                    zIndex: isActive ? 10 : 2
                  }}
                  className={`group bg-white rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer shadow-xs select-none ${
                    meta.border
                  } ${
                    isActive
                      ? `${meta.activeRing} border-[#8B5CF6] shadow-md scale-105 bg-white`
                      : 'hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  {/* Node Type Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border truncate ${meta.badgeBg}`}
                    >
                      <Icon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </span>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#6D28D9] animate-ping" />
                    )}
                  </div>

                  {/* Node Title */}
                  <h5 className="text-xs font-bold text-[#1E1B4B] group-hover:text-[#6D28D9] transition-colors leading-snug line-clamp-2">
                    {node.label}
                  </h5>

                  {/* Node Subtitle */}
                  {node.description && (
                    <p className="text-[10px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="bg-[#FAF8FF] px-4 py-2 border-t border-[#DDD6FE] flex items-center justify-between text-[11px] text-[#64748B]">
        <span>
          Click any stage node to inspect in-depth weaknesses, warning signs, and defensive actions.
        </span>
        <span className="font-mono">
          {visibleNodes.length} Stages • {visibleEdges.length} Transitions
        </span>
      </div>
    </div>
  );
};
