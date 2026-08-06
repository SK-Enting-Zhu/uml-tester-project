package umltester.testrunner;

import java.util.List;

import umltester.model.TestRun;
import umltester.model.JavaFile;

public interface TestRunner {

    List<TestRun> run(List<JavaFile> files);

}