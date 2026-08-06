package umltester.model;

import java.util.Collections;
import java.util.List;

public final class Trace {

    private final List<TraceElement> elements;

    public Trace(List<TraceElement> elements) {
        this.elements = Collections.unmodifiableList(List.copyOf(elements));
    }

    public List<TraceElement> getElements() {
        return this.elements;
    }

}
