import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';


interface Props {
  files: File[]; 
  onFilesAdded: (newFiles: File[]) => void; 
  onFileRemoved: (index: number) => void; 
}

/**
 * filters out the non .java files
 * calls callback to update the parent and displays it.
 */
export default function DropZone({ files, onFilesAdded, onFileRemoved }: Props) {
  // Filters out all non .java files
  const onDrop = useCallback(
    (accepted: File[]) => {
      const javaFiles = accepted.filter(function(f) {
        return f.name.endsWith('.java');
      });
      // if there exists at least 1 java file, call onFilesAdded
      if (javaFiles.length > 0) onFilesAdded(javaFiles);
    }, [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/x-java': ['.java'], 'text/x-java-source': ['.java'], 'application/java': ['.java'] },
    noClick: files.length > 0,
  });

  return (
    <div
      {...getRootProps()}
      className="relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer"
      style={isDragActive
        ? { borderColor: '#EEEEEE', background: 'rgba(238,238,238,0.08)' }
        : { borderColor: '#2e2e2e', background: '#1c1c1c' }}
    >
      <input {...getInputProps()} />

      {files.length === 0 ? (
        <div className="text-center py-4">
          <p className="font-medium mb-1" style={{ color: '#EEEEEE' }}>
            Drop .java files here
          </p>
          <p className="text-sm" style={{ color: 'rgba(238,238,238,0.5)' }}>click to browse</p>
          <p className="text-xs mt-3" style={{ color: 'rgba(238,238,238,0.3)' }}>
            Include at least one source file and one JUnit test file
          </p>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
                style={{ background: '#2e2e2e', border: '1px solid #3d3d3d', color: '#EEEEEE' }}
              >
                {file.name}

                <button
                  type="button"
                  onClick={function(e) { e.stopPropagation(); onFileRemoved(i); }}
                  className="ml-1 text-xs leading-none transition-colors"
                  style={{ color: 'rgba(238,238,238,0.4)' }}
                >
                  ✕
                </button>
              </span>
            ))}
            
            {/* add more button. visible if already have files present */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget.parentElement?.parentElement?.parentElement?.querySelector('input') as HTMLInputElement)?.click();
              }}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors"
              style={{ background: '#242424', border: '1px dashed #3d3d3d', color: 'rgba(238,238,238,0.4)' }}
            >
              + Add more files
            </span>
          </div>
        </div>
      )}
    </div>
  );
}