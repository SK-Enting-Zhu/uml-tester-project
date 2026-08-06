import { AnalysisStage } from '../../types';

interface Props {
  stage: AnalysisStage;
}

// 2 stages to the loading screen
const STAGES: { key: AnalysisStage; label: string }[] = [
  { key: 'parsing', label: 'Parsing source files' },
  { key: 'running-tests', label: 'Running JUnit tests' },
];

const STAGE_ORDER: AnalysisStage[] = [
  'parsing', 'running-tests', 'complete',
];

function stageIndex(s: AnalysisStage) {
  return STAGE_ORDER.indexOf(s);
}


export default function ProgressIndicator({ stage }: Props) {
  // current stage number
  const currentIndex = stageIndex(stage);

  return (
    <div className="space-y-3">
      <p className="text-sm text-center mb-4" style={{ color: 'rgba(238, 238, 238, 0.6)' }}>Analyzing code...</p>

      {/* for each stage in stages, check if stage is  */}
      {STAGES.map((s, i) => {
        const done = currentIndex > i;
        const active = stageIndex(s.key) === currentIndex;
        const pending = currentIndex < i;

        
        let circleStyle;
        if (done) {
          circleStyle = { background: 'rgba(238,238,238,0.1)', border: '1px solid #4ade80' };
        } 
        else if (active) {
          circleStyle = { background: 'rgba(238,238,238,0.1)', border: '1px solid #EEEEEE' };
        } 
        else {
          circleStyle = { background: 'rgba(238,238,238,0.1)', border: '1px solid #2e2e2e' };
        }

        let labelStyle;
        if (active) {
          labelStyle = { color: '#EEEEEE' };
        } else if (pending) {
          labelStyle = { color: 'rgba(238,238,238,0.2)' };
        } else {
          labelStyle = { color: '#EEEEEE' };
        }

        {/*format:    [status circle]    [stage name] */}
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300"
              style={circleStyle}>
              {done && <span className="text-green-400 text-xs">✓</span>}
              {active && (
                <svg className="w-3 h-3 animate-spin" style={{ color: '#EEEEEE' }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {pending && <span className="text-xs" style={{ color: 'rgba(238,238,238,0.2)' }}>○</span>}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium transition-colors" style={labelStyle}>
                {s.label}
              </div>
            </div>
          </div>
        );

      })}
    </div>
  );
}
