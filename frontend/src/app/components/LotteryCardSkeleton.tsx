import React from 'react';
import { Skeleton } from './ui/skeleton';

export const LotteryCardSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      <Skeleton className="mb-4 h-4 w-1/2" />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="mb-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};
