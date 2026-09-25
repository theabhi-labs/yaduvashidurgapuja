import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EFFECTIVE_DATE } from '../../utils/constants';
import { ShieldCheck, ChevronDown, ArrowUp } from 'lucide-react';

export interface TocItem {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  titleHindi: string;
  titleEnglish: string;
  badge: string;
  description: string;
  tocItems: TocItem[];
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  titleHindi,
  titleEnglish,
  badge,
  description,
  tocItems,
  children,
}) => {
  const [activeId, setActiveId] = useState<string>(tocItems[0]?.id || '');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const scrollPosition = window.scrollY + 160;
      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    setIsMobileTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 rounded-3xl p-6 sm:p-10 mb-10 border-2 border-gold-500/40 shadow-medium relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/40 font-devanagari-body">
              {badge}
            </span>
            <span className="text-xs font-devanagari-body text-cream-300">
              अंतिम अद्यतन: {EFFECTIVE_DATE}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-devanagari-heading font-black text-cream-50 leading-tight">
            {titleHindi}
          </h1>
          <p className="text-sm sm:text-base font-medium text-gold-300">
            {titleEnglish}
          </p>

          <p className="text-xs sm:text-sm font-devanagari-body text-cream-200/90 leading-relaxed pt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Mobile Collapsible TOC */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          className="w-full flex items-center justify-between p-4 bg-cream-100 rounded-2xl border border-cream-300 shadow-soft text-xs font-bold text-dark-900 font-devanagari-body"
        >
          <span>अनुक्रमणिका (Table of Contents)</span>
          <ChevronDown
            className={`w-4 h-4 text-maroon-700 transition-transform ${
              isMobileTocOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMobileTocOpen && (
          <div className="mt-2 p-3 bg-cream-100 rounded-2xl border border-cream-300 shadow-soft space-y-1">
            {tocItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-devanagari-body transition-colors flex items-center gap-2 ${
                  activeId === item.id
                    ? 'bg-maroon-700 text-cream-50 font-bold'
                    : 'text-dark-800 hover:bg-cream-200'
                }`}
              >
                <span className="font-mono opacity-60 text-[10px]">{idx + 1}.</span>
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sticky Sidebar TOC */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24">
          <div className="bg-cream-100 p-5 rounded-3xl border border-cream-300 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-cream-300 font-devanagari-body text-xs font-bold uppercase tracking-wider text-gold-800">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>अनुक्रमणिका (Contents)</span>
            </div>

            <nav className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {tocItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-devanagari-body transition-all flex items-start gap-2 ${
                    activeId === item.id
                      ? 'bg-maroon-700 text-cream-50 font-bold shadow-sm'
                      : 'text-dark-800 hover:bg-cream-200/70'
                  }`}
                >
                  <span className="font-mono opacity-70 text-[10px] shrink-0 mt-0.5">
                    {idx + 1}.
                  </span>
                  <span className="leading-snug">{item.title}</span>
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-cream-300 text-center">
              <Link
                to="/contact"
                className="text-[11px] font-devanagari-body font-semibold text-maroon-800 hover:underline"
              >
                कोई प्रश्न है? हमसे संपर्क करें →
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <article className="lg:col-span-8 bg-cream-50 rounded-3xl border border-cream-300 shadow-soft p-6 sm:p-10 space-y-8">
          {children}
        </article>
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-maroon-700 text-cream-50 shadow-xl hover:bg-maroon-800 transition-all focus:outline-none focus:ring-2 focus:ring-gold-500"
          title="शीर्ष पर जाएं"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
