'use client';

import { useState, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import Toolbar from '../components/Toolbar';
import SignaturePad from 'signature_pad';

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

  const handleMouseDown = (e) => {
    if (!tool || !pdfContainerRef.current || signingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'signature') {
      signingRef.current = true;

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
      container.style.zIndex = '10';
      container.style.backgroundColor = 'white';
      container.style.border = '1px dashed black';
      container.style.padding = '5px';

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 100;
      container.appendChild(canvas);

      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.gap = '5px';
      controls.style.marginTop = '5px';

      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Clear';
      clearBtn.style.padding = '2px 5px';
      clearBtn.addEventListener('click', () =>
        signaturePadRef.current?.clear(),
      );

      const undoBtn = document.createElement('button');
      undoBtn.textContent = 'Undo';
      undoBtn.style.padding = '2px 5px';
      undoBtn.addEventListener('click', () => {
        const strokes = signaturePadRef.current.toData();
        if (strokes.length > 0) {
          strokes.pop();
          signaturePadRef.current.fromData(strokes);
        }
      });

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Confirm';
      confirmBtn.style.padding = '2px 5px';
      confirmBtn.addEventListener('click', () => {
        const dataURL = signaturePadRef.current.toDataURL('image/png');
        if (!signaturePadRef.current.isEmpty()) {
          addAnnotation({
            type: 'signature',
            page: currentPage,
            x,
            y,
            dataURL,
            id: Date.now(),
          });
        }
        cleanupSignaturePad();
        setTool(null);
      });

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.padding = '2px 5px';
      cancelBtn.addEventListener('click', () => {
        cleanupSignaturePad();
        setTool(null);
      });

      controls.appendChild(clearBtn);
      controls.appendChild(undoBtn);
      controls.appendChild(confirmBtn);
      controls.appendChild(cancelBtn);
      container.appendChild(controls);

      pdfContainerRef.current.appendChild(container);
      signatureContainerRef.current = container;

      const signaturePad = new SignaturePad(canvas, {
        penColor: 'black',
        backgroundColor: 'transparent',
      });
      signaturePadRef.current = signaturePad;
    } else if (tool === 'highlight' || tool === 'underline') {
      drawingRef.current = true;
      startPosRef.current = { x, y };

      const preview = document.createElement('div');
      preview.style.position = 'absolute';
      preview.style.left = `${x}px`;
      preview.style.top = `${y}px`;
      preview.style.zIndex = '5';
      if (tool === 'highlight') {
        preview.style.backgroundColor = color;
        preview.style.opacity = '0.5';
        preview.style.height = '20px';
      } else if (tool === 'underline') {
        preview.style.borderBottom = `2px solid ${color}`;
        preview.style.height = '2px';
      }
      pdfContainerRef.current.appendChild(preview);
      previewRef.current = preview;
    } else if (tool === 'comment') {
      const text = prompt('Enter comment:');
      if (text) {
        addAnnotation({
          type: 'comment',
          page: currentPage,
          x,
          y,
          text,
          id: Date.now(),
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current || !pdfContainerRef.current || !previewRef.current)
      return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const startX = startPosRef.current.x;

    const width = Math.abs(endX - startX);
    const x = Math.min(startX, endX);

    previewRef.current.style.left = `${x}px`;
    previewRef.current.style.width = `${width}px`;
  };

  const handleMouseUp = (e) => {
    if (!drawingRef.current || !pdfContainerRef.current || !previewRef.current)
      return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const startX = startPosRef.current.x;
    const y = startPosRef.current.y;

    const width = Math.abs(endX - startX);
    const x = Math.min(startX, endX);

    if (tool === 'highlight' || tool === 'underline') {
      addAnnotation({
        type: tool,
        page: currentPage,
        x,
        y,
        width: width > 0 ? width : 10,
        color,
        id: Date.now(),
      });
    }

    pdfContainerRef.current.removeChild(previewRef.current);
    previewRef.current = null;
    drawingRef.current = false;
    startPosRef.current = null;
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

      // Get the rendered width from the UI
      const renderedWidth = Math.min(800, window.innerWidth * 0.6);

      for (const ann of annotations) {
        const pageIndex = ann.page - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          const { width: pdfWidth, height: pdfHeight } = page.getSize();

          // Calculate scaling factor between rendered width and actual PDF width
          const scale = pdfWidth / renderedWidth;

          // Adjust coordinates
          const pdfX = ann.x * scale;
          const pdfY = pdfHeight - ann.y * scale; // Convert UI Y to PDF Y

          if (ann.type === 'signature') {
            const pngImage = await pdfDoc.embedPng(ann.dataURL);
            page.drawImage(pngImage, {
              x: pdfX,
              y: pdfY - 100 * scale, // Adjust height based on scale
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
            page.drawText(ann.text || '', {
              x: pdfX,
              y: pdfY,
              size: 12 * scale,
              color: rgbFromHex('#000000'),
            });
            page.drawCircle({
              x: pdfX,
              y: pdfY + 5 * scale,
              size: 3 * scale,
              color: rgbFromHex('#ff0000'),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save(); // Fixed the typo here
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
                    <p className="mt-2 text-gray-600">
                      Drag and drop a PDF here or
                    </p>
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
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-5 md:flex-row justify-between items-center mb-4">
                  <p className="text-green-600">
                    File uploaded: {pdfFile.name}
                  </p>
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
                {loading ? (
                  <p className="text-gray-600">Processing...</p>
                ) : (
                  <div
                    ref={pdfContainerRef}
                    className="relative overflow-auto max-h-[80vh]"
                    style={{
                      cursor: tool === 'signature' ? 'crosshair' : 'default',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={() => setError('Failed to load PDF')}
                    >
                      <Page
                        pageNumber={currentPage}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(800, window.innerWidth * 0.6)}
                      />
                      {annotations
                        .filter((ann) => ann.page === currentPage)
                        .map((ann) => (
                          <div
                            key={ann.id}
                            style={{
                              position: 'absolute',
                              left: ann.x,
                              top: ann.y,
                              backgroundColor:
                                ann.type === 'highlight'
                                  ? ann.color
                                  : 'transparent',
                              borderBottom:
                                ann.type === 'underline'
                                  ? `2px solid ${ann.color}`
                                  : 'none',
                              width:
                                ann.width ||
                                (ann.type === 'highlight' ||
                                ann.type === 'underline'
                                  ? '100px'
                                  : 'auto'),
                              height:
                                ann.type === 'highlight' ? '20px' : 'auto',
                            }}
                          >
                            {ann.type === 'signature' && (
                              <img
                                src={ann.dataURL}
                                alt="Signature"
                                style={{ width: '200px', height: '100px' }}
                              />
                            )}
                            {ann.type === 'comment' && (
                              <div style={{ position: 'relative' }}>
                                <span className="bg-yellow-200 p-1 rounded text-sm">
                                  {ann.text}
                                </span>
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '-5px',
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: 'red',
                                    borderRadius: '50%',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </Document>
                  </div>
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
