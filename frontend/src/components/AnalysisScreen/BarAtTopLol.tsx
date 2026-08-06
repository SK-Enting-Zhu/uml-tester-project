import { useStore } from '../../store/useStore';

export default function BarAtTopLol() {
  const resetSession = useStore((s) => s.resetSession);

  return (
    <header
      className="h-12 flex items-center px-4 flex-shrink-0"
      style={{ background: '#111111', borderBottom: '1px solid #1c1c1c' }}
    >
      <div className="flex items-center gap-2 w-48">
        <span className="font-semibold text-sm" style={{ color: '#EEEEEE' }}>
          UML Tester
        </span>
      </div>

      <div className="flex-1" />

      <div className="w-48 flex justify-end">
        <button
          onClick={resetSession}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(238,238,238,0.7)', border: '1px solid #3d3d3d' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c';
            (e.currentTarget as HTMLButtonElement).style.color = '#EEEEEE';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(238,238,238,0.7)';
          }}
        >
          + New Analysis
        </button>
      </div>
    </header>
  );
}