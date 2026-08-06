package umltester.model;

public final class NodeID {
    private final String value;

    private NodeID(String value) {
        this.value = value;
    }

    // factory method
    public static NodeID methodIDFactory(String className, String methodName) {
        
        return new NodeID("method-" + className + "-" + methodName);
    }

    // factory method
    public static String classIDFactory(String className) {
        return "class-" + className;
    }

    public String getValue() { 

        return value; 
    }


    // Equals method
    @Override public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (!(obj instanceof NodeID)) 
            return false;

        NodeID other = (NodeID) obj;
        return value.equals(other.value);
    }

    // Override hashcode or may cause issues
    @Override 
    public int hashCode() { 
        return value.hashCode();
    }

    @Override 
    public String toString() {
        
        return value;
    }
}
