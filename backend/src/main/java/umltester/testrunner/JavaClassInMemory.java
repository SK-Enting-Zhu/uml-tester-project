package umltester.testrunner;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.net.URI;

import javax.tools.SimpleJavaFileObject;

/* 
uses adapter design pattern here too
    - client is the java compiler
    - target is the JavaFileObject
    - adapter is the JavaClassInMemory
    - adaptee is the ByteArrayOutputStream

    - compiler only knows how to write bytecode into JavaFileObjects
    - this class would wrap a bos and overrides openOutputStream to return this bos so that it works as if it were writting .class files onto disk

*/
public final class JavaClassInMemory extends SimpleJavaFileObject {
    private final ByteArrayOutputStream bos;

    public JavaClassInMemory(String className) {
        super(URI.create("string:///" + className.replace('.', '/') + Kind.CLASS.extension), Kind.CLASS);
        this.bos = new ByteArrayOutputStream();
    }


    @Override
    public OutputStream openOutputStream() {
        return bos;
    }

    public byte[] getBytes() {
        
        return bos.toByteArray();
    }

}
