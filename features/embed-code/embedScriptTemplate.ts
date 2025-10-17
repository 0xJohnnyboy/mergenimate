export const generateEmbedContent = (): string => {
    return `
(function() {
  "use strict";
  const scriptTag = document.currentScript;
  if (!scriptTag) {
    console.error("Mergenimate: Could not find the script tag to initialize from.");
    return;
  }
  
  const durationStr = scriptTag.dataset.duration;
  const milestonesStr = scriptTag.dataset.milestones;
  const imageUrlsStr = scriptTag.dataset.images;
  const customClass = scriptTag.dataset.class;
  const isCycling = scriptTag.dataset.cycle === 'true';
  const startAtStr = scriptTag.dataset.startAt || '';

  if (!durationStr || !milestonesStr || !imageUrlsStr) {
    console.error("Mergenimate: Missing required data attributes (data-duration, data-milestones, data-images).");
    return;
  }

  let milestones, imageUrls;
  try {
    milestones = JSON.parse(milestonesStr);
    imageUrls = JSON.parse(imageUrlsStr);
  } catch (e) {
    console.error("Mergenimate: Failed to parse data-milestones or data-images attributes.", e);
    return;
  }

  if (!Array.isArray(imageUrls) || imageUrls.length < 2 || !durationStr || !Array.isArray(milestones)) {
      console.error("Mergenimate: Invalid configuration in data attributes.");
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
    console.error(\`Mergenimate: Invalid duration format "\${durationStr}". Use 's', 'm', 'h', or 'd'.\`);
    return;
  }
  
  const keyframes = [
    [0, 0],
    ...milestones.map((timePercent, index) => {
      const sliderValue = ((index + 1) / (imageUrls.length - 1)) * 100;
      return [timePercent, sliderValue];
    })
  ];
  if (keyframes[keyframes.length - 1][0] < 100) {
    keyframes.push([100, 100]);
  }

  const container = document.createElement('div');
  if (customClass) {
    container.className = customClass;
  }
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.lineHeight = '0';

  const imageElements = [];

  function setupAndStartAnimation() {
    if (imageUrls.length === 0) return;

    const firstImageLoader = new Image();
    firstImageLoader.onload = () => {
      container.style.aspectRatio = \`\${firstImageLoader.naturalWidth} / \${firstImageLoader.naturalHeight}\`;

      imageUrls.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = index === 0 ? '1' : '0';
        imageElements.push(img);
        container.appendChild(img);
      });

      // Calculate initial offset based on startAt parameter
      let initialOffsetMs = 0;
      if (startAtStr) {
        const percentMatch = startAtStr.match(/^(\\d+(\\.\\d+)?)%?$/);
        if (percentMatch) {
          const percent = parseFloat(percentMatch[1]);
          initialOffsetMs = (percent / 100) * totalDuration;
        } else {
          const timeMs = parseDuration(startAtStr);
          if (timeMs !== null) {
            initialOffsetMs = timeMs;
          }
        }
      }

      let startTime = null;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp - initialOffsetMs;
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
        const numSegments = isCycling ? numImages : numImages - 1;
        const position = (sliderValue / 100) * numSegments;
        const lowerIndex = Math.floor(position);
        const fade = position - lowerIndex;
        
        const lowerImageIndex = lowerIndex % numImages;
        const upperImageIndex = (lowerIndex + 1) % numImages;

        imageElements.forEach((img) => {
            img.style.opacity = '0';
            img.style.zIndex = '0';
        });
        
        const lowerImg = imageElements[lowerImageIndex];
        if (lowerImg) {
            lowerImg.style.opacity = '1';
            lowerImg.style.zIndex = '1';
        }
        
        const upperImg = imageElements[upperImageIndex];
        if (upperImg && (isCycling || position < numImages - 1)) {
            upperImg.style.opacity = String(fade);
            upperImg.style.zIndex = '2';
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
    };
    firstImageLoader.onerror = () => {
      console.error(\`Mergenimate: Failed to load first image to determine aspect ratio: \${imageUrls[0]}\`);
    };
    firstImageLoader.src = imageUrls[0];
  }
  
  scriptTag.parentNode.replaceChild(container, scriptTag);
  setupAndStartAnimation();
})();
`.trim();
};
