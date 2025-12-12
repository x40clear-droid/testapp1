import React from 'react';
import { GeneratedImage } from '../types';
import { X, Download, RefreshCw } from 'lucide-react';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onDownload: (image: GeneratedImage) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  image, 
  onClose, 
  onDownload, 
  onRegenerate,
  isRegenerating 
}) => {
  if (!image) return null;

  const imgSrc = `data:image/jpeg;base64,${image.base64}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
        <span className="text-white/80 text-sm font-medium truncate max-w-[200px]">
          {image.prompt}
        </span>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        <img 
          src={imgSrc} 
          alt={image.prompt}
          className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 w-full p-6 pb-8 flex justify-center gap-6 bg-gradient-to-t from-black/90 to-transparent">
        <button 
          onClick={() => onDownload(image)}
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors active:scale-95"
        >
          <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <Download size={28} />
          </div>
          <span className="text-xs">저장</span>
        </button>

        <button 
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors active:scale-95 disabled:opacity-50"
        >
          <div className={`p-4 rounded-full bg-indigo-500/20 border border-indigo-500/50 backdrop-blur-md ${isRegenerating ? 'animate-spin' : ''}`}>
            <RefreshCw size={28} className="text-indigo-400" />
          </div>
          <span className="text-xs text-indigo-300">다시 생성</span>
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;