import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import BarAtTopLol from './BarAtTopLol';
import GraphPanel from './GraphPanel';
import SourcePanel from './SourcePanel';
import TestResultsPanel from './TestResultsPanel';


const MIN_W = 160;
const MAX_W = 560;

let dragSide: 'left' | 'right' | null = null;
let dragStartX = 0;
let dragStartW = 0;

interface CollapsedPanelProps {
  title: string;
  onExpand: () => void;
  side: 'left' | 'right';
}

/**
 * helper func to collapse a panel
 * onExpand function is called when expanding collapsed panel
 */
function CollapsedPanel({ title, onExpand, side }: CollapsedPanelProps) {
  return (
    // collapsed panel. click anywhere will call onExpand and expands the panel
    <div
      className="panel h-full w-8 cursor-pointer transition-colors flex flex-col items-center justify-center gap-3"
      onClick={onExpand}
      title={`Expand ${title}`}
    >
      {/* rotate panel names */}
      <span
        className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest select-none"
        style={{ writingMode: 'vertical-rl', transform: side === 'left' ? 'rotate(180deg)' : 'none' }}
      >
        {title}
      </span>
    </div>
  );
}

export default function AnalysisScreen() {
  // read from store
  const analysisResult = useStore((s) => s.analysisResult);
  const selectedNodeId = useStore((s) => s.selectedNodeId);

  // current local states
  const [leftPanelWidth, setLeftPanelWidth] = useState(272);
  const [rightPanelWidth, setRightPanelWidth] = useState(312);
  const [isLPCollapsed, setIsLPCollapsed] = useState(false);
  const [isRPCollapsed, setIsRPCollapsed] = useState(false);
  
  /**
   * press mouse to redrag -> startDrag gets called -> saves current mouse pos and panel dimensions
   * move mouse -> onMove gets called -> calculates moving distance and updates panel width
   * release mouse -> onUp gets called -> clears dragSide and dragging stops
   */
  const startDrag = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    dragSide = side;
    dragStartX = e.clientX;
    dragStartW = side === 'left' ? leftPanelWidth : rightPanelWidth;
    e.preventDefault();
  }, [leftPanelWidth, rightPanelWidth]);

  // reexpand src panel when a new node is clicked on
  useEffect(() => {if (selectedNodeId) setIsRPCollapsed(false);}, [selectedNodeId]);

  useEffect(() => {
    // constantly check if there is dragging action.
    const onMove = (e: MouseEvent) => {
      if (!dragSide) return;
      // if so, calculate new panel width after resize
      const dx = e.clientX - dragStartX;
      const next = Math.max(MIN_W, Math.min(MAX_W,
        dragSide === 'left' ? dragStartW + dx : dragStartW - dx
      ));
      dragSide === 'left' ? setLeftPanelWidth(next) : setRightPanelWidth(next);
    };

    // finishes dragging, changes necessary states
    const onUp = () => { dragSide = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  if (!analysisResult) return null;

  
  return (
    <div className="flex flex-col h-full" style={{ background: '#3d3d3d' }}>
      <BarAtTopLol />
      <div className="flex flex-1 gap-0 px-2 pb-2 pt-1.5 overflow-hidden min-h-0">
        
        <div
          className="flex-shrink-0 overflow-hidden relative"
          style={{ width: isLPCollapsed ? 32 : leftPanelWidth, transition: 'width 0.18s ease' }}
        >
          {/*if panel collapsed then render collapsed, else show expanded panel*/}
          {isLPCollapsed ? (
            <CollapsedPanel title="Tests" onExpand={() => setIsLPCollapsed(false)} side="left" />
          ) : (
            <>
              <TestResultsPanel />
              <button
                onClick={() => setIsLPCollapsed(true)}
                title="Collapse panel"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-4 h-10 rounded-l-md transition-colors text-xs"
                style={{ background: '#1c1c1c', border: '1px solid #3d3d3d', borderRight: 'none', color: 'rgba(238,238,238,0.5)' }}
              >
                ‹
              </button>
            </>
          )}
        </div>

        {/* show test panel resize handle bar when not minimized */}
        {!isLPCollapsed && (
          <div className="drag-handle" onMouseDown={startDrag('left')} />
        )}
        {isLPCollapsed && <div className="w-1.5 flex-shrink-0" />}

        <GraphPanel graph={analysisResult.graph} />

        {/* show src panel resize handle bar when not minimized */}
        {!isRPCollapsed && (
          <div className="drag-handle" onMouseDown={startDrag('right')} />
        )}
        {isRPCollapsed && <div className="w-1.5 flex-shrink-0" />}

        {/* src panel */}
        <div
          className="flex-shrink-0 overflow-hidden relative"
          style={{ width: isRPCollapsed ? 32 : rightPanelWidth, transition: 'width 0.18s ease' }}
        >
          {isRPCollapsed ? (
            <CollapsedPanel title="Source" onExpand={() => setIsRPCollapsed(false)} side="right" />
          ) : (
            <>
              <button
                onClick={() => setIsRPCollapsed(true)}
                title="Collapse panel"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-4 h-10 rounded-r-md transition-colors text-xs"
                style={{ background: '#1c1c1c', border: '1px solid #3d3d3d', borderLeft: 'none', color: 'rgba(238,238,238,0.5)' }}
              >
                ›
              </button>
              <SourcePanel />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

