import React from 'react';
import { Sparkles } from 'lucide-react';
import { AVAILABLE_YEARS } from '../../utils/constants';

interface YearStoriesBarProps {
  selectedYear: number | undefined;
  onSelectYear: (year: number | undefined) => void;
}

export const YearStoriesBar: React.FC<YearStoriesBarProps> = ({
  selectedYear,
  onSelectYear,
}) => {
  return (
    <div className="w-full py-3 mb-6 border-y border-cream-300/60 bg-cream-100/60 backdrop-blur-sm -mx-4 px-4 sm:mx-0 sm:px-4 sm:rounded-2xl">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1 px-1">
        {/* All Years Circle */}
        <button
          onClick={() => onSelectYear(undefined)}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
        >
          <div
            className={`p-[2.5px] rounded-full transition-all duration-300 ${
              selectedYear === undefined
                ? 'bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-400 scale-105 shadow-md shadow-maroon-900/10'
                : 'bg-cream-300 group-hover:bg-cream-400'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cream-50 flex flex-col items-center justify-center p-1 border-2 border-cream-100 transition-transform group-active:scale-95">
              <Sparkles
                className={`w-5 h-5 ${
                  selectedYear === undefined ? 'text-maroon-700 animate-pulse' : 'text-dark-700/60'
                }`}
              />
              <span
                className={`text-[10px] font-devanagari-heading font-bold mt-0.5 ${
                  selectedYear === undefined ? 'text-maroon-900' : 'text-dark-700'
                }`}
              >
                सभी वर्ष
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-devanagari-body truncate max-w-[70px] ${
              selectedYear === undefined ? 'font-bold text-maroon-900' : 'text-dark-700/70 font-medium'
            }`}
          >
            अभिलेख
          </span>
        </button>

        {/* Year Story Bubbles */}
        {AVAILABLE_YEARS.slice(0, 10).map((year) => {
          const isSelected = selectedYear === year;
          const isCurrentYear = year === 2026;

          return (
            <button
              key={year}
              onClick={() => onSelectYear(year)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div
                className={`p-[2.5px] rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-400 scale-105 shadow-md shadow-maroon-900/10'
                    : isCurrentYear
                    ? 'bg-gradient-to-tr from-amber-400/80 to-maroon-600/80'
                    : 'bg-cream-300 group-hover:bg-cream-400'
                }`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cream-50 flex flex-col items-center justify-center p-1 border-2 border-cream-100 transition-transform group-active:scale-95 relative overflow-hidden">
                  {isCurrentYear && (
                    <span className="absolute top-1 text-[8px] bg-amber-500 text-cream-50 font-bold px-1 rounded-full scale-90">
                      पावन
                    </span>
                  )}
                  <span
                    className={`font-devanagari-heading font-bold text-base sm:text-lg leading-tight ${
                      isSelected ? 'text-maroon-800' : 'text-dark-900'
                    }`}
                  >
                    {year}
                  </span>
                  <span className="text-[9px] text-muted font-devanagari-body -mt-0.5">
                    दुर्गा पूजा
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-devanagari-body truncate max-w-[70px] ${
                  isSelected ? 'font-bold text-maroon-900' : 'text-dark-700/70 font-medium'
                }`}
              >
                {year}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
