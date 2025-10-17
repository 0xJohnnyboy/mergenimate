import React, { useState } from 'react';
import { useAppStore } from './store';
import { ImageUploader } from './features/image-management/ImageUploader';
import { ImageThumbnails } from './features/image-management/ImageThumbnails';
import { AnimationPlayer } from './features/animation-preview/AnimationPlayer';
import { AnimationControls } from './features/animation-preview/AnimationControls';
import { ConfigDrawer } from './features/config-panel/ConfigDrawer';
import { Header } from './components/Header';
import { CodeIcon, TrashIcon } from './components/ui/Icons';
import { Button } from './components/ui/Button';

const App: React.FC = () => {
  const { images, error, isAnimating, reset, addImages } = useAppStore((state) => ({
    images: state.images,
    error: state.error,
    isAnimating: state.isAnimating,
    reset: state.reset,
    addImages: state.addImages,
  }));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <Header />

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 relative">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!hasImages ? (
            <ImageUploader onUpload={addImages} />
          ) : (
            <>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <Button 
                  onClick={() => setIsDrawerOpen(true)}
                  disabled={isAnimating}
                  variant="secondary"
                >
                  <CodeIcon className="h-5 w-5" />
                  Generate Code
                </Button>
                <Button
                  onClick={reset}
                  variant="danger"
                  className="p-2"
                  disabled={isAnimating}
                  aria-label="Reset application"
                >
                  <TrashIcon />
                </Button>
              </div>

              <div className="mb-8 border-b border-gray-700 pb-6">
                <h3 className="text-center text-lg font-semibold text-gray-300 mb-4">Image Order</h3>
                <ImageThumbnails />
                <div className="text-center mt-3 flex flex-col items-center">
                    <label htmlFor="file-upload" className={`text-sm font-medium transition-colors ${isAnimating ? 'text-gray-600 cursor-not-allowed' : 'text-brand-light hover:text-white cursor-pointer hover:underline'}`}>
                       + Add More Images
                    </label>
                    <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} disabled={isAnimating} />
                    <p className="text-center text-xs text-gray-500 mt-1">Drag and drop to reorder images.</p>
                </div>
              </div>

              <AnimationPlayer />
              <AnimationControls />
            </>
          )}
        </main>
      </div>

      <ConfigDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default App;
