'use client';

import { useState, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { useStore } from '../lib/store';
import Toolbar from '../components/Toolbar';
import PDFUploader from '../components/PDFUploader';
import PDFViewer from '../components/PDFViewer';
import PDFControls from '../components/PDFControls';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Home() {
  const {
    pdfFile,
    setPdfFile,
    annotations,
    addAnnotation,
    undoAnnotation,
    clearAnnotations,
  } = useStore();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tool, setTool] = useState(null);
  const [color, setColor] = useState('#ffff00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const signingRef = useRef(false);
  const drawingRef = useRef(false);
  const startPosRef = useRef(null);
  const previewRef = useRef(null);
  const signaturePadRef = useRef(null);
  const signatureContainerRef = useRef(null);

  useEffect(() => {
    const savedPdf = localStorage.getItem('uploadedPdf');
    if (savedPdf) {
      const byteString = atob(savedPdf.split(',')[1]);
      const mimeString = savedPdf.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], 'uploaded.pdf', { type: mimeString });
      setPdfFile(file);
    }
  }, [setPdfFile]);

  useEffect(() => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('uploadedPdf', reader.result);
      };
      reader.readAsDataURL(pdfFile);
    } else {
      localStorage.removeItem('uploadedPdf');
      clearAnnotations();
    }
  }, [pdfFile, clearAnnotations]);

  const handleFileUpload = (e) => {
    setLoading(true);
    setError(null);
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      clearAnnotations();
      setPdfFile(file);
      setCurrentPage(1);
      setLoading(false);
    } else {
      setError('Please upload a valid PDF file');
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      clearAnnotations();
      setPdfFile(file);
      setCurrentPage(1);
      setLoading(false);
    } else {
      setError('Please upload a valid PDF file');
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const cleanupSignaturePad = () => {
    if (signatureContainerRef.current) {
      signatureContainerRef.current.remove();
      signatureContainerRef.current = null;
      signaturePadRef.current = null;
      signingRef.current = false;
    }
  };

  const handleSetTool = (newTool) => {
    if (tool === 'signature' && signingRef.current) {
      cleanupSignaturePad();
    }
    setTool(newTool);
  };

  const exportPdf = async () => {
    if (!pdfFile) {
      setError('No PDF file loaded');
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const renderedWidth = Math.min(800, window.innerWidth * 0.6);

      for (const ann of annotations) {
        const pageIndex = ann.page - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          const { width: pdfWidth, height: pdfHeight } = page.getSize();

          const scale = pdfWidth / renderedWidth;
          const pdfX = ann.x * scale;
          const pdfY = pdfHeight - ann.y * scale;

          if (ann.type === 'signature') {
            const pngImage = await pdfDoc.embedPng(ann.dataURL);
            page.drawImage(pngImage, {
              x: pdfX,
              y: pdfY - 100 * scale,
              width: 200 * scale,
              height: 100 * scale,
            });
          } else if (ann.type === 'highlight') {
            page.drawRectangle({
              x: pdfX,
              y: pdfY - 20 * scale,
              width: (ann.width || 100) * scale,
              height: 20 * scale,
              color: rgbFromHex(ann.color || '#ffff00'),
              opacity: 0.5,
            });
          } else if (ann.type === 'underline') {
            page.drawLine({
              start: { x: pdfX, y: pdfY },
              end: { x: pdfX + (ann.width || 100) * scale, y: pdfY },
              thickness: 2 * scale,
              color: rgbFromHex(ann.color || '#000000'),
            });
          } else if (ann.type === 'comment') {
            const text = ann.text || '';
            const fontSize = 12 * scale;
            const textWidth = text.length * (fontSize * 0.6);
            const textHeight = fontSize * 1.2;

            // Draw yellow background
            page.drawRectangle({
              x: pdfX,
              y: pdfY - textHeight + fontSize * 0.2,
              width: textWidth,
              height: textHeight,
              color: rgbFromHex('#fefcbf'), // Match bg-yellow-200
              opacity: 0.5,
            });

            // Draw comment text
            page.drawText(text, {
              x: pdfX,
              y: pdfY,
              size: fontSize,
              color: rgbFromHex('#000000'),
            });

            // Draw red pointer circle
            page.drawCircle({
              x: pdfX,
              y: pdfY + 5 * scale,
              size: 3 * scale,
              color: rgbFromHex('#ff0000'),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'annotated_document.pdf';
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const rgbFromHex = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  const handleChangePdf = () => {
    fileInputRef.current?.click();
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Document Signer & Annotation Tool
        </h1>
        <div className="w-full md:max-w-6xl flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4 bg-white rounded-lg shadow-lg p-4 flex-shrink-0">
            <Toolbar
              setTool={handleSetTool}
              setColor={setColor}
              exportPdf={exportPdf}
              undoAnnotation={undoAnnotation}
              clearAnnotations={clearAnnotations}
            />
          </div>

          <div className="md:w-3/4 bg-white rounded-lg shadow-lg p-4 flex-grow">
            {!pdfFile ? (
              <PDFUploader
                loading={loading}
                error={error}
                handleFileUpload={handleFileUpload}
                handleDrop={handleDrop}
              />
            ) : (
              <div className="flex flex-col h-full">
                <PDFControls
                  currentPage={currentPage}
                  numPages={numPages}
                  goToPreviousPage={goToPreviousPage}
                  goToNextPage={goToNextPage}
                  handleChangePdf={handleChangePdf}
                  pdfFile={pdfFile}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                />
                {loading ? (
                  <p className="text-gray-600">Processing...</p>
                ) : (
                  <PDFViewer
                    pdfFile={pdfFile}
                    currentPage={currentPage}
                    annotations={annotations}
                    tool={tool}
                    color={color}
                    setTool={setTool}
                    addAnnotation={addAnnotation}
                    onDocumentLoadSuccess={onDocumentLoadSuccess}
                    setError={setError}
                    pdfContainerRef={pdfContainerRef}
                    signingRef={signingRef}
                    drawingRef={drawingRef}
                    startPosRef={startPosRef}
                    previewRef={previewRef}
                    signaturePadRef={signaturePadRef}
                    signatureContainerRef={signatureContainerRef}
                    cleanupSignaturePad={cleanupSignaturePad}
                  />
                )}
                {error && <p className="mt-4 text-red-600">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </main>
    </DndProvider>
  );
}
