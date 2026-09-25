import React from 'react';

interface LegalSectionProps {
  id: string;
  number: number | string;
  title: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({
  id,
  number,
  title,
  children,
}) => {
  return (
    <section id={id} className="scroll-mt-28 space-y-4 pb-8 border-b border-cream-300/80 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-xl bg-maroon-700/10 text-maroon-900 border border-maroon-700/20 flex items-center justify-center text-xs sm:text-sm font-mono font-bold shrink-0 mt-0.5">
          {number}
        </span>
        <h2 className="text-lg sm:text-xl font-devanagari-heading font-bold text-dark-950 leading-snug">
          {title}
        </h2>
      </div>
      <div className="text-xs sm:text-sm font-devanagari-body text-dark-800 leading-relaxed space-y-3 pl-0 sm:pl-11">
        {children}
      </div>
    </section>
  );
};
