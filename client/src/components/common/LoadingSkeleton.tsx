import React from 'react';

export const MemoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-cream-100 rounded-2xl overflow-hidden border border-cream-300 shadow-soft animate-pulse flex flex-col">
      <div className="w-full aspect-[4/3] bg-cream-300/80" />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cream-300/80" />
              <div className="w-24 h-4 bg-cream-300/80 rounded" />
            </div>
            <div className="w-12 h-5 bg-cream-300/80 rounded-full" />
          </div>
          <div className="w-full h-4 bg-cream-300/80 rounded mb-2" />
          <div className="w-3/4 h-4 bg-cream-300/80 rounded mb-4" />
        </div>
        <div className="pt-3 border-t border-cream-200 flex justify-between items-center">
          <div className="w-20 h-3 bg-cream-300/80 rounded" />
          <div className="w-16 h-7 bg-cream-300/80 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const CommitteeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-cream-100 rounded-2xl overflow-hidden border border-cream-300 shadow-soft animate-pulse flex flex-col items-center p-6 text-center">
      <div className="w-36 h-36 rounded-full bg-cream-300/80 mb-4" />
      <div className="w-32 h-5 bg-cream-300/80 rounded mb-2" />
      <div className="w-24 h-4 bg-cream-300/80 rounded-full mb-3" />
      <div className="w-full h-3 bg-cream-300/80 rounded mb-1" />
      <div className="w-4/5 h-3 bg-cream-300/80 rounded" />
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <MemoryCardSkeleton key={index} />
      ))}
    </div>
  );
};
