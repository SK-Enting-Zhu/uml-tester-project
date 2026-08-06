package umltester.model;

import java.util.Collections;
import java.util.List;

// made of call graph and test results (if any)
public final class AnalysisResult {
    private final Graph graph;
    private final List<TestRun> testRuns;

    public AnalysisResult(Graph graph, List<TestRun> testRuns) {
        this.graph = graph;
        this.testRuns = Collections.unmodifiableList(List.copyOf(testRuns));
    }

    public Graph getGraph() { 
        return graph; 
    }
    
    public List<TestRun> getTestRuns() { 
        return testRuns; 
    }
}
