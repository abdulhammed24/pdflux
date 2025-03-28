import { Upload } from 'lucide-react';

export default function PDFUploader({
  loading,
  error,
  handleFileUpload,
  handleDrop,
}) {
  return (
    <>
      <div
        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center h-full flex flex-col justify-center bg-white/50 backdrop-blur-lg shadow-lg transition-all duration-300 hover:shadow-xl"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-16 w-16 text-indigo-500 animate-bounce" />
            <p className="mt-4 text-gray-600 font-medium">
              Drag and drop a PDF here or
            </p>
            <label className="mt-4 inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md">
              Select File
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
          </>
        )}
      </div>
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left: 4px solid #6366f1;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
