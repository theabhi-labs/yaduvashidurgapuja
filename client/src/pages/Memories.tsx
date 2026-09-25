import React, { useState, useEffect, useCallback } from 'react';
import { memoryService } from '../services/memoryService';
import { Memory, PaginationMeta } from '../types';
import { MemoryGrid } from '../components/memory/MemoryGrid';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { AVAILABLE_YEARS } from '../utils/constants';
import { useDebounce } from '../hooks/useDebounce';
import { Search, Filter, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await memoryService.getMemories({
        page,
        limit: 12,
        year: selectedYear,
        search: debouncedSearch.trim() || undefined,
      });

      if (res.success) {
        setMemories(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      setError(err.message || 'स्मृतियाँ लोड करने में त्रुटि हुई');
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedYear, debouncedSearch]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Reset page to 1 when search or year filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedYear, debouncedSearch]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedYear(undefined);
    setPage(1);
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh]">
      <SectionHeading
        badge="डिजिटल अभिलेखागार"
        title="कपूरिपुर दुर्गा पूजा स्मृतियाँ"
        subtitle="भक्तों और ग्रामवासियों द्वारा साझा किए गए पावन पलों, पूजा पंडालों, महाआरती और सांस्कृतिक आयोजनों की अनमोल धरोहर।"
      />

      {/* Filter and Search Bar */}
      <div className="bg-cream-100 p-4 sm:p-6 rounded-2xl border border-cream-300 shadow-soft mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="स्मृति खोजें (उदा. आरती, पंडाल, 2024)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm font-devanagari-body text-dark-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          {/* Year Filter Buttons / Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-maroon-800 shrink-0 hidden sm:block" />
            <button
              onClick={() => setSelectedYear(undefined)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-devanagari-body font-medium transition-all shrink-0 ${
                selectedYear === undefined
                  ? 'bg-maroon-700 text-cream-50 font-bold shadow-sm'
                  : 'bg-cream-200 text-dark-800 hover:bg-cream-300 border border-cream-300'
              }`}
            >
              सभी वर्ष
            </button>

            {AVAILABLE_YEARS.slice(0, 7).map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-devanagari-body font-medium transition-all shrink-0 ${
                  selectedYear === year
                    ? 'bg-maroon-700 text-cream-50 font-bold shadow-sm'
                    : 'bg-cream-200 text-dark-800 hover:bg-cream-300 border border-cream-300'
                }`}
              >
                {year}
              </button>
            ))}

            {(selectedYear !== undefined || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-xl text-muted hover:text-maroon-800 hover:bg-cream-200 transition-colors shrink-0"
                title="फ़िल्टर हटाएं"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {pagination && (
          <div className="text-xs font-devanagari-body text-muted pt-2 border-t border-cream-200/80 flex items-center justify-between">
            <span>
              कुल <strong>{pagination.total}</strong> स्मृतियाँ मिलीं
              {selectedYear && ` (वर्ष ${selectedYear})`}
            </span>
            <span>
              पृष्ठ {pagination.page} / {pagination.totalPages || 1}
            </span>
          </div>
        )}
      </div>

      {/* Memories Grid */}
      <MemoryGrid
        memories={memories}
        isLoading={isLoading}
        error={error}
        onRetry={fetchMemories}
        emptyTitle="कोई स्मृति नहीं मिली"
        emptyDescription="आपके द्वारा चुने गए खोज या फ़िल्टर के अनुसार कोई स्मृति उपलब्ध नहीं है।"
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage || isLoading}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            पिछला
          </Button>

          <span className="text-xs font-devanagari-body font-semibold px-4 py-2 rounded-xl bg-cream-100 border border-cream-300">
            {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage || isLoading}
            onClick={() => setPage((prev) => prev + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            अगला
          </Button>
        </div>
      )}
    </div>
  );
};
