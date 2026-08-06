package umltester.model;

public final class MethodNode implements GraphNode {
    private final String name;
    private final NodeID methodID;
    private final String parentClassID;
    private final String sourceCode;
    private final SourceLocation sourceLocation;

    public MethodNode(String name, NodeID methodID, String parentClassID, String sourceCode, SourceLocation sourceLocation) {
        this.name = name;
        this.methodID = methodID;
        this.parentClassID = parentClassID;
        this.sourceCode = sourceCode;
        this.sourceLocation = sourceLocation;
    }

    // add () so can tell method apart from a class
    @Override
    public String getName() {
        return name + "()";
    }

    @Override
    public String getID() {

        return methodID.getValue();
    }

    public NodeID getNodeID() {

        return methodID;
    }

    @Override
    public String getType() {

        return "method";
    }

    public String getParentClass() {
        return parentClassID;
    }

    @Override
    public String getSourceCode() {
        return sourceCode;
    }

    @Override
    public SourceLocation getSourceLocation(){
        return sourceLocation;
    }

}
