package umltester.parser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import umltester.model.JavaFile;
import umltester.model.Graph;

import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import com.github.javaparser.resolution.declarations.ResolvedMethodDeclaration;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.MemoryTypeSolver;
import com.github.javaparser.symbolsolver.javaparsermodel.declarations.JavaParserClassDeclaration;


/*
use a sort of visitor pattern here
    - visitor interface is VoidVisitor
    - concrete visitor is ClassCollector
    - element interface is Visitable
    - concrete elements are cu, cid, md, etc. (i.e. nodes inside AST)

    - ClassCollector overrides these 4 nodes (since we care about these) and everything else remains the same.
    - each node's accept(visitor) method is different.
*/
public class FileParser implements Parser {

    private static class ParsedFile {
        final CompilationUnit compilationUnit;
        final String filename;

        ParsedFile(CompilationUnit compilationUnit, String filename) {

            this.compilationUnit = compilationUnit;
            this.filename = filename;
        }

    }

    private static class ClassCollector extends VoidVisitorAdapter<Void> {

        private final GraphBuilder graphBuilder;
        private final String filename;

        ClassCollector(GraphBuilder graphBuilder, String filename) {
            this.graphBuilder = graphBuilder;
            this.filename = filename;
        }

        // we get list of everything a class extends so we can get all the inheritance edges
        @Override
        public void visit(ClassOrInterfaceDeclaration cid, Void arg) {
            graphBuilder.addClass(cid.getNameAsString(), filename, cid.toString());

            for (ClassOrInterfaceType parent : cid.getExtendedTypes()) {
                graphBuilder.addInheritance(cid.getNameAsString(), parent.getNameAsString());
            }

            super.visit(cid, arg);
        }

        // register method as a node under its parent class in graph
        // method cant tell parent class name from ast, so need to fetch it 
        @Override
        public void visit(MethodDeclaration md, Void arg) {
            super.visit(md, arg);

            Optional<ClassOrInterfaceDeclaration> parentClass = md.findAncestor(ClassOrInterfaceDeclaration.class);

            if (parentClass.isPresent()) {
                String className = parentClass.get().getNameAsString();
                graphBuilder.addMethod(className, md.getNameAsString(), filename, md.toString());
            }

        }

        // we record calls as a edge (edge = caller -> callee)    
        @Override
        public void visit(MethodCallExpr call, Void arg) {
            // in case of nested calls
            super.visit(call, arg);

            Optional<ClassOrInterfaceDeclaration> callerClass = call.findAncestor(ClassOrInterfaceDeclaration.class);
            Optional<MethodDeclaration> callerMethod = call.findAncestor(MethodDeclaration.class);
            Optional<ConstructorDeclaration> callerConstructor = call.findAncestor(ConstructorDeclaration.class);

            // get name of the call to build node ID
            String callerName = null;
            if (callerMethod.isPresent()) {
                callerName = callerMethod.get().getNameAsString();
            }
            else if (callerConstructor.isPresent()) {
                callerName = callerConstructor.get().getNameAsString();
            }
            
            if (!callerClass.isPresent() || callerName == null) {
                return;
            }
            //  record as edge, if cant not resolve than skip edge
            try {
                ResolvedMethodDeclaration resolvedMethodDeclaration = call.resolve();
                String calleeClass = resolvedMethodDeclaration.declaringType().getClassName();

                graphBuilder.addCall(callerClass.get().getNameAsString(), calleeClass, callerName, call.getNameAsString());
            } 
            catch (Exception exception) {}
        }

        // need register constructor as node in its parent class. used to be invis as its not exactly a method call 
        @Override
        public void visit(ConstructorDeclaration cd, Void arg) {

            super.visit(cd, arg);
            Optional<ClassOrInterfaceDeclaration> parentClass = cd.findAncestor(ClassOrInterfaceDeclaration.class);

            if (parentClass.isPresent()) {
                String className = parentClass.get().getNameAsString();
                graphBuilder.addMethod(className, cd.getNameAsString(), filename, cd.toString());
            }
        }

    }


    @Override
    public Graph parse(List<JavaFile> files) {

        // new clean GraphBuilder that will accumulate everything
        GraphBuilder builder = new GraphBuilder();

        // create resolvers
        ReflectionTypeSolver reflectionTypeSolver = new ReflectionTypeSolver();
        MemoryTypeSolver memoryTypeSolver = new MemoryTypeSolver();
        CombinedTypeSolver combinedTypeSolver = new CombinedTypeSolver();
        combinedTypeSolver.add(reflectionTypeSolver);
        combinedTypeSolver.add(memoryTypeSolver);

        JavaSymbolSolver symbolSolver = new JavaSymbolSolver(combinedTypeSolver);
        StaticJavaParser.getParserConfiguration().setSymbolResolver(symbolSolver);

        StaticJavaParser.getParserConfiguration().setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_21);

        List<ParsedFile> parsedFiles = new ArrayList<>();


        for (JavaFile file : files) {
            CompilationUnit compilationUnit = StaticJavaParser.parse(file.getContent());
            parsedFiles.add(new ParsedFile(compilationUnit, file.getFilename()));

            List<ClassOrInterfaceDeclaration> cids = compilationUnit.findAll(ClassOrInterfaceDeclaration.class);

            for (ClassOrInterfaceDeclaration cid : cids) {
                Optional<String> fullyQualifiedName = cid.getFullyQualifiedName();

                String qualifiedName;
                if (fullyQualifiedName.isPresent()) {
                    qualifiedName = fullyQualifiedName.get();
                } 
                else {
                    qualifiedName = cid.getNameAsString();
                }

                memoryTypeSolver.addDeclaration(qualifiedName, new JavaParserClassDeclaration(cid, combinedTypeSolver));
            }
        }

        for (ParsedFile parsedFile : parsedFiles) {
            new ClassCollector(builder, parsedFile.filename).visit(parsedFile.compilationUnit, null);
        }

        return builder.build();

    }
}