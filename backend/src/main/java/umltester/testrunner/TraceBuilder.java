package umltester.testrunner;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import umltester.model.NodeID;
import umltester.model.Trace;
import umltester.model.TraceElement;

/*
turn an exception that are caught into a call trace (Trace object)
    so that frontend can use for isolation feature on graph panel
*/
public class TraceBuilder {

    public static Trace buildTrace(Throwable throwable, Set<String> compiledClassNames) {

        // walk to deepest place as exception as stack trace is there
        Throwable rootCause = throwable;
        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        StackTraceElement[] stack = rootCause.getStackTrace();
        List<StackTraceElement> filtered = new ArrayList<>();

        for (StackTraceElement frame : stack) {
            if (compiledClassNames.contains(frame.getClassName())) {
                filtered.add(frame);
            }
        }

        // since we started at inner most first
        Collections.reverse(filtered);
        List<TraceElement> elements = new ArrayList<>();

        // convert stack frame into TraceElement object
        for (StackTraceElement frame : filtered) {
            // java uses $ to separate nested class
            String rawClassName = frame.getClassName().replace('$', '.');
            String simpleClassName = rawClassName.substring(rawClassName.lastIndexOf('.') + 1);

            // rename constructors
            String methodName = frame.getMethodName();
            if (methodName.equals("<init>")) {
                methodName = simpleClassName;
            }
            
            String methodId = NodeID.methodIDFactory(simpleClassName, methodName).getValue();
            elements.add(new TraceElement(methodId));
        }

        return new Trace(elements);
    }

}