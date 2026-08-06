package umltester.model;

import java.util.Collections;
import java.util.List;

public final class ClassNode implements GraphNode {
    private final String name;
    private final String classID;
    private final String sourceCode;
    private final List<MethodNode> methods;
    private final SourceLocation sourceLocation;

    public ClassNode(String name, String classID, String sourceCode, List<MethodNode> methods, SourceLocation sourceLocation) {
        this.name = name;
        this.classID = classID;
        this.sourceCode = sourceCode;
        this.methods = Collections.unmodifiableList(List.copyOf(methods));
        this.sourceLocation = sourceLocation;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getID() {
        return classID;
    }

    @Override
    public String getSourceCode() {
        return sourceCode;
    }

    public List<MethodNode> getMethods() {
        return methods;
    }

    @Override
    public SourceLocation getSourceLocation() {
        return sourceLocation;
    }

    @Override
    public String getType() {
        return "class";
    }


}
