package umltester.testrunner;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.ArrayList;
import java.util.concurrent.ExecutionException;
import java.io.File;
import java.net.URLClassLoader;
import java.net.URL;
import java.io.IOException;

import org.junit.platform.engine.discovery.ClassSelector;
import org.junit.platform.launcher.LauncherDiscoveryRequest;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.engine.discovery.DiscoverySelectors;

import umltester.model.TestRun;
import umltester.model.JavaFile;
import umltester.model.Trace;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaFileObject;
import javax.tools.Diagnostic;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import javax.tools.StandardJavaFileManager;
import javax.tools.StandardLocation;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.ast.body.TypeDeclaration;


public class JunitTestRunner implements TestRunner {

    private static final long TIMEOUT_SECONDS = 5;

    // need to compile and run @Test methods from the files. 
    // Each is a TestRun object that runs or stops due to error.
    // If a TestRun returns as a failure, need a error to use.
    @Override
    public List<TestRun> run(List<JavaFile> files) {
        // If no @Test methods exist, no need to do anything
        if (!hasTestMethods(files)) {
            return List.of();
        }

        // need to record all compiler errors so we can use it instead of just a simple pass/fail
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        Map<String, byte[]> compiledClasses = compile(files, diagnostics);
        // compile either returns bytecode map (succ) or nothing (fail)
        if (compiledClasses == null) {
            StringBuilder message = new StringBuilder();

            for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
                message.append(diagnostic.toString()).append("\n");
            }

            return List.of(errorRun("compile-error", "Compilation", message.toString()));
        }

        // compiled tests that refer to JUnit won't resolve
        MemoryClassLoader classLoader = new MemoryClassLoader(compiledClasses, JunitTestRunner.class.getClassLoader());
        List<ClassSelector> selectors;
        
        try {
            selectors = buildSelectros(files, classLoader);
        } 
        // SHOULD NEVER TRIGGER: resolved class name != compiled class name
        catch (ClassNotFoundException exception) {
            throw new RuntimeException("you screwed up bad.", exception);
        }

        // need to handle all exceptions that we might encounter as cant allow backend to crash
        // take the selectors and wrap into request object as launcher requires it
        LauncherDiscoveryRequest request = LauncherDiscoveryRequestBuilder.request().selectors(selectors).build();
        CaptureListener listener = new CaptureListener(compiledClasses.keySet());
        // in case of an infinite loop
        ExecutorService executor = Executors.newSingleThreadExecutor();

        try {
            Future<?> future = executor.submit(() -> {
                ClassLoader previousClassLoader = Thread.currentThread().getContextClassLoader();
                try {
                    Thread.currentThread().setContextClassLoader(classLoader);
                    Launcher launcher = LauncherFactory.create();
                    launcher.execute(request, listener);
                } 
                finally {
                    Thread.currentThread().setContextClassLoader(previousClassLoader);
                }
            });
            future.get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
        } 
        catch (TimeoutException e) {
            List<TestRun> partial = new ArrayList<>(listener.getTestRuns());
            partial.add(errorRun("timeout", "Test Execution", "timeout errror"));
            return partial;
        } 
        catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return listener.getTestRuns();
        }
        catch (ExecutionException e) {
            List<TestRun> partial = new ArrayList<>(listener.getTestRuns());
            String message = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            partial.add(errorRun("execution-error", "Test Execution", message));
            return partial;
        }
        finally {
            executor.shutdownNow();
        }

        return listener.getTestRuns();
    }

    // error test run object to use for errors not tied to a @Test method
    private TestRun errorRun(String id, String name, String message) {
        return new TestRun(id, name, "error", new Trace(List.of()), message);
    }
    
    // each class name needs to turn into a class object thru mem class loader before Junit can scan for @Test methods
    private List<ClassSelector> buildSelectros(List<JavaFile> files, MemoryClassLoader classLoader) throws ClassNotFoundException {

        List<ClassSelector> selectors = new ArrayList<>();
        
        for (JavaFile file : files) {
            String className = resolveNameString(file);
            Class<?> clazz = Class.forName(className, false, classLoader);
            selectors.add(DiscoverySelectors.selectClass(clazz));
        }

        return selectors;
    }

    // compile every file into bytecode in memory
    private Map<String, byte[]> compile(List<JavaFile> files, DiagnosticCollector<JavaFileObject> diagnostics) {

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        List<JavaSourceFromString> sourceFiles = new ArrayList<>();

        for (JavaFile file : files) {
            String className = resolveNameString(file);
            sourceFiles.add(new JavaSourceFromString(className, file.getContent()));
        }

        StandardJavaFileManager manager = compiler.getStandardFileManager(null, null, null);
        setPath(manager);

        InMemoryFileManager fileManager = new InMemoryFileManager(manager);
        JavaCompiler.CompilationTask task = compiler.getTask(null, fileManager, diagnostics, List.of("--release", "21"), null, sourceFiles);

        // compile
        boolean success = task.call();

        /// succ = bytecode, fail = can use to construct error msg 
        if (success) {
            return fileManager.getCompiledClass();
        }

        return null;
    }

    // finds list of correct places for dependencies
    private void setPath(StandardJavaFileManager fileManager) {
        try {
            // resolves junit-jupiter-api to compile
            ClassLoader loader = JunitTestRunner.class.getClassLoader();
            List<File> classpath = new ArrayList<>();

            if (loader instanceof URLClassLoader urlClassLoader) {
                for (URL url : urlClassLoader.getURLs()) {
                    classpath.add(new File(url.getPath()));
                }
            } 
            else {
                String javaClassPath = System.getProperty("java.class.path");
                for (String entry : javaClassPath.split(File.pathSeparator)) {
                    classpath.add(new File(entry));
                }
            }
            // we want to force compiler to use this list instead of its default
            fileManager.setLocation(StandardLocation.CLASS_PATH, classpath);
        } 
        catch (IOException e) {
            throw new RuntimeException("Failed to configure compiler classpath", e);
        }
    }

    // when class name is needed, parse file, find top level public type and return name
    private String resolveNameString(JavaFile file) {

        JavaParser parser = new JavaParser();
        ParseResult<CompilationUnit> res = parser.parse(file.getContent());
        CompilationUnit cu = res.getResult().get();

        for (TypeDeclaration<?> type : cu.getTypes()) {

            if (type.isPublic()) {
                return type.getFullyQualifiedName().orElse(type.getNameAsString());
            }
        }

        throw new IllegalStateException("no class in" + file.getFilename());

    }

    // no test methods equal no testing
    private boolean hasTestMethods(List<JavaFile> files) {

        for (JavaFile file : files) {
            JavaParser parser = new JavaParser();
            ParseResult<CompilationUnit> result = parser.parse(file.getContent());

            if (result.getResult().isEmpty()) {
                continue;
            }

            CompilationUnit cu = result.getResult().get();
            for (MethodDeclaration method : cu.findAll(MethodDeclaration.class)) {

                for (AnnotationExpr annotation : method.getAnnotations()) {
                    if (annotation.getName().getIdentifier().equals("Test")) {
                        return true;

                    }
                }
            }

            
        }

        return false;
    }


}