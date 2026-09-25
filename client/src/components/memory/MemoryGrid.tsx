import React from 'react';
import { Memory } from '../../types';
import { MemoryCard } from './MemoryCard';
import { GridSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { AlertCircle, ImageOff } from 'lucide-react';

interface MemoryGridProps {
  memories: Memory[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  showShareCTA?: boolean;
}

export const MemoryGrid: React.FC<MemoryGridProps> = ({
  memories,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'कोई स्मृति उपलब्ध नहीं है',
  emptyDescription = 'इस वर्ष या श्रेणी के लिए अभी तक कोई स्मृति दर्ज नहीं की गई है। पहली स्मृति आप साझा करें!',
  showShareCTA = true,
}) => {
  if (isLoading) {
    return <GridSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-maroon-50/50 rounded-2xl border border-maroon-200 max-w-md mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-maroon-700 mb-3" />
        <p className="text-base font-devanagari-body font-semibold text-maroon-900 mb-2">
          {error}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            पुनः प्रयास करें
          </Button>
        )}
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="w-8 h-8 text-gold-600" />}
        title={emptyTitle}
        description={emptyDescription}
        actionText={showShareCTA ? 'अपनी याद साझा करें' : undefined}
        onAction={
          showShareCTA
            ? () => {
                window.location.href = '/share-memory';
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {memories.map((memory) => (
        <MemoryCard key={memory._id} memory={memory} />
      ))}
    </div>
  );
};
