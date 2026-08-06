import { AnalysisResult, AnalysisStage } from '../types';

type ProgressCallback = (stage: AnalysisStage) => void;

export async function analyzeFiles(
  files: File[],
  onProgress: ProgressCallback,
): Promise<AnalysisResult> {
  onProgress('parsing');

  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json() as AnalysisResult;

  onProgress('complete');
  return result;
}
