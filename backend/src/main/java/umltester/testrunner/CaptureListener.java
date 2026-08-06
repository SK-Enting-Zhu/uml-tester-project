package umltester.testrunner;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;

import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.support.descriptor.MethodSource;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;

import umltester.model.TestRun;
import umltester.model.Trace;


/*
Use observer pattern (more like listener). 
    - Our subject is the Junit Launcher
    - TestExecutionListener is the observer interface
    - CaptureListener is the concrete observer
    
    - listens for junit test results as they finish executing and converts into a TestRun that we can use. 
    - TestExecutionListener gets notified and CaptureListener reacts to the executionFinished(...) callback.

*/
public class CaptureListener implements TestExecutionListener {

    private final List<TestRun> testRuns = new ArrayList<>();
    private final Set<String> compiledClassNames;
    private int nextID = 1;

    public CaptureListener(Set<String> compiledClassNames) {
        this.compiledClassNames = compiledClassNames;
    }


    @Override
    public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult res) {

        if (!testIdentifier.isTest()) {
            return;
        }

        // junit tags each test with a src for where it comes from
        MethodSource src = (MethodSource) testIdentifier.getSource().orElseThrow();
        String methodName = src.getMethodName();

        // junit's own enum
        String status;
        switch (res.getStatus()) {
            case SUCCESSFUL: 
                status = "passed"; 
                break;
            case FAILED: 
                status = "failed"; 
                break;
            default: 
                status = "error"; 
                break;
        }

        // no msg and trace for a passed test
        String assertionMessage = null;
        Trace trace = new Trace(List.of());

        if (res.getThrowable().isPresent()) {
            Throwable throwable = res.getThrowable().get();
            assertionMessage = throwable.getClass().getSimpleName() + ": " + throwable.getMessage();
            // hand exception to trace builder to build trace
            trace = TraceBuilder.buildTrace(throwable, compiledClassNames);
        }
        
        testRuns.add(new TestRun(String.valueOf(nextID++), methodName, status, trace, assertionMessage));

    }

    public List<TestRun> getTestRuns() {
        return testRuns;
    }


}
