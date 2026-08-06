import { useStore } from '../../../store/useStore';
import TestItem from './TestItem';

export default function TestResultsPanel() {

  const analysisResult = useStore((s) => s.analysisResult);

  if (!analysisResult) return null;

  const { testRuns, graph } = analysisResult;
  
  const passed = testRuns.filter((t) => t.status === 'passed').length;
  const failed = testRuns.filter((t) => t.status !== 'passed').length;

  return (
    <div className="panel w-full h-full">
      <div className="panel-header flex items-center justify-between">
        <span>Tests</span>
        <div className="flex items-center gap-2">

          <span className="text-green-400 text-xs font-medium">{passed} passed</span>
          <span className="text-red-400 text-xs font-medium">{failed} failed</span>

        </div>
      </div>

      {/* scrollable test list if there are that many */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {testRuns.map((test) => (
          <TestItem
            key={test.id}
            test={test}
            graph={graph}
          />
        ))}
      </div>
    </div>
  );
}