import { Upload } from 'lucide-react';

export default function PDFUploader({
  loading,
  error,
  handleFileUpload,
  handleDrop,
}) {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-full flex flex-col justify-center"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">Drag and drop a PDF here or</p>
          <label className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
            Select File
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </>
      )}
    </div>
  );
}
