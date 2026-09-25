import React from 'react';
import { Button } from './Button';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-cream-100/80 border border-dashed border-cream-400 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-cream-200 border border-gold-400/40 flex items-center justify-center text-maroon-700 mb-4 shadow-inner">
        {icon || <Sparkles className="w-8 h-8 text-gold-600" />}
      </div>
      <h3 className="text-xl font-devanagari-heading font-bold text-dark-900 mb-2">
        {title}
      </h3>
      <p className="text-sm font-devanagari-body text-muted leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
