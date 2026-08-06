// call trace component of Tests panel. 


import { Graph, Trace } from '../../../types';
import { useStore } from '../../../store/useStore';


interface Props {
  trace: Trace;
  graph: Graph;
}

/**
 * searches a graph object's nodes and tries to find a n.id match.
 * then return that name
 * 
 */
function methodLabel(methodId: string, graph: Graph): string {
  return graph.nodes.find((n) => n.id === methodId)?.name ?? methodId;
}

export default function TraceView({ trace, graph }: Props) {
  // store the function 
  const setSelectedNodeId = useStore((s) => s.setSelectedNodeId);

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Call Trace</p>
      <div className="space-y-0.5">
        {trace.elements.map((el, i) => (
          <div key={i} className="trace-line" onClick={() => setSelectedNodeId(el.methodId)}>
            <span className="text-slate-600 select-none flex-shrink-0">→</span>
            <span className="flex-1 text-slate-300" style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}>
              {methodLabel(el.methodId, graph)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
