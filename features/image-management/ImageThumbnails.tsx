import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { CloseIcon } from '../../components/ui/Icons';
import { clsx } from 'clsx';

export const ImageThumbnails: React.FC = () => {
  const { images, removeImage, reorderImages, isAnimating } = useAppStore(state => ({
    images: state.images,
    removeImage: state.removeImage,
    reorderImages: state.reorderImages,
    isAnimating: state.isAnimating,
  }));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    reorderImages(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="flex justify-center flex-wrap gap-4" onDragOver={handleDragOver}>
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable={!isAnimating}
          onDragStart={(e) => handleDragStart(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={() => setDraggedIndex(null)}
          className={clsx(
            'group relative w-24 h-24 rounded-md overflow-hidden border-2 transition-all duration-200',
            isAnimating ? 'cursor-not-allowed' : 'cursor-move',
            draggedIndex === index ? 'opacity-30 border-dashed border-brand-light' : 'border-transparent hover:border-brand-primary'
          )}
        >
          <img src={image.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
            {index + 1}
          </div>
          <button
            onClick={() => removeImage(image.id)}
            className="absolute top-1 right-1 p-1 bg-black bg-opacity-60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:hidden"
            aria-label={`Remove image ${index + 1}`}
            disabled={isAnimating}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
