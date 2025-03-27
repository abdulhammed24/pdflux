// src/components/PDFViewer.js
import { useRef } from 'react';
import { Document, Page } from 'react-pdf';
import SignaturePad from 'signature_pad';

export default function PDFViewer({
  pdfFile,
  currentPage,
  annotations,
  tool,
  color,
  setTool,
  addAnnotation,
  onDocumentLoadSuccess,
  setError,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  pdfContainerRef,
  signingRef,
  drawingRef,
  startPosRef,
  previewRef,
  signaturePadRef,
  signatureContainerRef,
  cleanupSignaturePad,
}) {
  const handleLocalMouseDown = (e) => {
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

  const handleLocalMouseMove = (e) => {
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

  const handleLocalMouseUp = (e) => {
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

  return (
    <div
      ref={pdfContainerRef}
      className="relative overflow-auto max-h-[80vh]"
      style={{
        cursor: tool === 'signature' ? 'crosshair' : 'default',
      }}
      onMouseDown={handleLocalMouseDown}
      onMouseMove={handleLocalMouseMove}
      onMouseUp={handleLocalMouseUp}
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
                  ann.type === 'highlight' ? ann.color : 'transparent',
                borderBottom:
                  ann.type === 'underline' ? `2px solid ${ann.color}` : 'none',
                width:
                  ann.width ||
                  (ann.type === 'highlight' || ann.type === 'underline'
                    ? '100px'
                    : 'auto'),
                height: ann.type === 'highlight' ? '20px' : 'auto',
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
  );
}
