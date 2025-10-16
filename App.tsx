import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ImageInfo } from './types';

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CodeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const StopIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
);

const ClipboardIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CloseIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const App: React.FC = () => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // State for script generator
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [duration, setDuration] = useState('60s');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [generatedEmbedTag, setGeneratedEmbedTag] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [embedImages, setEmbedImages] = useState<boolean>(false);
  const [imagePrefix, setImagePrefix] = useState<string>('/images/slider-');

  // State for animation preview
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationFrameId = useRef<number | null>(null);
  const animationStartTime = useRef<number | null>(null);


  useEffect(() => {
    if (images.length > 1) {
      const defaultMilestones = Array.from({ length: images.length - 1 }, (_, i) => 
        Math.round(((i + 1) / (images.length - 1)) * 100).toString()
      );
      setMilestones(defaultMilestones);
    } else {
      setMilestones([]);
    }
    setGeneratedEmbedTag(null);
    setScriptError(null);
  }, [images]);


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (images.length === 0 && files.length < 2) {
      setError("Please upload at least two images to merge.");
      (event.target as HTMLInputElement).value = '';
      return;
    }

    setIsLoading(true);
    setError(null);

    const referenceDimensions = images.length > 0
      ? { width: images[0].width, height: images[0].height }
      : null;

    const imagePromises: Promise<ImageInfo>[] = Array.from(files).map(file => {
      return new Promise<ImageInfo>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => resolve({
            src: e.target?.result as string,
            width: img.width,
            height: img.height,
          });
          img.onerror = () => reject(new Error(`Could not load image: ${file.name}`));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const newLoadedImages = await Promise.all(imagePromises);

      let currentReference = referenceDimensions;
      for (const imgInfo of newLoadedImages) {
        if (!currentReference) {
          currentReference = { width: imgInfo.width, height: imgInfo.height };
        } else if (imgInfo.width !== currentReference.width || imgInfo.height !== currentReference.height) {
          throw new Error(`All images must have the same dimensions. Expected ${currentReference.width}x${currentReference.height}px, but found ${imgInfo.width}x${imgInfo.height}px.`);
        }
      }
      
      setImages(prevImages => [...prevImages, ...newLoadedImages]);
      if (images.length === 0) {
        setSliderValue(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during image processing.");
    } finally {
      setIsLoading(false);
      (event.target as HTMLInputElement).value = '';
    }
  };

  const handleReset = () => {
    setImages([]);
    setError(null);
    setSliderValue(0);
    setIsAnimating(false);
    setIsDrawerOpen(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    if (updatedImages.length < 2) {
      handleReset();
    } else {
      setImages(updatedImages);
    }
  };

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

    const reorderedImages = [...images];
    const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage);

    setImages(reorderedImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const { lowerIndex, upperIndex, fade } = useMemo(() => {
    if (images.length < 2) {
      return { lowerIndex: 0, upperIndex: 0, fade: 0 };
    }
    const position = (sliderValue / 100) * (images.length - 1);
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    const fadeAmount = position - lower;
    return { lowerIndex: lower, upperIndex: upper, fade: fadeAmount };
  }, [sliderValue, images.length]);

  const sliderLabel = useMemo(() => {
    if (images.length < 2) return "Image 1";

    if (lowerIndex === upperIndex) {
      return `Showing Image ${lowerIndex + 1}`;
    }

    const percentage = Math.round(fade * 100);
    return `Merging Image ${lowerIndex + 1} and Image ${upperIndex + 1} (${percentage}%)`;
  }, [fade, lowerIndex, upperIndex, images.length]);


  const imageContainerStyle = useMemo(() => {
    if (images.length === 0) return {};
    const { width, height } = images[0];
    return {
        aspectRatio: `${width} / ${height}`,
        maxHeight: '60vh', 
        width: '100%',
    };
  }, [images]);

  const generateEmbedContent = (config: { imageUrls: string[], durationStr: string, milestones: number[] }): string => {
    const configJson = JSON.stringify(config);
    return `
(function() {
  "use strict";
  const scriptTag = document.currentScript;
  if (!scriptTag) {
    console.error("ImageBlender: Could not find the script tag to initialize from.");
    return;
  }

  const config = ${configJson};
  const { imageUrls, durationStr, milestones } = config;

  if (!Array.isArray(imageUrls) || imageUrls.length < 2 || !durationStr || !Array.isArray(milestones)) {
      console.error("ImageBlender: Invalid configuration in embedded script.");
      return;
  }

  const parseDuration = (dStr) => {
    const match = dStr.trim().match(/^(\\d+(\\.\\d+)?)\\s*(s|m|h|d)$/i);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return null;
    }
  };

  const totalDuration = parseDuration(durationStr);
  if (totalDuration === null) {
    console.error(\`ImageBlender: Invalid duration format "\${durationStr}". Use 's', 'm', 'h', or 'd'.\`);
    return;
  }
  
  const keyframes = [
    [0, 0],
    ...milestones.map((timePercent, index) => {
      const sliderValue = ((index + 1) / (milestones.length)) * 100;
      return [timePercent, sliderValue];
    })
  ];
  if (keyframes[keyframes.length - 1][0] < 100) {
    keyframes.push([100, 100]);
  }

  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.lineHeight = '0';

  const imageElements = [];

  function startAnimation() {
    imageUrls.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.opacity = index === 0 ? '1' : '0';
      imageElements.push(img);
      container.appendChild(img);
    });

    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
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
      const sliderValue = startKf[1] + (endKf[1] - startKf[1]) * progressInSegment;

      const numImages = imageUrls.length;
      const position = (sliderValue / 100) * (numImages - 1);
      const lowerIndex = Math.floor(position);
      const upperIndex = Math.min(Math.ceil(position), numImages - 1);
      const fade = position - lowerIndex;

      imageElements.forEach((img, i) => { img.style.opacity = '0'; });
      if (imageElements[lowerIndex]) imageElements[lowerIndex].style.opacity = '1';
      if (lowerIndex !== upperIndex && imageElements[upperIndex]) {
        imageElements[upperIndex].style.opacity = String(fade);
      }

      requestAnimationFrame(animate);
    }
    
    Promise.all(imageUrls.map(src => new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
    }))).then(() => {
        requestAnimationFrame(animate);
    });
  }
  
  scriptTag.parentNode.replaceChild(container, scriptTag);
  startAnimation();
})();
`.trim();
  }

  const getExtensionFromDataUri = (dataUri: string): string => {
    const mimeMatch = dataUri.match(/^data:(image\/[a-z]+);base64,/);
    if (!mimeMatch || !mimeMatch[1]) return '.jpg'; // default
    const mimeType = mimeMatch[1];
    switch (mimeType) {
      case 'image/png': return '.png';
      case 'image/jpeg': return '.jpg';
      case 'image/gif': return '.gif';
      case 'image/webp': return '.webp';
      case 'image/svg+xml': return '.svg';
      default: return '.jpg';
    }
  };

  const validateMilestones = (): number[] | null => {
    const parsedMilestones: number[] = [];
    for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (m === '' || isNaN(Number(m))) {
            setScriptError(`Milestone for Image ${i + 2} must be a number.`);
            return null;
        }
        const num = Number(m);
        if (num <= 0 || num > 100) {
            setScriptError(`Milestone for Image ${i + 2} must be between 1 and 100.`);
            return null;
        }
        const prevMilestone = i > 0 ? parsedMilestones[i - 1] : 0;
        if (num <= prevMilestone) {
            setScriptError(`Milestones must be in increasing order. Milestone for Image ${i + 2} must be greater than the previous one.`);
            return null;
        }
        parsedMilestones.push(num);
    }
    return parsedMilestones;
  }


  const handleGenerateEmbedCode = (e: React.FormEvent) => {
    e.preventDefault();
    setScriptError(null);
    setGeneratedEmbedTag(null);

    if (parseDuration(duration) === null) {
      setScriptError("Invalid duration format. Use 's', 'm', 'h', or 'd' (e.g., '30s', '24h').");
      return;
    }
    const parsedMilestones = validateMilestones();
    if (!parsedMilestones) return;
    
    let imageUrls: string[];
    if (embedImages) {
        imageUrls = images.map(img => img.src);
    } else {
        const extension = getExtensionFromDataUri(images[0].src);
        imageUrls = Array.from({ length: images.length }, (_, i) => `${imagePrefix}${i + 1}${extension}`);
    }


    const config = {
      imageUrls,
      durationStr: duration,
      milestones: parsedMilestones,
    };

    const scriptContent = generateEmbedContent(config);
    const base64Script = btoa(unescape(encodeURIComponent(scriptContent)));
    const scriptSrc = `data:application/javascript;base64,${base64Script}`;
    
    const embedTag = `<script src="${scriptSrc}"></script>`;
    setGeneratedEmbedTag(embedTag);
  };

  const parseDuration = (durationStr: string): number | null => {
    const match = durationStr.trim().match(/^(\d+(\.\d+)?)\s*(s|m|h|d)$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
  };

  const handleToggleAnimation = () => {
    if (isAnimating) {
        setIsAnimating(false);
        return;
    }

    if (parseDuration(duration) === null) {
        setScriptError("Invalid duration format. Use 's', 'm', 'h', or 'd' to run animation.");
        setIsDrawerOpen(true);
        return;
    }
    const parsedMilestones = validateMilestones();
    if (!parsedMilestones) {
        setIsDrawerOpen(true);
        return;
    }
    
    setScriptError(null);
    setGeneratedEmbedTag(null);
    setIsAnimating(true);
  }

  useEffect(() => {
    if (!isAnimating) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        animationStartTime.current = null;
        return;
    }

    const totalDuration = parseDuration(duration);
    const parsedMilestones = validateMilestones();
    if (!totalDuration || !parsedMilestones) {
        setIsAnimating(false);
        return;
    }
    
    const keyframes = [
        [0, 0],
        ...parsedMilestones.map((timePercent, index) => [timePercent, ((index + 1) / parsedMilestones.length) * 100]),
    ];
    if (keyframes[keyframes.length - 1][0] < 100) {
        keyframes.push([100, 100]);
    }

    const animate = (timestamp: number) => {
        if (!animationStartTime.current) {
            animationStartTime.current = timestamp;
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
  }, [isAnimating, duration, milestones, images.length]);
    
  const handleCopy = (text: string | null) => {
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        });
    }
  };

  const generatedScriptHelpText = useMemo(() => {
    if (embedImages) {
        return "This self-contained tag is all you need. Place it where you want the animation to appear.";
    } else {
        const extension = images.length > 0 ? getExtensionFromDataUri(images[0].src) : '.jpg';
        const exampleUrl1 = `${imagePrefix}1${extension}`;
        const exampleUrl2 = `${imagePrefix}2${extension}`;
        return <>
            Paste this tag into your HTML. Make sure your images are available on your server at the specified paths (e.g., <code className="bg-gray-900 text-green-400 px-1.5 py-0.5 rounded text-xs">{exampleUrl1}</code>, <code className="bg-gray-900 text-green-400 px-1.5 py-0.5 rounded text-xs">{exampleUrl2}</code>, etc.).
        </>
    }
  }, [embedImages, imagePrefix, images]);

  const DrawerContent = () => (
    <div className="relative mt-6 flex-1 px-4 sm:px-0">
        <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-6">Configure the animation timing and generate a single, self-contained script tag to embed on any website. The animation starts with Image 1 at time 0%.</p>
         <form onSubmit={handleGenerateEmbedCode} className="max-w-2xl mx-auto grid grid-cols-1 gap-y-6">
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Total Duration</label>
                <input type="text" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50" placeholder="e.g., 30s, 10m, 24h"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {milestones.map((milestone, index) => (
                    <div key={index}>
                        <label htmlFor={`milestone-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Time for Image {index + 2} (%)</label>
                        <input type="number" id={`milestone-${index}`} value={milestone} onChange={e => {const newMilestones = [...milestones]; newMilestones[index] = e.target.value; setMilestones(newMilestones);}} min="1" max="100" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50" placeholder="e.g., 25" />
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input id="embed-images" aria-describedby="embed-images-description" name="embed-images" type="checkbox" checked={embedImages} onChange={(e) => setEmbedImages(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-secondary disabled:opacity-50" />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="embed-images" className="font-medium text-gray-300">Embed images directly in script</label>
                        <p id="embed-images-description" className="text-gray-500">Creates a single, self-contained file but increases script size.</p>
                    </div>
                </div>

                {!embedImages && (
                    <div>
                        <label htmlFor="image-prefix" className="block text-sm font-medium text-gray-300 mb-1">Image URL Prefix</label>
                        <input type="text" id="image-prefix" value={imagePrefix} onChange={e => setImagePrefix(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50" placeholder="e.g., /img/my-slider-" />
                        <p className="mt-1 text-xs text-gray-500">The script will append numbers (1, 2,...) and the file extension.</p>
                    </div>
                )}
            </div>
            <div className="text-center mt-4">
                <button type="submit" className="w-full px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Generate Embed Code
                </button>
            </div>
         </form>
         {scriptError && (
            <div className="mt-4 max-w-2xl mx-auto bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
                {scriptError}
            </div>
         )}
         {generatedEmbedTag && (
            <div className="mt-6 max-w-3xl mx-auto">
                <div>
                   <h4 className="font-semibold text-gray-300 mb-2">Paste this single tag into your HTML</h4>
                    <p className="text-xs text-gray-500 mb-2">{generatedScriptHelpText}</p>
                    <div className="relative">
                        <button onClick={() => handleCopy(generatedEmbedTag)} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors">
                        <ClipboardIcon /> {copyButtonText}
                        </button>
                        <textarea readOnly value={generatedEmbedTag} className="w-full h-32 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-green-300 focus:ring-brand-primary focus:border-brand-primary resize-y"></textarea>
                    </div>
                </div>
            </div>
         )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-light text-transparent bg-clip-text">
            Mergenimate
          </h1>
          <p className="mt-2 text-lg text-gray-400">Upload, reorder, and blend images to generate a self-contained animation script.</p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 relative">
           <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden"
              onChange={handleImageUpload} 
              disabled={isLoading || isAnimating}
            />
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-gray-600 rounded-lg text-center">
              <UploadIcon />
              <label htmlFor="file-upload" className="mt-6 cursor-pointer relative inline-flex items-center justify-center px-6 py-3 text-lg font-medium tracking-tighter text-white bg-gray-800 rounded-md group">
                  <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-brand-primary rounded-md group-hover:mt-0 group-hover:ml-0"></span>
                  <span className="absolute inset-0 w-full h-full bg-gray-900 rounded-md "></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-brand-primary rounded-md opacity-0 group-hover:opacity-100 "></span>
                  <span className="relative text-brand-light transition-colors duration-200 ease-in-out delay-100 group-hover:text-white">
                    {isLoading ? 'Processing...' : 'Upload Images'}
                  </span>
              </label>
              <p className="mt-4 text-sm text-gray-500">Upload 2 or more images with identical dimensions.</p>
            </div>
          ) : (
            <div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  disabled={isAnimating}
                  className="px-3 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary transition-colors duration-200 flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <CodeIcon className="h-5 w-5" />
                  Generate Code
                </button>
                 <button
                  onClick={handleReset}
                  className="p-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md disabled:bg-gray-600 disabled:opacity-50"
                  disabled={isAnimating}
                  aria-label="Reset application"
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="mb-8 border-b border-gray-700 pb-6">
                <h3 className="text-center text-lg font-semibold text-gray-300 mb-4">Image Order</h3>
                 <div className="flex justify-center flex-wrap gap-4" onDragOver={handleDragOver}>
                    {images.map((image, index) => (
                      <div
                        key={image.src}
                        draggable={!isAnimating}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`group relative w-24 h-24 rounded-md overflow-hidden border-2 transition-all duration-200 ${isAnimating ? 'cursor-not-allowed' : 'cursor-move'} ${draggedIndex === index ? 'opacity-30 border-dashed border-brand-light' : 'border-transparent hover:border-brand-primary'}`}
                      >
                        <img src={image.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                          {index + 1}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black bg-opacity-60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:hidden"
                          aria-label={`Remove image ${index + 1}`}
                          disabled={isAnimating}
                        >
                          <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3 flex flex-col items-center">
                    <label htmlFor="file-upload" className={`text-sm font-medium transition-colors ${isAnimating ? 'text-gray-600 cursor-not-allowed' : 'text-brand-light hover:text-white cursor-pointer hover:underline'}`}>
                       + Add More Images
                    </label>
                    <p className="text-center text-xs text-gray-500 mt-1">Drag and drop to reorder images.</p>
                  </div>
              </div>
              
              <div className="flex justify-center">
                 <div style={imageContainerStyle} className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-gray-700">
                  {images.length > 0 && (
                    <>
                      <img
                        key={images[lowerIndex].src}
                        src={images[lowerIndex].src}
                        alt={`Uploaded image ${lowerIndex + 1}`}
                        className="absolute top-0 left-0 w-full h-full object-contain"
                        style={{ opacity: 1, transition: 'opacity 0.1s ease-in-out' }}
                      />
                      {lowerIndex !== upperIndex && (
                        <img
                          key={images[upperIndex].src}
                          src={images[upperIndex].src}
                          alt={`Uploaded image ${upperIndex + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          style={{ opacity: fade, transition: 'opacity 0.1s ease-in-out' }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={handleToggleAnimation}
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
            </div>
          )}
        </main>
      </div>

       {isDrawerOpen && (
          <div className="fixed inset-0 z-40" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 z-50">
              <div className={`transform transition ease-in-out duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} w-screen max-w-md`}>
                <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 border-l border-gray-700 shadow-xl p-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2" id="slide-over-title">
                      <CodeIcon className="h-6 w-6"/>
                      Generate Embed Code
                    </h2>
                    <button
                        type="button"
                        className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <span className="sr-only">Close panel</span>
                        <CloseIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <DrawerContent />
                </div>
              </div>
            </div>
          </div>
       )}
    </div>
  );
};

export default App;
