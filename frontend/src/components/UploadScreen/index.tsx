import { useState } from 'react';
import { useStore } from '../../store/useStore';
import DropZone from './DropZone';
import ProgressIndicator from './ProgressIndicator';


export default function UploadScreen() {
  const [files, setFiles] = useState<File[]>([]); 
  const { analysisStage, analysisError, startAnalysis } = useStore(); 

  // true if analyzing. else false.
  const isAnalyzing =
    analysisStage !== 'idle' &&
    analysisStage !== 'complete' &&
    analysisStage !== 'error';

  const hasInput = files.length > 0;


  /**
   * Removes all duplicate files if any in the new ones and merges the remaining.
   *
   * @param newFiles array of type File.
   */
  const handleAddFiles = (newFiles: File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
    });
  };

  /**
  * Remove file from the upload list based on the position.
  * onFileRemoved(i) from DropZone.tsx calls this with i.
  *
  * @param index - Position of file to remove in array.
  */
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  
  const handleAnalyze = () => {
    if (!hasInput || isAnalyzing) return;
    startAnalysis(files);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#3d3d3d' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#EEEEEE' }}>
              UML Tester
            </h1>
          </div>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(238,238,238,0.6)' }}>
            Upload Java files and at least one JUnit test file to begin analysis.
          </p>
        </div>

        {/* dropzone. not analyzing -> show upload screen, else show progress screen */}
        <div className="rounded-2xl p-6 shadow-lg" style={{ background: '#242424', border: '1px solid #1c1c1c' }}>
          {isAnalyzing ? (
            <ProgressIndicator stage={analysisStage} />
          ) : (
            <>
              <DropZone
                files={files}
                onFilesAdded={handleAddFiles}
                onFileRemoved={handleRemoveFile}
              />
              {/* show error if there is error*/}
              {analysisError && (
                <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                  {analysisError}
                </div>
              )}
              {/* analyze button */}
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!hasInput}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={hasInput
                    ? { background: '#111111', color: '#EEEEEE', cursor: 'pointer' }
                    : { background: '#1c1c1c', color: 'rgba(238,238,238,0.3)', cursor: 'not-allowed' }
                  }
                >
                  Analyze
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}