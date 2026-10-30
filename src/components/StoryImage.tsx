import React, { useState } from 'react';
import { Camera, Newspaper } from 'lucide-react';

interface StoryImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  aspectRatio?: '16:9' | '4:3' | 'square' | 'auto';
}

export const StoryImage: React.FC<StoryImageProps> = ({
  src,
  alt,
  className = '',
  category = 'News',
  aspectRatio = '4:3'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : aspectRatio === '4:3'
      ? 'aspect-[4/3]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : '';

  if (hasError || !src) {
    return (
      <div
        className={`w-full ${aspectClass} bg-[#e8e2d7] dark:bg-[#202025] border border-[#d6cfc2] dark:border-[#2d2d34] flex flex-col items-center justify-center p-6 text-center text-[#78716c] dark:text-[#a8a29e] relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center justify-center mb-2 z-10">
          <Newspaper className="w-6 h-6" />
        </div>
        <span className="text-xs font-headline tracking-widest uppercase text-red-700 dark:text-red-400 z-10">
          DAILY BUGLE ARCHIVES
        </span>
        <span className="text-xs font-serif italic text-[#57534e] dark:text-[#a8a29e] mt-1 max-w-[200px] truncate z-10">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#e8e2d7] dark:bg-[#1a1a1e] ${aspectClass} ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#ede8df] dark:bg-[#202025] animate-pulse">
          <Camera className="w-5 h-5 text-[#a8a29e]" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
