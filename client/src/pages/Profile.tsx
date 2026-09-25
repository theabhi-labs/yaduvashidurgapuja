import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { memoryService } from '../services/memoryService';
import { Memory } from '../types';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { formatDate, getImageUrl } from '../utils/helpers';
import { InstagramPostModal } from '../components/memory/InstagramPostModal';
import {
  ShieldCheck,
  ShieldAlert,
  Bookmark,
  PlusSquare,
  LogOut,
  Sparkles,
  Grid,
  Shield
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [bookmarkedMemories, setBookmarkedMemories] = useState<Memory[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'saved'>('my');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedModalMemory, setSelectedModalMemory] = useState<Memory | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's uploaded memories
        const res = await memoryService.getMyMemories();
        if (res.success) {
          setMyMemories(res.data);
        }

        // Fetch bookmarked memory IDs from localStorage
        const savedIds: string[] = JSON.parse(localStorage.getItem('saved_memories') || '[]');
        if (savedIds.length > 0) {
          // Fetch memories to match bookmarks
          const allRes = await memoryService.getMemories({ limit: 50 });
          if (allRes.success) {
            const savedList = allRes.data.filter((m) => savedIds.includes(m._id));
            setBookmarkedMemories(savedList);
          }
        }
      } catch (err) {
        console.error('Error fetching profile memories', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!user) return null;

  return (
    <div className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[85vh]">
      {/* 1. Instagram Profile Header */}
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-soft p-5 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with sacred gradient ring */}
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-maroon-800 text-cream-50 flex items-center justify-center font-bold text-3xl sm:text-4xl border-4 border-cream-100 shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Profile Bio & Stats */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-dark-950 flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.name}</span>
                  <span title="Verified Devotee"><ShieldCheck className="w-5 h-5 text-emerald-600" /></span>
                </h1>
                <p className="text-xs font-body text-muted mt-0.5">
                  {user.email} • Member since {formatDate(user.createdAt)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0">
                <Link to="/share-memory">
                  <Button size="sm" leftIcon={<PlusSquare className="w-4 h-4" />}>
                    Share Memory
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Log Out
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-cream-200 text-dark-900 border border-cream-300">
                📍 Kapooripur, Durga Puja Family
              </span>

              {isSuperAdmin ? (
                <span className="text-xs font-body font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  Super Administrator
                </span>
              ) : isAdmin ? (
                <span className="text-xs font-body font-bold px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 border border-maroon-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-maroon-700" />
                  Committee Admin
                </span>
              ) : (
                <span className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  🙏 Devotee Member
                </span>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-xs font-body font-bold px-3 py-1 rounded-full bg-maroon-800 text-cream-50 hover:bg-maroon-900 transition-colors shadow-sm"
                >
                  Open Admin Dashboard →
                </Link>
              )}
            </div>

            {/* Stat Counters (Instagram Style - No Vanity Followers) */}
            <div className="flex items-center justify-center sm:justify-start gap-8 pt-3 border-t border-cream-200/80">
              <div className="text-center sm:text-left">
                <span className="block font-bold text-lg font-heading text-maroon-900">
                  {myMemories.length}
                </span>
                <span className="text-xs font-body text-muted">Memories Shared</span>
              </div>

              <div className="text-center sm:text-left">
                <span className="block font-bold text-lg font-heading text-maroon-900">
                  {bookmarkedMemories.length}
                </span>
                <span className="text-xs font-body text-muted">Saved Memories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Instagram Tab Navigation */}
      <div className="flex items-center justify-center border-t border-b border-cream-300/80 mb-6 bg-cream-100/50 rounded-2xl">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-body font-bold transition-all relative ${
            activeTab === 'my'
              ? 'text-maroon-900'
              : 'text-dark-700/60 hover:text-dark-900'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Memories ({myMemories.length})</span>
          {activeTab === 'my' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-maroon-800 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-body font-bold transition-all relative ${
            activeTab === 'saved'
              ? 'text-maroon-900'
              : 'text-dark-700/60 hover:text-dark-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Memories ({bookmarkedMemories.length})</span>
          {activeTab === 'saved' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-maroon-800 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. Instagram 3x3 Photo Grid */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="font-body text-xs text-muted">Loading memories...</p>
        </div>
      ) : activeTab === 'my' ? (
        myMemories.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {myMemories.map((memory) => (
              <div
                key={memory._id}
                onClick={() => setSelectedModalMemory(memory)}
                className="relative aspect-square bg-cream-200 overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group shadow-sm border border-cream-300/60"
              >
                <img
                  src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
                  alt={memory.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-cream-50">
                  <span className="self-end text-[10px] bg-dark-900/80 px-1.5 py-0.5 rounded-full font-bold">
                    {memory.year}
                  </span>
                  <p className="text-[11px] font-body line-clamp-2 leading-tight">
                    {memory.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-cream-100 rounded-3xl border border-cream-300 max-w-md mx-auto p-8">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-dark-900 text-lg mb-1">
              No Memories Shared Yet
            </h3>
            <p className="font-body text-xs text-muted mb-4">
              Share your sacred photographs and remembrances from Kapooripur Durga Puja.
            </p>
            <Link to="/share-memory">
              <Button size="sm">Add First Memory +</Button>
            </Link>
          </div>
        )
      ) : (
        bookmarkedMemories.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {bookmarkedMemories.map((memory) => (
              <div
                key={memory._id}
                onClick={() => setSelectedModalMemory(memory)}
                className="relative aspect-square bg-cream-200 overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group shadow-sm border border-cream-300/60"
              >
                <img
                  src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
                  alt={memory.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-cream-50">
                  <span className="self-end text-[10px] bg-dark-900/80 px-1.5 py-0.5 rounded-full font-bold">
                    {memory.year}
                  </span>
                  <p className="text-[11px] font-body line-clamp-2 leading-tight">
                    {memory.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-cream-100 rounded-3xl border border-cream-300 max-w-md mx-auto p-8">
            <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-dark-900 text-lg mb-1">
              No Saved Memories
            </h3>
            <p className="font-body text-xs text-muted mb-4">
              Click the bookmark icon on any memory card to save your favorite memories here.
            </p>
            <Link to="/memories">
              <Button variant="outline" size="sm">Browse Memories</Button>
            </Link>
          </div>
        )
      )}

      {/* Instagram Post Detail Modal */}
      <InstagramPostModal
        isOpen={!!selectedModalMemory}
        memory={selectedModalMemory}
        onClose={() => setSelectedModalMemory(null)}
        onDelete={(id) => {
          setMyMemories((prev) => prev.filter((m) => m._id !== id));
          setBookmarkedMemories((prev) => prev.filter((m) => m._id !== id));
          setSelectedModalMemory(null);
        }}
      />
    </div>
  );
};
