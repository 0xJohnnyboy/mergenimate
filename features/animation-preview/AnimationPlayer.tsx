import React, { useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../../store';
import { parseDuration } from '../../lib/time';

export const AnimationPlayer: React.FC = () => {
  const { images, sliderValue, isAnimating, setSliderValue, stopAnimation, config } = useAppStore(state => ({
    images: state.images,
    sliderValue: state.sliderValue,
    isAnimating: state.isAnimating,
    setSliderValue: state.setSliderValue,
    stopAnimation: state.stopAnimation,
    config: state.config,
  }));
  
  const animationFrameId = useRef<number | null>(null);
  const animationStartTime = useRef<number | null>(null);

  const { lowerIndex, upperIndex, fade } = useMemo(() => {
    const numImages = images.length;
    if (numImages < 2) return { lowerIndex: 0, upperIndex: 0, fade: 0 };

    const numSegments = config.isCycling ? numImages : numImages - 1;
    const position = (sliderValue / 100) * numSegments;
    const lower = Math.floor(position);
    const fadeAmount = position - lower;

    const lowerImageIndex = lower % numImages;
    const upperImageIndex = (lower + 1) % numImages;

    if (!config.isCycling && sliderValue >= 100) {
      return { lowerIndex: numImages - 1, upperIndex: numImages - 1, fade: 0 };
    }

    return { lowerIndex: lowerImageIndex, upperIndex: upperImageIndex, fade: fadeAmount };
  }, [sliderValue, images, config.isCycling]);

  useEffect(() => {
    if (!isAnimating) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      animationStartTime.current = null;
      return;
    }

    const totalDuration = parseDuration(config.duration);
    const parsedMilestones = config.milestones.map(Number);
    if (!totalDuration || parsedMilestones.some(isNaN)) {
      stopAnimation();
      return;
    }

    const keyframes = [
      [0, 0],
      ...parsedMilestones.map((timePercent, index) => {
        const sliderValue = ((index + 1) / (images.length - 1)) * 100;
        return [timePercent, sliderValue];
      }),
    ];
    if (keyframes.length === 1 || keyframes[keyframes.length - 1][0] < 100) {
      keyframes.push([100, 100]);
    }

    // Calculate initial offset based on startAt config
    let initialOffsetMs = 0;
    if (config.startAt) {
      const percentMatch = config.startAt.match(/^(\d+(\.\d+)?)%?$/);
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        initialOffsetMs = (percent / 100) * totalDuration;
      } else {
        const timeMs = parseDuration(config.startAt);
        if (timeMs !== null) {
          initialOffsetMs = timeMs;
        }
      }
    }

    const animate = (timestamp: number) => {
      if (!animationStartTime.current) {
        animationStartTime.current = timestamp - initialOffsetMs;
      }
      const elapsed = timestamp - animationStartTime.current;
      const timePercent = ((elapsed % totalDuration) / totalDuration) * 100;

      let startKf = keyframes[0], endKf = keyframes[1];
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (timePercent >= keyframes[i][0] && timePercent < keyframes[i + 1][0]) {
          startKf = keyframes[i];
          endKf = keyframes[i + 1];
          break;
        }
      }
       if (timePercent >= keyframes[keyframes.length - 1][0]) {
          startKf = endKf = keyframes[keyframes.length - 1];
      }

      const segmentDuration = endKf[0] - startKf[0];
      const timeIntoSegment = timePercent - startKf[0];
      const progressInSegment = segmentDuration > 0 ? timeIntoSegment / segmentDuration : 0;
      const newSliderValue = startKf[1] + (endKf[1] - startKf[1]) * progressInSegment;

      setSliderValue(newSliderValue);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isAnimating, config.duration, config.milestones, config.startAt, images.length, setSliderValue, stopAnimation]);

  const imageContainerStyle = useMemo(() => {
    if (images.length === 0) return {};
    const { width, height } = images[0];
    return {
      aspectRatio: `${width} / ${height}`,
      maxHeight: '60vh',
      width: '100%',
    };
  }, [images]);

  return (
    <div className="flex justify-center">
      <div style={imageContainerStyle} className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700">
        {images.length > 0 && (
          <>
            <img
              key={images[lowerIndex].src}
              src={images[lowerIndex].src}
              alt={`Uploaded image ${lowerIndex + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ opacity: 1, zIndex: 1, transition: 'opacity 0.1s ease-in-out' }}
            />
            {lowerIndex !== upperIndex && (
              <img
                key={images[upperIndex].src}
                src={images[upperIndex].src}
                alt={`Uploaded image ${upperIndex + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ opacity: fade, zIndex: 2, transition: 'opacity 0.1s ease-in-out' }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
