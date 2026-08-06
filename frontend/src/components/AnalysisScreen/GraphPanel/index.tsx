import { useEffect, useRef } from 'react';
import cytoscape, { ElementDefinition, StylesheetStyle } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Graph, LayoutStrategy } from '../../../types';
import { useStore } from '../../../store/useStore';


cytoscape.use(coseBilkent);


// style for the graph
const GRAPH_STYLE: StylesheetStyle[] = [
  {
    selector: 'core',
    style: {
      'active-bg-color': 'transparent',
      'active-bg-opacity': 0,
      'active-bg-size': 0,
      'selection-box-color': 'transparent',
      'selection-box-border-color': 'transparent',
      'selection-box-opacity': 0,
    } as cytoscape.Css.Core,
  },
  {
    selector: 'node[type="class"]',
    style: {
      'background-color': '#1c1c1c',
      'border-color': '#3d3d3d',
      'border-width': 2,
      label: 'data(label)',
      color: '#EEEEEE',
      'font-size': 13,
      'font-weight': 'bold',
      'text-valign': 'top',
      'text-halign': 'center',
      padding: '26px',
      shape: 'roundrectangle',
      'text-margin-y': -6,
    } as cytoscape.Css.Node,
  },
  {
    selector: 'node[type="method"]',
    style: {
      'background-color': '#111111',
      'border-color': '#1c1c1c',
      'border-width': 1,
      label: 'data(label)',
      color: 'rgba(238,238,238,0.75)',
      'font-size': 11,
      'text-valign': 'center',
      'text-halign': 'center',
      shape: 'roundrectangle',
      'text-wrap': 'none',
      width: 'label',
      height: 'label',
      padding: '14px',
    } as cytoscape.Css.Node,
  },
  {
    selector: 'node:selected',
    style: { 'border-color': '#EEEEEE', 'border-width': 3 } as cytoscape.Css.Node,
  },
  {
    selector: 'node[type="class"]:selected',
    style: { 'background-color': '#242424', 'border-color': '#EEEEEE' } as cytoscape.Css.Node,
  },
  {
    selector: 'node[type="method"]:selected',
    style: { 'background-color': '#1c1c1c', 'border-color': '#EEEEEE', color: '#EEEEEE' } as cytoscape.Css.Node,
  },
  {
    selector: 'edge[type="call"]',
    style: {
      'line-color': '#EEEEEE',
      'target-arrow-color': '#EEEEEE',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      width: 1.5,
      opacity: 0.6,
    } as cytoscape.Css.Edge,
  },
  {
    selector: 'edge[type="inheritance"]',
    style: {
      'line-color': '#3d3d3d',
      'target-arrow-color': '#3d3d3d',
      'target-arrow-shape': 'triangle',
      'line-style': 'dashed',
      'line-dash-pattern': [8, 4],
      'curve-style': 'bezier',
      width: 1.5,
      opacity: 0.9,
    } as cytoscape.Css.Edge,
  },
  {
    selector: 'edge:selected',
    style: { 'line-color': '#EEEEEE', 'target-arrow-color': '#EEEEEE', width: 2.5, opacity: 1 } as cytoscape.Css.Edge,
  },
];


function buildElements(graph: Graph): ElementDefinition[] {
  // requires single "flat" array
  const els: ElementDefinition[] = [];
  
  for (const node of graph.nodes) {
    // if is class, create it as a class data
    if (node.type === 'class') {
      els.push({ data: { id: node.id, label: '▼  ' + node.name, type: 'class' } });
    } else {
      // else is method, create it as a method data
        // parent prop make cose nest this method inside its class box/area
      els.push({
        data: { id: node.id, label: node.name, parent: node.parentClass, type: 'method' },
      });
    }
  }
  
  // Edges reference IDs of src and target nodes to render connecting edges
  for (const edge of graph.edges) {
    els.push({ data: { id: edge.id, source: edge.source, target: edge.target, type: edge.type } });
  }

  return els;

}


// resolve id, if node part of collapsed class, return class id  
function resolveVisible(nodeId: string, collapsedClasses: Set<string>, cy: cytoscape.Core): string {
  const node = cy.$(`#${CSS.escape(nodeId)}`);
  // if method inside class, need to know if class is currently collapsed so we can correctly draw edge to class not method
  const parent = node.data('parent') as string | undefined;
  if (parent && collapsedClasses.has(parent)) return parent;
  return nodeId;
}


// implmement collapse/expand. (i.e. hide/show methods, update labels, rebuild aggregated edges)
function syncCollapse(cy: cytoscape.Core, collapsedClasses: Set<string>) {
  // remove all previous edges,
  cy.remove('[aggregated="true"]');
  cy.nodes('[type="class"]').style('display', 'element');
  cy.nodes('[type="method"]').style('display', 'element');
  cy.edges().style('display', 'element');

  // update ▼ and ▶ appropriately
  // remov and rewrite with new triangle to all edges
  cy.nodes('[type="class"]').forEach((classNode) => {
    const id = classNode.id();
    const raw = (classNode.data('label') as string).replace(/^[▼▶]\s+/, '');
    classNode.data('label', (collapsedClasses.has(id) ? '▶  ' : '▼  ') + raw);
  });

  // for each collapsed class, hide methods and add aggregated class edges
  const addedKeys = new Set<string>();

  collapsedClasses.forEach((classId) => {
    const methodNodes = cy.nodes(`[parent="${classId}"]`);
    const methodIds = new Set<string>(methodNodes.map((n) => n.id() as string));

    methodNodes.style('display', 'none');

    methodNodes.connectedEdges().forEach((edge) => {
      const srcId = edge.source().id() as string;
      const tgtId = edge.target().id() as string;
      const srcIn = methodIds.has(srcId);
      const tgtIn = methodIds.has(tgtId);

      edge.style('display', 'none');

      if (srcIn && !tgtIn) {
        const resolvedTgt = resolveVisible(tgtId, collapsedClasses, cy);
        if (resolvedTgt === classId) return;
        const key = `out|${classId}|${resolvedTgt}`;
        if (!addedKeys.has(key)) {
          addedKeys.add(key);
          cy.add({ data: { id: `agg-${key}`, source: classId, target: resolvedTgt, type: edge.data('type') as string, aggregated: 'true' } });
        }
      } else if (!srcIn && tgtIn) {
        const resolvedSrc = resolveVisible(srcId, collapsedClasses, cy);
        if (resolvedSrc === classId) return;
        const key = `in|${resolvedSrc}|${classId}`;
        if (!addedKeys.has(key)) {
          addedKeys.add(key);
          cy.add({ data: { id: `agg-${key}`, source: resolvedSrc, target: classId, type: edge.data('type') as string, aggregated: 'true' } });
        }
      }
    });
  });

  // hide all remaining edges with hidden endpoints
  cy.edges().forEach((edge) => {
    if (edge.source().style('display') === 'none' || edge.target().style('display') === 'none') {
      edge.style('display', 'none');
    }
  });
}

//Overrides collapse entirely while active
function syncIsolate(cy: cytoscape.Core, methodIds: Set<string>) {
  cy.remove('[aggregated="true"]');
  cy.nodes('[type="class"]').style('display', 'element');
  cy.nodes('[type="method"]').style('display', 'element');
  cy.edges().style('display', 'element');

  // hide every method not part of this test's trace
  cy.nodes('[type="method"]').forEach((node) => {
    if (!methodIds.has(node.id() as string)) {
      node.style('display', 'none');
    }
  });

  // hide every class with no visible children
  cy.nodes('[type="class"]').forEach((classNode) => {
    const children = cy.nodes(`[parent="${classNode.id()}"]`);
    const anyVisible = children.some((child) => child.style('display') !== 'none');
    if (!anyVisible) {
      classNode.style('display', 'none');
    }
  });

  cy.edges().forEach((edge) => {
    if (edge.source().style('display') === 'none' || edge.target().style('display') === 'none') {
      edge.style('display', 'none');
    }
  });
}

function layoutConfig(strategy: LayoutStrategy): cytoscape.LayoutOptions {
  if (strategy === 'force-directed') {
    return {
      name: 'cose-bilkent',
      animate: true,
      animationDuration: 600,
      nodeRepulsion: 4500,
      idealEdgeLength: 60,
      nestingFactor: 0.1,
      gravity: 0.4,
      gravityRange: 3.8,
      gravityCompound: 1.5,
      gravityRangeCompound: 1.5,
      tile: true,
      tilingPaddingVertical: 20,
      tilingPaddingHorizontal: 20,
      numIter: 2500,
      randomize: true,
    } as cytoscape.LayoutOptions;
  }
  return {
    name: 'breadthfirst',
    animate: true,
    animationDuration: 500,
    directed: true,
    padding: 50,
    spacingFactor: 1.6,
  } as cytoscape.LayoutOptions;
}

interface Props { graph: Graph }

export default function GraphPanel({ graph }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useStore((s) => s.setSelectedNodeId);
  const collapsedClasses = useStore((s) => s.collapsedClasses);
  const toggleClassCollapse = useStore((s) => s.toggleClassCollapse);
  const isolatedTestId = useStore((s) => s.isolatedTestId);
  const analysisResult = useStore((s) => s.analysisResult);

  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(graph),
      style: GRAPH_STYLE,
      layout: layoutConfig('force-directed'),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.on('tap', 'node[type="method"]', (evt) => {
      evt.stopPropagation();
      setSelectedNodeId(evt.target.id() as string);
    });

    cy.on('tap', 'node[type="class"]', (evt) => {
      setSelectedNodeId(evt.target.id() as string);
    });

    cy.on('dblclick', 'node[type="class"]', (evt) => {
      toggleClassCollapse(evt.target.id() as string);
    });

    cy.on('tap', (evt) => { if (evt.target === cy) setSelectedNodeId(null); });

    cyRef.current = cy;
    return () => { cy.destroy(); cyRef.current = null; };
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;
    if (isolatedTestId) {
      const test = analysisResult?.testRuns.find((t) => t.id === isolatedTestId);
      const methodIds = new Set(test?.trace.elements.map((el) => el.methodId) ?? []);
      syncIsolate(cyRef.current, methodIds);
    } else {
      syncCollapse(cyRef.current, collapsedClasses);
    }
  }, [collapsedClasses, isolatedTestId, analysisResult]);


  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().unselect();
    if (selectedNodeId) {
      const el = cy.$(`#${CSS.escape(selectedNodeId)}`);
      if (el.length) {
        el.select();
        cy.animate({ center: { eles: el }, zoom: Math.max(cy.zoom(), 1) }, { duration: 350 });
      }
    }
  }, [selectedNodeId]);

  return (
    <div className="panel flex-1 relative min-w-0">
      <div className="panel-header flex items-center justify-between">
        <span>Call Graph</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-xs">
            {graph.nodes.filter((n) => n.type === 'class').length} classes · {graph.nodes.filter((n) => n.type === 'method').length} methods
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10">
        <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
          <span className="flex items-center gap-1.5" style={{ color: 'rgba(238,238,238,0.5)' }}>
            <span className="inline-block w-5 border-t-2 opacity-60" style={{ borderColor: '#EEEEEE' }} /> Call
          </span>
          <span className="flex items-center gap-1.5" style={{ color: 'rgba(238,238,238,0.5)' }}>
            <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: '#3d3d3d' }} /> Inheritance
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-600">Click class to collapse · Drag to reposition</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 0, background: '#111111', WebkitTapHighlightColor: 'transparent', outline: 'none' }} />
    </div>
  );
}