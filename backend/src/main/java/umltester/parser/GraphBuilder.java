package umltester.parser;

import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Set;

import umltester.model.ClassNode;
import umltester.model.Graph;
import umltester.model.GraphEdge;
import umltester.model.GraphNode;
import umltester.model.MethodNode;
import umltester.model.NodeID;
import umltester.model.SourceLocation;

/*
we use a builder pattern
    - Builder and concrete builder is the GraphBuilder
    - product is Graph
    - director is ClassCollector

*/
public class GraphBuilder {

    // we use linked hash map to preserve insertion order. 
    private final Map<String, ClassData> classes = new LinkedHashMap<>();
    private final List<GraphEdge> edges = new ArrayList<>();

    
    public void addClass(String className, String filename, String sourceCode) {

        classes.put(className, new ClassData(className, filename, sourceCode));
    }

    public void addMethod(String className, String methodName, String filename, String sourceCode) {
        NodeID currentMethodID = NodeID.methodIDFactory(className, methodName);
        String currentMethodName = methodName;
        String parentClassID = NodeID.classIDFactory(className);
        SourceLocation sourceLocation = new SourceLocation(filename);
        String currentMethodSourceCode = sourceCode;
        MethodNode currentMethod= new MethodNode(currentMethodName, currentMethodID, parentClassID, currentMethodSourceCode, sourceLocation);
        
        classes.get(className).methods.add(currentMethod);
    }


    public void addCall(String callerClass, String calleeClass, String callerMethod, String calleeMethod) {

        String source = NodeID.methodIDFactory(callerClass, callerMethod).getValue();
        String target = NodeID.methodIDFactory(calleeClass, calleeMethod).getValue();
        // changed to create edge from the source and target instead from the caller/callee class/method strings
        String edgeID = source + "-calls-" + target;

        addEdge(edgeID, source, target, "call");
    }


    public void addInheritance(String childClass, String parentClass) {
        String source = NodeID.classIDFactory(childClass);
        String target = NodeID.classIDFactory(parentClass);
        String edgeID = childClass + "-extends-" + parentClass;

        addEdge(edgeID, source, target, "inheritance");
    }

    private void addEdge(String edgeID, String source, String target, String type) {
        edges.add(new GraphEdge(edgeID, source, target, type));
    }


    public Graph build() {
        List<GraphNode> nodes = new ArrayList<>();
        Set<String> nodeIDs = new HashSet<>();

        for (ClassData item : classes.values()) {

            SourceLocation srcLocation = new SourceLocation(item.fileName);
            String srcCode = item.sourceCode;

            ClassNode nodeItem = new ClassNode(item.name, NodeID.classIDFactory(item.name), srcCode, item.methods,srcLocation);

            nodes.add(nodeItem);
            nodeIDs.add(nodeItem.getID());
            nodes.addAll(item.methods);

            for (MethodNode methodNode : item.methods) {
                nodeIDs.add(methodNode.getID());
            }
        }

        // placeholder for calls that resolve for non uploaded files/classes
        ClassNode externalNode = new ClassNode("External", "external", "", new ArrayList<>(), new SourceLocation(""));
        Set<String> redirectedSources = new HashSet<>();
        boolean goesToExternal = false;

        List<GraphEdge> validEdges = new ArrayList<>();
        for (GraphEdge edge : edges) {
            if (nodeIDs.contains(edge.getTarget())) {
                validEdges.add(edge);
                continue;
            }

            // all non targets get redirected to external node
            goesToExternal = true;
            
            String source = edge.getSource();
            boolean isNewSource = redirectedSources.add(source);
            if (!isNewSource) {
                continue;
            }

            String externalEdgeID = source + "-calls-external";
            GraphEdge externalEdge = new GraphEdge(externalEdgeID, source, "external", edge.getType());
            validEdges.add(externalEdge);
        }
        

        if (goesToExternal) nodes.add(externalNode);
        
        // i hate graphs from 251 and 240 :(
        Graph thisGraph = new Graph(nodes, validEdges);
        return thisGraph;

    }

    //temporarily store and create actual class nodes later as class requires list of methods
    private static class ClassData {
        final String name;
        final String fileName;
        final String sourceCode;
        final List<MethodNode> methods = new ArrayList<>();

        private ClassData(String name, String fileName, String sourceCode) {
            this.name = name;
            this.fileName = fileName;
            this.sourceCode = sourceCode;
        }
    }
}
