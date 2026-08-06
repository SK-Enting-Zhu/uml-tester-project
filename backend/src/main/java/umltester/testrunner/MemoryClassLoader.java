package umltester.testrunner;

import java.util.Map;


/*
we use template method here
    - abstract class is classloader
    - concrete class is the MemoryClassLoader itself

    - we use fields and methods that ClassLoader provides
    - loadClass() is a method that ClassLoader provides, and calls findClass() internally. So we override findClass() with our read from memory algo, so that it doesnt read from disk
*/

public class MemoryClassLoader extends ClassLoader {

    private final Map<String, byte[]> compiledClass;

    public MemoryClassLoader(Map<String, byte[]> compiledClass, ClassLoader parent) {
        super(parent);
        // classes from uploaded files are missing from normal classpath
        this.compiledClass = compiledClass;
    }


    // call if parent class loader can't find class
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = compiledClass.get(name);

        if(bytes == null) {
            throw new ClassNotFoundException();
        }

        return defineClass(name, bytes, 0, bytes.length);
    }

}
