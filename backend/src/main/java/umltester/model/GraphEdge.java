package umltester.model;

public final class GraphEdge {
    private final String id;
    private final String source;
    private final String target;
    private final String type;

    public GraphEdge(String id, String source, String target, String type) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.type = type;
    }

    public String getID() {
        
        return id;
    }
    
    public String getSource() { 
        return source; 
    }
    
    public String getTarget() { 
        return target; 
    }
    
    public String getType(){ 
        return type; 
        
    }

}
