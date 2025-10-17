import React, { useMemo } from 'react';
import { useAppStore } from '../../store';
import { PlayIcon, StopIcon } from '../../components/ui/Icons';

export const AnimationControls: React.FC = () => {
  const { 
    images, 
    sliderValue, 
    setSliderValue, 
    isAnimating, 
    toggleAnimation,
    config
  } = useAppStore(state => ({
    images: state.images,
    sliderValue: state.sliderValue,
    setSliderValue: state.setSliderValue,
    isAnimating: state.isAnimating,
    toggleAnimation: state.toggleAnimation,
    config: state.config,
  }));

  const sliderLabel = useMemo(() => {
    const numImages = images.length;
    if (numImages < 2) return "Image 1";

    const numSegments = config.isCycling ? numImages : numImages - 1;
    const position = (sliderValue / 100) * numSegments;
    const lower = Math.floor(position);

    const lowerImageIndex = lower % numImages;
    const upperImageIndex = (lower + 1) % numImages;

    if (!config.isCycling && sliderValue >= 100) {
      return `Showing Image ${numImages}`;
    }

    if (lowerImageIndex === upperImageIndex || Math.abs(position - lower) < 1e-9) {
      return `Showing Image ${lowerImageIndex + 1}`;
    }

    const percentage = Math.round((position - lower) * 100);
    return `Merging Image ${lowerImageIndex + 1} and Image ${upperImageIndex + 1} (${percentage}%)`;
  }, [sliderValue, images.length, config.isCycling]);

  return (
    <div className="mt-8 flex items-center gap-4">
      <button
        onClick={toggleAnimation}
        className={`p-2 rounded-full transition-colors duration-200 ${isAnimating ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
        aria-label={isAnimating ? 'Stop animation' : 'Run animation'}
      >
        {isAnimating ? <StopIcon /> : <PlayIcon />}
      </button>
      <div className="flex-grow">
        <div className="text-center mb-2 text-gray-400 font-mono text-sm">{sliderLabel}</div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Image merge slider"
          disabled={isAnimating}
        />
      </div>
    </div>
  );
};
