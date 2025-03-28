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
    <div className="flex flex-col gap-4 p-6 bg-white/30 backdrop-blur-lg rounded-xl h-fit border border-gray-200 shadow-lg">
      <button
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          localTool === 'highlight'
            ? 'bg-indigo-500 text-white shadow-md'
            : 'bg-white/80 text-gray-800 hover:bg-indigo-100'
        }`}
        onClick={() => handleToolChange('highlight')}
      >
        <Highlighter size={20} />
        <span className="font-medium">Highlight</span>
      </button>
      <button
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          localTool === 'underline'
            ? 'bg-indigo-500 text-white shadow-md'
            : 'bg-white/80 text-gray-800 hover:bg-indigo-100'
        }`}
        onClick={() => handleToolChange('underline')}
      >
        <Underline size={20} />
        <span className="font-medium">Underline</span>
      </button>
      <button
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          localTool === 'comment'
            ? 'bg-indigo-500 text-white shadow-md'
            : 'bg-white/80 text-gray-800 hover:bg-indigo-100'
        }`}
        onClick={() => handleToolChange('comment')}
      >
        <MessageSquare size={20} />
        <span className="font-medium">Comment</span>
      </button>
      <button
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          localTool === 'signature'
            ? 'bg-indigo-500 text-white shadow-md'
            : 'bg-white/80 text-gray-800 hover:bg-indigo-100'
        }`}
        onClick={() => handleToolChange('signature')}
      >
        <PenSquare size={20} />
        <span className="font-medium">Signature</span>
      </button>
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/80 text-gray-800 hover:bg-indigo-100 transition-all duration-300"
        onClick={handleUndo}
      >
        <RotateCcw size={20} />
        <span className="font-medium">Undo</span>
      </button>
      <button
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/80 text-gray-800 hover:bg-red-100 transition-all duration-300"
        onClick={handleClear}
      >
        <Trash2 size={20} />
        <span className="font-medium">Clear All</span>
      </button>
      <div className="flex items-center gap-3 px-4 py-3 bg-white/80 rounded-lg">
        <label className="text-gray-700 font-medium">Select Color</label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="size-10  border-none cursor-pointer"
        />
      </div>
      <button
        className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg mt-auto shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
        onClick={exportPdf}
      >
        <Download size={20} />
        <span className="font-medium">Export</span>
      </button>
    </div>
  );
}
