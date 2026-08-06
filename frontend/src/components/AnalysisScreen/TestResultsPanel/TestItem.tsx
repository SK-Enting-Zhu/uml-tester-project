import { useState } from 'react';
import { Graph, TestRun } from '../../../types';
import { useStore } from '../../../store/useStore';
import TraceView from './TraceView';

interface Props {
  test: TestRun;
  graph: Graph;
}

export default function TestItem({ test, graph }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isPassed = test.status === 'passed';
  const isolatedTestId = useStore((s) => s.isolatedTestId);
  const toggleIsolatedTest = useStore((s) => s.toggleIsolatedTest);
  const hasTrace = test.trace.elements.length > 0;
  const isIsolated = isolatedTestId === test.id;


  return (
    <div
      className="border rounded-lg overflow-hidden transition-colors"
      style={!isPassed
        ? { borderColor: 'rgba(185,28,28,0.6)', background: 'rgba(127,29,29,0.15)' }
        : { borderColor: '#2e2e2e', background: 'rgba(255, 255, 255, 0.04)' }}
    >
      {/* expand or collapse the trace below */}
      <button
        className="w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors"
        style={{ background: 'transparent', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="flex-1 text-sm font-medium min-w-0"
          style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}
        >
          {test.name}
        </span>
        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'rgba(238,238,238,0.3)' }}> ▾ </span>
      </button>

      {/* isolate test's trace in the call graph */}
      {hasTrace && (
        <div className="px-3 pb-2.5">
          <button
            className="text-xs px-2 py-1 rounded transition-colors"
            style={isIsolated
              ? { background: '#EEEEEE', color: '#111111', outline: 'none', WebkitTapHighlightColor: 'transparent' }
              : { background: '#1c1c1c', color: 'rgba(238,238,238,0.6)', border: '1px solid #2e2e2e', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            onClick={() => toggleIsolatedTest(test.id)}
          >
            {isIsolated ? 'Clear isolation' : 'Isolate in graph'}
          </button>
        </div>
      )}

      {/*error message and call trace */}
      {expanded && (
        <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {/* error from JUnit if test failed */}
          {test.assertionMessage && (
            <div className="mt-2 p-2 bg-red-950/40 border border-red-900/40 rounded text-xs font-mono text-red-400 leading-relaxed"
              style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}>
              {test.assertionMessage}
            </div>
          )}

          <TraceView
            trace={test.trace}
            graph={graph}
          />
        </div>
      )}
    </div>
  );
}