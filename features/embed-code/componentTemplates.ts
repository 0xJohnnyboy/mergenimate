import { AnimationConfig, ImageInfo } from '../../types';

interface TemplateData {
  config: AnimationConfig;
  images: ImageInfo[];
  imageUrls: string[];
  milestones: number[];
}

export const generateReactComponent = (data: TemplateData): string => {
  const { config, imageUrls, milestones } = data;

  return `import { useEffect, useRef, useState } from 'react';

interface MerganimateProps {
  images: string[];
  duration?: string;
  milestones?: number[];
  className?: string;
  isCycling?: boolean;
}

export const Mergenimate: React.FC<MerganimateProps> = ({
  images = ${JSON.stringify(imageUrls)},
  duration = '${config.duration}',
  milestones = ${JSON.stringify(milestones)},
  className = '${config.className}',
  isCycling = ${config.isCycling}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16 / 9');

  useEffect(() => {
    if (images.length === 0) return;

    const parseDuration = (dStr: string): number | null => {
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

    const totalDuration = parseDuration(duration);
    if (!totalDuration) return;

    const keyframes = [
      [0, 0],
      ...milestones.map((timePercent, index) => {
        const sliderValue = ((index + 1) / milestones.length) * 100;
        return [timePercent, sliderValue];
      }),
    ];
    if (keyframes[keyframes.length - 1][0] < 100) {
      keyframes.push([100, 100]);
    }

    const imgElements = containerRef.current?.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    if (!imgElements || imgElements.length === 0) return;

    const firstImg = new Image();
    firstImg.onload = () => {
      setAspectRatio(\`\${firstImg.naturalWidth} / \${firstImg.naturalHeight}\`);

      let startTime: number | null = null;

      const animate = (timestamp: number) => {
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

        const numImages = images.length;
        const numSegments = isCycling ? numImages : numImages - 1;
        const position = (sliderValue / 100) * numSegments;
        const lowerIndex = Math.floor(position);
        const fade = position - lowerIndex;

        const lowerImageIndex = lowerIndex % numImages;
        const upperImageIndex = (lowerIndex + 1) % numImages;

        imgElements.forEach((img) => {
          img.style.opacity = '0';
          img.style.zIndex = '0';
        });

        const lowerImg = imgElements[lowerImageIndex];
        if (lowerImg) {
          lowerImg.style.opacity = '1';
          lowerImg.style.zIndex = '1';
        }

        const upperImg = imgElements[upperImageIndex];
        if (upperImg && (isCycling || position < numImages - 1)) {
          upperImg.style.opacity = String(fade);
          upperImg.style.zIndex = '2';
        }

        requestAnimationFrame(animate);
      };

      Promise.all(images.map(src => new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
      }))).then(() => {
        requestAnimationFrame(animate);
      });
    };
    firstImg.src = images[0];
  }, [images, duration, milestones, isCycling]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        lineHeight: 0,
        aspectRatio
      }}
    >
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={\`Image \${index + 1}\`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: index === 0 ? 1 : 0
          }}
        />
      ))}
    </div>
  );
};`;
};

export const generateVueComponent = (data: TemplateData): string => {
  const { config, imageUrls, milestones } = data;

  return `<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Props {
  images?: string[];
  duration?: string;
  milestones?: number[];
  className?: string;
  isCycling?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => ${JSON.stringify(imageUrls)},
  duration: '${config.duration}',
  milestones: () => ${JSON.stringify(milestones)},
  className: '${config.className}',
  isCycling: ${config.isCycling}
});

const containerRef = ref<HTMLDivElement | null>(null);
const aspectRatio = ref('16 / 9');

onMounted(() => {
  if (props.images.length === 0) return;

  const parseDuration = (dStr: string): number | null => {
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

  const totalDuration = parseDuration(props.duration);
  if (!totalDuration) return;

  const keyframes = [
    [0, 0],
    ...props.milestones.map((timePercent, index) => {
      const sliderValue = ((index + 1) / props.milestones.length) * 100;
      return [timePercent, sliderValue];
    }),
  ];
  if (keyframes[keyframes.length - 1][0] < 100) {
    keyframes.push([100, 100]);
  }

  const imgElements = containerRef.value?.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
  if (!imgElements || imgElements.length === 0) return;

  const firstImg = new Image();
  firstImg.onload = () => {
    aspectRatio.value = \`\${firstImg.naturalWidth} / \${firstImg.naturalHeight}\`;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
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

      const numImages = props.images.length;
      const numSegments = props.isCycling ? numImages : numImages - 1;
      const position = (sliderValue / 100) * numSegments;
      const lowerIndex = Math.floor(position);
      const fade = position - lowerIndex;

      const lowerImageIndex = lowerIndex % numImages;
      const upperImageIndex = (lowerIndex + 1) % numImages;

      imgElements.forEach((img) => {
        img.style.opacity = '0';
        img.style.zIndex = '0';
      });

      const lowerImg = imgElements[lowerImageIndex];
      if (lowerImg) {
        lowerImg.style.opacity = '1';
        lowerImg.style.zIndex = '1';
      }

      const upperImg = imgElements[upperImageIndex];
      if (upperImg && (props.isCycling || position < numImages - 1)) {
        upperImg.style.opacity = String(fade);
        upperImg.style.zIndex = '2';
      }

      requestAnimationFrame(animate);
    };

    Promise.all(props.images.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    }))).then(() => {
      requestAnimationFrame(animate);
    });
  };
  firstImg.src = props.images[0];
});

const containerStyle = computed(() => ({
  position: 'relative' as const,
  overflow: 'hidden' as const,
  lineHeight: '0',
  aspectRatio: aspectRatio.value
}));
</script>

<template>
  <div
    ref="containerRef"
    :class="className"
    :style="containerStyle"
  >
    <img
      v-for="(src, index) in images"
      :key="index"
      :src="src"
      :alt="\`Image \${index + 1}\`"
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        opacity: index === 0 ? 1 : 0
      }"
    />
  </div>
</template>`;
};

export const generateSvelteComponent = (data: TemplateData): string => {
  const { config, imageUrls, milestones } = data;

  return `<script lang="ts">
  import { onMount } from 'svelte';

  export let images: string[] = ${JSON.stringify(imageUrls)};
  export let duration: string = '${config.duration}';
  export let milestones: number[] = ${JSON.stringify(milestones)};
  export let className: string = '${config.className}';
  export let isCycling: boolean = ${config.isCycling};

  let containerRef: HTMLDivElement;
  let aspectRatio = '16 / 9';

  onMount(() => {
    if (images.length === 0) return;

    const parseDuration = (dStr: string): number | null => {
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

    const totalDuration = parseDuration(duration);
    if (!totalDuration) return;

    const keyframes = [
      [0, 0],
      ...milestones.map((timePercent, index) => {
        const sliderValue = ((index + 1) / milestones.length) * 100;
        return [timePercent, sliderValue];
      }),
    ];
    if (keyframes[keyframes.length - 1][0] < 100) {
      keyframes.push([100, 100]);
    }

    const imgElements = containerRef?.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    if (!imgElements || imgElements.length === 0) return;

    const firstImg = new Image();
    firstImg.onload = () => {
      aspectRatio = \`\${firstImg.naturalWidth} / \${firstImg.naturalHeight}\`;

      let startTime: number | null = null;

      const animate = (timestamp: number) => {
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

        const numImages = images.length;
        const numSegments = isCycling ? numImages : numImages - 1;
        const position = (sliderValue / 100) * numSegments;
        const lowerIndex = Math.floor(position);
        const fade = position - lowerIndex;

        const lowerImageIndex = lowerIndex % numImages;
        const upperImageIndex = (lowerIndex + 1) % numImages;

        imgElements.forEach((img) => {
          img.style.opacity = '0';
          img.style.zIndex = '0';
        });

        const lowerImg = imgElements[lowerImageIndex];
        if (lowerImg) {
          lowerImg.style.opacity = '1';
          lowerImg.style.zIndex = '1';
        }

        const upperImg = imgElements[upperImageIndex];
        if (upperImg && (isCycling || position < numImages - 1)) {
          upperImg.style.opacity = String(fade);
          upperImg.style.zIndex = '2';
        }

        requestAnimationFrame(animate);
      };

      Promise.all(images.map(src => new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
      }))).then(() => {
        requestAnimationFrame(animate);
      });
    };
    firstImg.src = images[0];
  });
</script>

<div
  bind:this={containerRef}
  class={className}
  style="position: relative; overflow: hidden; line-height: 0; aspect-ratio: {aspectRatio};"
>
  {#each images as src, index}
    <img
      {src}
      alt="Image {index + 1}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; opacity: {index === 0 ? 1 : 0};"
    />
  {/each}
</div>`;
};
