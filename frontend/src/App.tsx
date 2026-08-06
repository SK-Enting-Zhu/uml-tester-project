import { useStore } from './store/useStore';
import UploadScreen from './components/UploadScreen';
import AnalysisScreen from './components/AnalysisScreen';

// which screen to show
export default function App() {
  const page = useStore((s) => s.screen);
  return page === 'upload' ? <UploadScreen /> : <AnalysisScreen />;
}