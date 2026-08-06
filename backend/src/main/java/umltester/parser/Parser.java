package umltester.parser;

import umltester.model.Graph;
import umltester.model.JavaFile;
import java.util.List;

public interface Parser {

    Graph parse(List<JavaFile> files);

}
