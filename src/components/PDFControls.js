import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PDFControls({
  currentPage,
  numPages,
  goToPreviousPage,
  goToNextPage,
  handleChangePdf,
  pdfFile,
  fileInputRef,
  handleFileUpload,
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row justify-between items-center mb-4">
      <p className="text-green-600">File uploaded: {pdfFile.name}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-1 disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className="p-1 disabled:opacity-50"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleChangePdf}
        >
          Change PDF
        </button>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
