import { ImageInfo } from '../types';

/**
 * Processes a list of files, validates their dimensions, and returns an array of ImageInfo objects.
 */
export const processFiles = (files: FileList, referenceImage?: ImageInfo): Promise<ImageInfo[]> => {
  const imagePromises = Array.from(files).map(file => {
    return new Promise<ImageInfo>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          if (referenceImage && (img.width !== referenceImage.width || img.height !== referenceImage.height)) {
            reject(new Error(`All images must have the same dimensions. Expected ${referenceImage.width}x${referenceImage.height}px, but found ${img.width}x${img.height}px.`));
            return;
          }
          resolve({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            src: e.target?.result as string,
            width: img.width,
            height: img.height,
            file: file,
          });
        };
        img.onerror = () => reject(new Error(`Could not load image: ${file.name}`));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(imagePromises);
};

/**
 * Gets the file extension from a data URI string.
 */
export const getExtensionFromDataUri = (dataUri: string): string => {
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
