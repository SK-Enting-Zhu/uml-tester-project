package umltester.testrunner;

import java.util.HashMap;
import java.util.Map;

import javax.tools.ForwardingJavaFileManager;
import javax.tools.StandardJavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.FileObject;

public final class InMemoryFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {

    private final Map<String, JavaClassInMemory> compiledClasses = new HashMap<>();

    public InMemoryFileManager(StandardJavaFileManager manager) {
        super(manager);
    }


    // need real JavaFileObject to write class bytecode into, so use from memory 
    @Override
    public JavaClassInMemory getJavaFileForOutput(Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {

        JavaClassInMemory file = new JavaClassInMemory(className);
        compiledClasses.put(className, file);
        return file;
        
    }
    

    // called when compiling is completely done, in case getting bytes too early. we wait until completely finished
    public Map<String, byte[]> getCompiledClass() {

        // map:     class name -> bytecode
        Map<String, byte[]> res = new HashMap<>();

        for (Map.Entry<String, JavaClassInMemory> entry : compiledClasses.entrySet()) {
            res.put(entry.getKey(), entry.getValue().getBytes());
        }

        return res;

    }
}
