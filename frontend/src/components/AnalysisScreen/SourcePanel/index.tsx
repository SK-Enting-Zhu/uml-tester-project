import { useStore } from '../../../store/useStore';
import Editor from '@monaco-editor/react';

// show source code for selected node

export default function SourcePanel() {

  const analysisResult = useStore((s) => s.analysisResult);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  // searches and finds the selected node, if not found, then null.
  const node = selectedNodeId
    ? analysisResult?.graph.nodes.find((n) => n.id === selectedNodeId)
    : null;

  /**
   * no node -> nothing
   * node is class -> show file name
   * node is method -> show method
   */
  const title = node
    ? node.type === 'class'
      ? (node.sourceLocation?.file ?? node.name)
      : `${node.name}`
    : 'Source';

  return (
    <div className="panel w-full h-full">
      <div className="panel-header flex items-center justify-between">
        <span className="truncate">{title}</span>
      </div>

      {/* state where no node is selected */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {!node ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-sm" style={{ color: 'rgba(238,238,238,0.4)' }}>
              Click any node in the graph to view its source code
            </p>
          </div>
          ) : (
          // code viewer
          <div className="h-full">
            <Editor
              height="100%"
              defaultLanguage="java"
              value={node.sourceCode}
              theme="vs-dark"
              options={{
                readOnly: true,
                lineNumbers: 'on',
                wordWrap: 'on',
                folding: true,
                glyphMargin: false,
                lineDecorationsWidth: 4,
                lineNumbersMinChars: 3,
                padding: { top: 8, bottom: 8 },
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                minimap: { enabled: false }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
