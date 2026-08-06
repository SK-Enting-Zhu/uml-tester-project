package umltester.model;

public final class TraceElement {
    private final String methodId;

    public TraceElement(String methodId) {
        this.methodId = methodId;
    }

    public String getMethodId() {
        return this.methodId;
    }
}
