import React, { useState, useEffect, useCallback } from 'react';
import { memoryService } from '../services/memoryService';
import { Memory, PaginationMeta } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { YearStoriesBar } from '../components/memory/YearStoriesBar';
import { InstagramMemoryCard } from '../components/memory/InstagramMemoryCard';
import { InstagramPostModal } from '../components/memory/InstagramPostModal';
import { getImageUrl } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  LayoutGrid, 
  SquareSplitVertical, 
  Sparkles
} from 'lucide-react';

export const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // View Mode: 'feed' (Single Instagram Cards) or 'grid' (3x3 Explore Grid)
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedModalMemory, setSelectedModalMemory] = useState<Memory | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchMemories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await memoryService.getMemories({
        page,
        limit: viewMode === 'grid' ? 18 : 10,
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
  }, [page, selectedYear, debouncedSearch, viewMode]);

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
    <div className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[80vh]">
      <SectionHeading
        badge="डिजिटल अभिलेखागार"
        title="कपूरिपुर दुर्गा पूजा स्मृतियाँ"
        subtitle="भक्तों और ग्रामवासियों द्वारा साझा किए गए पावन पलों, पूजा पंडालों, महाआरती और सांस्कृतिक आयोजनों की अनमोल धरोहर।"
      />

      {/* 1. Instagram Stories-Style Year Reel Circles */}
      <YearStoriesBar
        selectedYear={selectedYear}
        onSelectYear={(year) => setSelectedYear(year)}
      />

      {/* 2. Top Controls: Search Bar & Feed/Grid Toggle */}
      <div className="bg-cream-100 p-3 sm:p-4 rounded-2xl border border-cream-300/80 shadow-soft mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="स्मृति खोजें (उदा. आरती, 2024)..."
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm font-devanagari-body text-dark-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-dark-900"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Switcher (Feed vs Grid) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          {pagination && (
            <span className="text-xs font-devanagari-body text-muted font-medium">
              {pagination.total} स्मृतियाँ {selectedYear ? `(${selectedYear})` : ''}
            </span>
          )}

          <div className="flex items-center bg-cream-200 p-1 rounded-xl border border-cream-300">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-devanagari-body font-semibold transition-all ${
                viewMode === 'feed'
                  ? 'bg-maroon-800 text-cream-50 shadow-sm'
                  : 'text-dark-700 hover:text-dark-900'
              }`}
              title="इंस्टाग्राम फीड व्यू"
            >
              <SquareSplitVertical className="w-4 h-4" />
              <span>फीड</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-devanagari-body font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-maroon-800 text-cream-50 shadow-sm'
                  : 'text-dark-700 hover:text-dark-900'
              }`}
              title="3x3 ग्रिड व्यू"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>ग्रिड</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-devanagari-body text-xs text-muted">माँ की पावन स्मृतियाँ लोड हो रही हैं...</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && error && (
        <div className="py-12 text-center bg-rose-50 rounded-2xl border border-rose-200 p-6 max-w-md mx-auto">
          <p className="font-devanagari-body text-sm text-rose-700 mb-4">{error}</p>
          <Button size="sm" onClick={fetchMemories}>
            पुनः प्रयास करें
          </Button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && !error && memories.length === 0 && (
        <div className="py-16 text-center bg-cream-100 rounded-3xl border border-cream-300 max-w-md mx-auto p-8">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-pulse" />
          <h3 className="font-devanagari-heading font-bold text-dark-900 text-lg mb-1">
            कोई स्मृति नहीं मिली
          </h3>
          <p className="font-devanagari-body text-xs text-muted mb-4">
            {selectedYear 
              ? `वर्ष ${selectedYear} के लिए अभी कोई स्मृति नहीं है।` 
              : 'आपके द्वारा खोजे गए शब्दों के अनुसार कोई स्मृति नहीं मिली।'}
          </p>
          {(selectedYear !== undefined || searchTerm) && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RotateCcw className="w-4 h-4" />}>
              फ़िल्टर हटाएं
            </Button>
          )}
        </div>
      )}

      {/* 6. View Mode Render */}
      {!isLoading && !error && memories.length > 0 && (
        <>
          {/* A. Instagram Feed View */}
          {viewMode === 'feed' && (
            <div className="space-y-6">
              {memories.map((memory) => (
                <InstagramMemoryCard
                  key={memory._id}
                  memory={memory}
                  onDelete={(id) => setMemories((prev) => prev.filter((m) => m._id !== id))}
                />
              ))}
            </div>
          )}

          {/* B. Instagram 3x3 Explore Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-3 gap-1 sm:gap-2.5">
              {memories.map((memory) => (
                <div
                  key={memory._id}
                  onClick={() => setSelectedModalMemory(memory)}
                  className="relative aspect-square bg-cream-200 overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group shadow-sm border border-cream-300/60"
                >
                  <img
                    src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
                    alt={memory.caption || 'कपूरिपुर स्मृति'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-cream-50">
                    <span className="self-end text-[10px] bg-dark-900/80 px-1.5 py-0.5 rounded-full font-bold">
                      {memory.year}
                    </span>
                    <p className="text-[11px] font-devanagari-body line-clamp-2 leading-tight">
                      {memory.caption || 'माँ दुर्गा स्मृति'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 7. Pagination Controls */}
      {!isLoading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage || isLoading}
            onClick={() => {
              setPage((prev) => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            onClick={() => {
              setPage((prev) => prev + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            अगला
          </Button>
        </div>
      )}

      {/* 8. Instagram Detail Popup Modal for Grid View */}
      <InstagramPostModal
        isOpen={!!selectedModalMemory}
        memory={selectedModalMemory}
        onClose={() => setSelectedModalMemory(null)}
        onDelete={(id) => {
          setMemories((prev) => prev.filter((m) => m._id !== id));
          setSelectedModalMemory(null);
        }}
      />
    </div>
  );
};
