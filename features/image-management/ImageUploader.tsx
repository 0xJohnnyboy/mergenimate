import React from 'react';
import { useAppStore } from '../../store';
import { UploadIcon } from '../../components/ui/Icons';

interface ImageUploaderProps {
  onUpload: (files: FileList | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const isLoading = useAppStore((state) => state.isLoading);

  return (
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
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
        disabled={isLoading}
      />
      <p className="mt-4 text-sm text-gray-500">Upload 2 or more images with identical dimensions.</p>
    </div>
  );
};
