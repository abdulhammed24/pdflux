import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PDFControls({
  currentPage,
  numPages,
  goToPreviousPage,
  goToNextPage,
  handleChangePdf,
  handleRemovePdf,
  pdfFile,
  fileInputRef,
  handleFileUpload,
}) {
  return (
    <div className="flex flex-col w-full gap-5 md:flex-row justify-between items-center mb-6 bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-gray-200 shadow-lg">
      <div className="flex w-full flex-col gap-5">
        <p className="text-emerald-600 truncate font-medium">
          File uploaded: <span className="font-semibold">{pdfFile.name}</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {numPages === 1 ? (
            <span className="text-gray-700 font-medium">Page 1</span>
          ) : (
            <div className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-2 shadow-sm">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-full hover:bg-indigo-100 transition-all duration-300 ${
                  currentPage === 1
                    ? '!cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                }`}
              >
                <ChevronLeft size={24} className="text-indigo-600" />
              </button>
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === numPages}
                className="p-2 rounded-full hover:bg-indigo-100 transition-all duration-300 disabled:opacity-50"
              >
                <ChevronRight size={24} className="text-indigo-600" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md"
              onClick={handleChangePdf}
            >
              Change PDF
            </button>
            <button
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md"
              onClick={handleRemovePdf}
            >
              <X size={20} />
              Remove PDF
            </button>
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
