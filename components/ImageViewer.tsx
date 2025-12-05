import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in backdrop-blur-md">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white/80 text-sm font-medium flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            Vista de Galería
        </span>
        <button 
          onClick={onClose}
          className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-all backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
        <img 
          src={imageUrl} 
          alt="Vista completa" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-sm cursor-default"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
        />
      </div>
    </div>
  );
};