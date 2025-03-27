'use client';

import { useState } from 'react';
import {
  Highlighter,
  Underline,
  MessageSquare,
  PenSquare,
  Download,
  RotateCcw,
  Trash2,
} from 'lucide-react';

export default function Toolbar({
  setTool,
  setColor,
  exportPdf,
  undoAnnotation,
  clearAnnotations,
}) {
  const [localTool, setLocalTool] = useState(null);
  const [color, setLocalColor] = useState('#ffff00');

  const handleToolChange = (newTool) => {
    setLocalTool(newTool);
    setTool(newTool);
  };

  const handleUndo = () => {
    undoAnnotation();
    setLocalTool(null);
    setTool(null);
  };

  const handleClear = () => {
    clearAnnotations();
    setLocalTool(null);
    setTool(null);
  };

  const handleColorChange = (e) => {
    setLocalColor(e.target.value);
    setColor(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg h-fit">
      <button
        className={`flex items-center gap-2 p-2 rounded ${
          localTool === 'highlight'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-black'
        }`}
        onClick={() => handleToolChange('highlight')}
      >
        <Highlighter size={20} />
        <span>Highlight</span>
      </button>
      <button
        className={`flex items-center gap-2 p-2 rounded ${
          localTool === 'underline'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-black'
        }`}
        onClick={() => handleToolChange('underline')}
      >
        <Underline size={20} />
        <span>Underline</span>
      </button>
      <button
        className={`flex items-center gap-2 p-2 rounded ${
          localTool === 'comment'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-black'
        }`}
        onClick={() => handleToolChange('comment')}
      >
        <MessageSquare size={20} />
        <span>Comment</span>
      </button>
      <button
        className={`flex items-center gap-2 p-2 rounded ${
          localTool === 'signature'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-black'
        }`}
        onClick={() => handleToolChange('signature')}
      >
        <PenSquare size={20} />
        <span>Signature</span>
      </button>
      <button
        className="flex items-center gap-2 p-2 rounded bg-white hover:bg-gray-100"
        onClick={handleUndo}
      >
        <RotateCcw size={20} />
        <span>Undo</span>
      </button>
      <button
        className="flex items-center gap-2 p-2 rounded bg-white hover:bg-gray-100"
        onClick={handleClear}
      >
        <Trash2 size={20} />
        <span>Clear All</span>
      </button>
      <div className="flex flex-col items-center gap-2">
        <label className="text-gray-700">Select Customize Color</label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="w-10 h-10"
        />
      </div>
      <button
        className="flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded mt-auto"
        onClick={exportPdf}
      >
        <Download size={20} />
        <span>Export</span>
      </button>
    </div>
  );
}
