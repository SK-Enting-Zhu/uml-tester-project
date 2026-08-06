package umltester.model;

import java.util.Collections;
import java.util.List;

public final class Graph {
    private final List<GraphNode> nodes;
    private final List<GraphEdge> edges;

    public Graph(List<GraphNode> nodes, List<GraphEdge> edges) {
        
        this.nodes = Collections.unmodifiableList(List.copyOf(nodes));
        this.edges = Collections.unmodifiableList(List.copyOf(edges));
    }

    public List<GraphNode> getNodes() {
        return nodes;
    }

    public List<GraphEdge> getEdges() {
        return edges; 
    }
}
