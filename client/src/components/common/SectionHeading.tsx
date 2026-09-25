import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  badge?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  centered = true,
  badge,
}) => {
  return (
    <div className={`mb-10 sm:mb-14 ${centered ? 'text-center' : 'text-left'}`}>
      {badge && (
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300/60 mb-3 tracking-wide uppercase">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-devanagari-heading font-bold text-maroon-900 mb-3 tracking-tight">
        {title}
      </h2>
      <div className={`flex items-center gap-2 mb-4 ${centered ? 'justify-center' : 'justify-start'}`}>
        <div className="w-8 h-[2px] bg-gold-500 rounded-full" />
        <div className="w-2.5 h-2.5 rotate-45 border border-gold-600 bg-gold-400 rounded-xs" />
        <div className="w-8 h-[2px] bg-gold-500 rounded-full" />
      </div>
      {subtitle && (
        <p className="text-base sm:text-lg font-devanagari-body text-muted max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
