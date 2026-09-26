import React, { useState, useEffect, useCallback, useRef } from 'react';
import { memoryService } from '../services/memoryService';
import { authService } from '../services/authService';
import { Memory, PaginationMeta, MemberSearchResult } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { YearStoriesBar } from '../components/memory/YearStoriesBar';
import { InstagramMemoryCard } from '../components/memory/InstagramMemoryCard';
import { InstagramPostModal } from '../components/memory/InstagramPostModal';
import { AdCard } from '../components/memory/AdCard';
import { AdSenseInFeedUnit } from '../components/ads/AdSenseInFeedUnit';
import { adService } from '../services/adService';
import { Ad } from '../types';
import { getImageUrl } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  LayoutGrid, 
  SquareSplitVertical, 
  Sparkles,
  Users,
  X
} from 'lucide-react';

const AD_FREQUENCY = 8;

export const Memories: React.FC = () => {
  const toast = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const handleDeleteMemory = async (id: string) => {
    try {
      await memoryService.deleteMemory(id);
      toast.success('स्मृति सफलतापूर्वक हटा दी गई');
      setMemories((prev) => prev.filter((m) => m._id !== id));
      if (selectedModalMemory && selectedModalMemory._id === id) {
        setSelectedModalMemory(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'स्मृति हटाने में समस्या आई');
    }
  };

  // Devotee member suggestions search
  const [memberSuggestions, setMemberSuggestions] = useState<MemberSearchResult[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // View Mode: 'feed' (Single Instagram Cards) or 'grid' (3x3 Explore Grid)
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedModalMemory, setSelectedModalMemory] = useState<Memory | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Fetch member suggestions on search input change
  useEffect(() => {
    const query = debouncedSearch.trim();
    if (query.length >= 2) {
      authService.searchMembers(query)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setMemberSuggestions(res.data);
            setShowMemberDropdown(res.data.length > 0);
          }
        })
        .catch(() => setMemberSuggestions([]));
    } else {
      setMemberSuggestions([]);
      setShowMemberDropdown(false);
    }
  }, [debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active ads in parallel
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await adService.getActiveAds();
        if (res.success && Array.isArray(res.data)) {
          setAds(res.data);
        }
      } catch {
        // Silently fail if no ads configured
      }
    };
    fetchAds();
  }, []);

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
      setError(err.message || 'Failed to load memories. Please try again.');
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
        badge="Digital Archive"
        title="Kapooripur Durga Puja Memories"
        subtitle="A sacred archive of photographs, Maha Aarti celebrations, pandal moments, and cultural events shared by devotees."
      />

      {/* 1. Instagram Stories-Style Year Reel Circles */}
      <YearStoriesBar
        selectedYear={selectedYear}
        onSelectYear={(year) => setSelectedYear(year)}
      />

      {/* 2. Top Controls: Search Bar & Feed/Grid Toggle */}
      <div className="bg-cream-100 p-3 sm:p-4 rounded-2xl border border-cream-300/80 shadow-soft mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input with Devotee Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setShowMemberDropdown(true);
              }
            }}
            onFocus={() => {
              if (memberSuggestions.length > 0) setShowMemberDropdown(true);
            }}
            placeholder="खोजें: सदस्य का नाम, @username या कैप्शन..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm font-body text-dark-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowMemberDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-dark-900 p-0.5 rounded-full hover:bg-cream-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Member Dropdown Suggestions */}
          {showMemberDropdown && memberSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-cream-50 rounded-2xl shadow-xl border border-cream-300 py-2 z-40 max-h-64 overflow-y-auto divide-y divide-cream-200">
              <div className="px-3 py-1 text-[11px] font-bold text-maroon-800 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>भक्त एवं सदस्य (Devotees)</span>
              </div>
              {memberSuggestions.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => {
                    setSearchTerm(member.username ? `@${member.username}` : member.name);
                    setShowMemberDropdown(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-gold-50/60 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-maroon-800 text-cream-50 flex items-center justify-center font-bold text-xs overflow-hidden border border-cream-300 shrink-0">
                      {member.avatar ? (
                        <img
                          src={getImageUrl(member.avatar)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{member.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-heading font-bold text-dark-900 group-hover:text-maroon-900">
                        {member.name}
                      </p>
                      {member.username && (
                        <p className="text-[11px] font-mono text-maroon-700 font-semibold">
                          @{member.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-body font-semibold text-muted bg-cream-200 group-hover:bg-gold-200/80 px-2 py-0.5 rounded-full">
                    फ़ीड देखें →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Switcher (Feed vs Grid) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          {pagination && (
            <span className="text-xs font-body text-muted font-medium">
              {pagination.total} Memories {selectedYear ? `(${selectedYear})` : ''}
            </span>
          )}

          <div className="flex items-center bg-cream-200 p-1 rounded-xl border border-cream-300">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-body font-semibold transition-all ${
                viewMode === 'feed'
                  ? 'bg-maroon-800 text-cream-50 shadow-sm'
                  : 'text-dark-700 hover:text-dark-900'
              }`}
              title="Feed View"
            >
              <SquareSplitVertical className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-body font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-maroon-800 text-cream-50 shadow-sm'
                  : 'text-dark-700 hover:text-dark-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-body text-xs text-muted">Loading sacred memories...</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && error && (
        <div className="py-12 text-center bg-rose-50 rounded-2xl border border-rose-200 p-6 max-w-md mx-auto">
          <p className="font-body text-sm text-rose-700 mb-4">{error}</p>
          <Button size="sm" onClick={fetchMemories}>
            Try Again
          </Button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && !error && memories.length === 0 && (
        <div className="py-16 text-center bg-cream-100 rounded-3xl border border-cream-300 max-w-md mx-auto p-8">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-pulse" />
          <h3 className="font-heading font-bold text-dark-900 text-lg mb-1">
            No Memories Found
          </h3>
          <p className="font-body text-xs text-muted mb-4">
            {selectedYear 
              ? `No memories found for year ${selectedYear}.` 
              : 'No memories matched your search criteria.'}
          </p>
          {(selectedYear !== undefined || searchTerm) && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RotateCcw className="w-4 h-4" />}>
              Clear Filters
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
              {memories.map((memory, index) => {
                const isAdSlot = (index + 1) % AD_FREQUENCY === 0;
                const adInterval = Math.floor((index + 1) / AD_FREQUENCY);
                const hasCustomAds = ads.length > 0;
                const showCustomAd = isAdSlot && hasCustomAds && adInterval % 2 === 1;
                const showAdSense = isAdSlot && (!hasCustomAds || adInterval % 2 === 0);
                const customAdIndex = Math.floor(index / AD_FREQUENCY) % (ads.length || 1);
                const customAdToRender = ads[customAdIndex];

                return (
                  <React.Fragment key={memory._id}>
                    <InstagramMemoryCard
                      memory={memory}
                      onDelete={handleDeleteMemory}
                    />
                    {/* Custom Direct Sponsor Ad */}
                    {showCustomAd && customAdToRender && (
                      <AdCard ad={customAdToRender} />
                    )}
                    {/* Google AdSense In-Feed Native Unit */}
                    {showAdSense && (
                      <AdSenseInFeedUnit />
                    )}
                  </React.Fragment>
                );
              })}
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
                    alt={memory.caption || 'Kapooripur Memory'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/hero-durga.jpg';
                    }}
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-cream-50">
                    <span className="self-end text-[10px] bg-dark-900/80 px-1.5 py-0.5 rounded-full font-bold">
                      {memory.year}
                    </span>
                    <p className="text-[11px] font-body line-clamp-2 leading-tight">
                      {memory.caption || 'Durga Puja Memory'}
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
            Previous
          </Button>

          <span className="text-xs font-body font-semibold px-4 py-2 rounded-xl bg-cream-100 border border-cream-300">
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
            Next
          </Button>
        </div>
      )}

      {/* 8. Instagram Detail Popup Modal for Grid View */}
      <InstagramPostModal
        isOpen={!!selectedModalMemory}
        memory={selectedModalMemory}
        onClose={() => setSelectedModalMemory(null)}
        onDelete={handleDeleteMemory}
      />
    </div>
  );
};
