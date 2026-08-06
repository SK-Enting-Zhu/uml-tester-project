package umltester;

import java.util.List;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.javalin.Javalin;
import umltester.parser.FileParser;
import umltester.testrunner.JunitTestRunner;
import umltester.testrunner.TestRunner;
import umltester.model.JavaFile;
import umltester.model.AnalysisResult;
import umltester.model.Graph;
import umltester.model.TestRun;

public final class Main {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {

        FileParser parser = new FileParser();
        TestRunner testRunner = new JunitTestRunner();

        var app = Javalin.create().start(8000);

        app.post("/api/analyze", ctx -> {
            List<JavaFile> files = new ArrayList<>();

            for (var uploaded : ctx.uploadedFiles("files")) {
                String fileName = uploaded.filename();
                String content = new String(uploaded.content().readAllBytes());
                files.add(new JavaFile(fileName, content));
            }

            Graph graph = parser.parse(files);

            // Compile and run any uploaded JUnit tests.
            List<TestRun> testRuns;
            try {
                testRuns = testRunner.run(files);
            } catch (Exception e) {
                logger.error("Test execution failed unexpectedly", e);
                testRuns = List.of();
            }

            AnalysisResult result = new AnalysisResult(graph, testRuns);

            // write into HTTP response. Frontend receives this and turns it into TS type.
            ctx.json(result);

        });
    }

}