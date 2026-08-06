/**
 * Every node is a class or method
 * Every edge is UML diagram relationship
 * Every analysis stage possible in the analysis
 * Two possible ways to display the graph
 * Three ways to that a test can end up in
 */
export type NodeType = 'class' | 'method';
export type EdgeType = 'call' | 'inheritance' | 'association' | 'dependency' | 'composition';
export type AnalysisStage = 'idle' | 'parsing' | 'running-tests' | 'complete' | 'error';
export type LayoutStrategy = 'hierarchical' | 'force-directed';
export type TestStatus = 'passed' | 'failed' | 'error';

// location of src code for nodes when we click on one
export interface SourceLocation {
  file: string;
}

// A graph or method node and all the info relating to it
export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  parentClass?: string;
  sourceLocation?: SourceLocation;
  sourceCode?: string;
}

// a relationship between two nodes and all the info relating to it
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
}

// Graph = list of V and list of E
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// each step in a trace
export interface TraceElement {
  methodId: string;
}

// a trace comprised of an array of TraceElements
export interface Trace {
  elements: TraceElement[];
}

// A junit test
export interface TestRun {
  id: string;
  name: string;
  status: TestStatus;
  trace: Trace;
  assertionMessage?: string;
}

// a singular full analysis. what backend will return. 
export interface AnalysisResult {
  graph: Graph;
  testRuns: TestRun[];
}
