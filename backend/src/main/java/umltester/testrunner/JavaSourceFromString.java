package umltester.testrunner;


import javax.tools.SimpleJavaFileObject;
import java.io.IOException;
import java.net.URI;


/*
we use adapter design pattern here
    - Client is the java compiler
    - target is the JavaFileObject
    - JavaSourceFromString is the adapter
    - Adaptee is the source code

    - the class wraps a string and overrides getCharContent to return this string so the compiler and use it as it it was a file on disk
*/

public class JavaSourceFromString extends SimpleJavaFileObject{

    private final String sourceCode;

    public JavaSourceFromString(String className, String sourceCode) {

        super(URI.create("string:///" + className.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
        this.sourceCode = sourceCode;
    }

    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors) throws IOException {
        return sourceCode;
    }

}
