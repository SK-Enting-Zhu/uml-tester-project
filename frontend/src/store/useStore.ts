// import what we need
import { create } from 'zustand';
import { AnalysisResult, AnalysisStage } from '../types';
import { analyzeFiles } from '../api/analyze';     

interface CurrentState {
  screen: 'upload' | 'analysis';
  analysisStage: AnalysisStage;
  analysisError: string | null;
  analysisResult: AnalysisResult | null;
  selectedNodeId: string | null;
  collapsedClasses: Set<string>; 
  isolatedTestId: string | null;            

  // state change functions
  startAnalysis: (files: File[]) => Promise<void>;
  setSelectedNodeId: (id: string | null) => void;
  toggleClassCollapse: (classId: string) => void;
  toggleIsolatedTest: (testId: string) => void;
  resetSession: () => void;
}

// can only update and read data via set and get.
export const useStore = create<CurrentState>((set, get) => ({
  screen: 'upload',
  analysisStage: 'idle',
  analysisError: null,
  analysisResult: null,
  selectedNodeId: null,
  collapsedClasses: new Set<string>(),
  isolatedTestId: null,

  startAnalysis: async (files) => {
    set({ analysisStage: 'parsing', analysisError: null });
    try {
      const result = await analyzeFiles(files, (stage) => {
        set({ analysisStage: stage });
      });
      set({
        analysisResult: result,
        screen: 'analysis',
        analysisStage: 'complete',
        collapsedClasses: new Set<string>(),
        selectedNodeId: null,
        isolatedTestId: null,
      });
    } catch (err) {
      set({
        analysisStage: 'error',
        analysisError: err instanceof Error ? err.message : 'Analysis failed',
      });
    }
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  toggleClassCollapse: (classId) => {
    const next = new Set(get().collapsedClasses);
    if (next.has(classId)) {
      next.delete(classId);
    } else {
      next.add(classId);
    }
    set({ collapsedClasses: next });
  },

  toggleIsolatedTest: (testId) => {
    set({ isolatedTestId: get().isolatedTestId === testId ? null : testId });
  },


  // reset everything back to initial state.
  resetSession: () =>
    set({
      screen: 'upload',
      analysisStage: 'idle',
      analysisError: null,
      analysisResult: null,
      selectedNodeId: null,
      collapsedClasses: new Set<string>(),
      isolatedTestId: null,
    }),
}));
