package umltester.model;

public final class JavaFile {
    private final String filename;
    private final String content;

    public JavaFile(String filename, String content) {
        this.filename = filename;
        this.content = content;
    }

    public String getFilename() { 
        return filename; 
    }

    public String getContent()  { 
        return content; 
    }
}

