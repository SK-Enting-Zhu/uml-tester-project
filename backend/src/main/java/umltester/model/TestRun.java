package umltester.model;


public final class TestRun {

    private final String id;
    private final String name;
    private final String status;
    private final Trace trace;
    private final String assertionMessage;

    public TestRun(String id, String name, String status, Trace trace, String assertionMessage) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.trace = trace;
        this.assertionMessage = assertionMessage;
    }

    public String getID() {

        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getStatus() {
        return this.status;
    }

    public Trace getTrace() {
        
        return this.trace;
    }

    public String getAssertionMessage() {
        return this.assertionMessage;
    }

}
