package umltester.model;

public interface GraphNode {

    String getName();

    String getID();

    String getType();

    String getSourceCode();

    SourceLocation getSourceLocation();
}
