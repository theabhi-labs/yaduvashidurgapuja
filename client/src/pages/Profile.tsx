import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { memoryService } from '../services/memoryService';
import { authService } from '../services/authService';
import { Memory } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';
import { InstagramPostModal } from '../components/memory/InstagramPostModal';
import { ImageCropperModal } from '../components/common/ImageCropperModal';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Bookmark,
  PlusSquare,
  LogOut,
  Sparkles,
  Grid,
  Shield,
  Camera,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AtSign,
  User as UserIcon,
  Loader2,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAdmin, isSuperAdmin, logout, updateUserState } = useAuth();
  const toast = useToast();

  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [bookmarkedMemories, setBookmarkedMemories] = useState<Memory[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'saved'>('my');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedModalMemory, setSelectedModalMemory] = useState<Memory | null>(null);

  // Avatar upload & crop state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRawImageFile, setSelectedRawImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState<boolean>(false);

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.name || '');
  const [editUsername, setEditUsername] = useState<string>(user?.username || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Live username availability check
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditUsername(user.username || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const res = await memoryService.getMyMemories();
        if (res.success) {
          setMyMemories(res.data);
        }

        const savedIds: string[] = JSON.parse(localStorage.getItem('saved_memories') || '[]');
        if (savedIds.length > 0) {
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

  // Debounced username checker in Edit Modal
  useEffect(() => {
    if (!isEditModalOpen) return;
    const clean = editUsername.trim().toLowerCase();
    if (!clean || clean === user?.username) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      return;
    }

    if (clean.length < 3) {
      setUsernameAvailable(false);
      setUsernameSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await authService.checkUsername(clean);
        if (res.success) {
          setUsernameAvailable(res.data.available);
          setUsernameSuggestions(res.data.suggestions || []);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [editUsername, isEditModalOpen, user?.username]);

  // Handle avatar photo selection -> Open Cropper Modal
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('केवल JPG, PNG और WebP चित्र ही अपलोड किए जा सकते हैं');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('फ़ाइल का आकार 15MB से कम होना चाहिए');
      return;
    }

    setSelectedRawImageFile(file);
    setIsCropperOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle upload after user adjusts and confirms crop
  const handleCropComplete = async (croppedFile: File) => {
    setIsUploadingAvatar(true);
    try {
      const res = await authService.uploadAvatar(croppedFile);
      if (res.success && res.data.user) {
        updateUserState(res.data.user);
        toast.success('प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई! 🌸');
      }
    } catch (err: any) {
      toast.error(err.message || 'फ़ोटो अपलोड करने में समस्या आई');
    } finally {
      setIsUploadingAvatar(false);
      setSelectedRawImageFile(null);
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    if (!window.confirm('क्या आप अपनी प्रोफ़ाइल फ़ोटो हटाना चाहते हैं?')) return;
    setIsRemovingAvatar(true);
    try {
      const res = await authService.removeAvatar();
      if (res.success && res.data.user) {
        updateUserState(res.data.user);
        toast.success('प्रोफ़ाइल फ़ोटो हटा दी गई');
      }
    } catch (err: any) {
      toast.error(err.message || 'फ़ोटो हटाने में समस्या आई');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Handle save profile details (Name & Username)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('कृपया अपना नाम दर्ज करें');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        name: editName.trim(),
        username: editUsername.trim() || undefined,
      });

      if (res.success && res.data.user) {
        updateUserState(res.data.user);
        toast.success('प्रोफ़ाइल विवरण सफलतापूर्वक सहेजा गया! ✨');
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'प्रोफ़ाइल अपडेट करने में समस्या आई');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[85vh] space-y-6">
      {/* 1. Professional Instagram Profile Card */}
      <div className="relative bg-cream-100/90 backdrop-blur-md rounded-3xl border border-cream-300 shadow-soft p-6 sm:p-8 overflow-hidden">
        {/* Corner Log Out Button */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="लॉग आउट करें (Log Out)"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Log Out</span>
        </button>

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarSelect}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
        />

        {/* Centered Profile Layout */}
        <div className="flex flex-col items-center text-center">
          {/* 1. Profile Avatar with Camera Trigger */}
          <div className="relative mb-3.5">
            <div className="p-[3.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-gold-400 shadow-md">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-maroon-800 text-cream-50 flex items-center justify-center font-bold text-3xl sm:text-4xl border-4 border-cream-100 overflow-hidden shadow-inner cursor-pointer group"
                title="फ़ोटो बदलें (Change Photo)"
              >
                {isUploadingAvatar ? (
                  <div className="w-full h-full bg-black/60 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gold-300 animate-spin" />
                  </div>
                ) : user.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Camera Badge Icon Button at bottom-right */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-maroon-900 text-gold-300 border-2 border-cream-100 shadow-md hover:bg-maroon-950 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="फ़ोटो बदलें (Upload Profile Photo)"
              aria-label="Upload Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Devotee Name */}
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-dark-950 flex items-center justify-center gap-1.5 leading-tight">
            <span>{user.name}</span>
            <span title="सत्यापित भक्त (Verified Devotee)">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            </span>
          </h1>

          {/* 3. @username & Email */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-1.5">
            <span className="text-xs sm:text-sm font-mono font-bold text-maroon-800 bg-maroon-900/10 px-2.5 py-0.5 rounded-full border border-maroon-800/15">
              @{user.username || 'devotee'}
            </span>
            <span className="text-xs text-muted font-body">
              • {user.email}
            </span>
          </div>

          {/* 4. Action Buttons: Edit Profile & Share Memory */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="border-gold-600 text-maroon-950 hover:bg-gold-50 font-bold px-4 py-2"
            >
              Edit Profile
            </Button>

            <Link to="/share-memory">
              <Button 
                size="sm" 
                leftIcon={<PlusSquare className="w-4 h-4" />}
                className="bg-maroon-900 hover:bg-maroon-950 text-gold-100 px-4 py-2 font-bold shadow-sm"
              >
                Share Memory
              </Button>
            </Link>
          </div>

          {/* 5. Role Badge & Admin Panel Clickable Button */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            {isSuperAdmin ? (
              <Link to="/admin">
                <button 
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-gold-500/20 hover:from-amber-500/30 hover:to-gold-500/30 text-amber-950 border border-amber-400/80 font-heading font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="सुपर एडमिन डैशबोर्ड खोलें"
                >
                  <Shield className="w-4 h-4 text-amber-700" />
                  <span>Super Admin Panel</span>
                  <span className="text-amber-800 font-bold">→</span>
                </button>
              </Link>
            ) : isAdmin ? (
              <Link to="/admin">
                <button 
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-950 border border-emerald-400/80 font-heading font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="समिति एडमिन डैशबोर्ड खोलें"
                >
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Mandap Admin Panel</span>
                  <span className="text-emerald-800 font-bold">→</span>
                </button>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold px-3.5 py-1 rounded-full bg-gold-100/80 text-maroon-900 border border-gold-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>🙏 पावन भक्त (Verified Devotee)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (My Uploads vs Saved/Bookmarked) */}
      <div className="flex items-center justify-center border-b border-cream-300 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 py-3 px-6 font-heading font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'my'
              ? 'border-maroon-900 text-maroon-900'
              : 'border-transparent text-muted hover:text-dark-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>मेरी स्मृतियाँ ({myMemories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-6 font-heading font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'saved'
              ? 'border-maroon-900 text-maroon-900'
              : 'border-transparent text-muted hover:text-dark-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>सहेजी गई ({bookmarkedMemories.length})</span>
        </button>
      </div>

      {/* 3. Grid of Posts */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-cream-300/50 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === 'my' ? (
        myMemories.length === 0 ? (
          <div className="text-center py-16 bg-cream-50 rounded-3xl border border-cream-300 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-maroon-900/10 text-maroon-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-dark-900">
              आपने अभी तक कोई स्मृति साझा नहीं की है
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto font-body">
              दुर्गा पूजा के पावन पलों, पंडाल एवं आरती की तस्वीरें अपलोड करें।
            </p>
            <Link to="/share-memory" className="inline-block pt-2">
              <Button leftIcon={<PlusSquare className="w-4 h-4" />}>
                Share First Memory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {myMemories.map((memory) => (
              <div
                key={memory._id}
                onClick={() => setSelectedModalMemory(memory)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-dark-950 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
                  alt={memory.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-3 text-center">
                  <p className="text-xs font-semibold line-clamp-3 font-body">
                    {memory.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookmarkedMemories.length === 0 ? (
        <div className="text-center py-16 bg-cream-50 rounded-3xl border border-cream-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-200 text-muted flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-dark-900">
            कोई सहेजी गई स्मृति नहीं है
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto font-body">
            फ़ीड में किसी भी स्मृति पर बुकमार्क आइकन दबाकर उसे यहाँ बाद के लिए सहेजें।
          </p>
          <Link to="/memories" className="inline-block pt-2">
            <Button variant="outline">Browse Memories Feed</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {bookmarkedMemories.map((memory) => (
            <div
              key={memory._id}
              onClick={() => setSelectedModalMemory(memory)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-dark-950 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={getImageUrl(memory.thumbnailUrl || memory.imageUrl)}
                alt={memory.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-3 text-center">
                <p className="text-xs font-semibold line-clamp-3 font-body">
                  {memory.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Instagram Detail Modal */}
      {selectedModalMemory && (
        <InstagramPostModal
          memory={selectedModalMemory}
          isOpen={Boolean(selectedModalMemory)}
          onClose={() => setSelectedModalMemory(null)}
        />
      )}

      {/* 5. Edit Profile & Instagram @Username Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile (प्रोफ़ाइल एवं यूजरनेम संपादित करें)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Section inside Modal */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-cream-200/60 border border-cream-300">
            <div className="w-14 h-14 rounded-full bg-maroon-800 text-cream-50 flex items-center justify-center font-bold text-lg border-2 border-cream-100 overflow-hidden shrink-0 shadow-sm">
              {isUploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-gold-300 animate-spin" />
              ) : user.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-dark-900 font-body">प्रोफ़ाइल फ़ोटो</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-2.5 py-1 rounded-lg bg-maroon-900 text-cream-50 text-xs font-semibold hover:bg-maroon-950 flex items-center gap-1 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>फ़ोटो बदलें</span>
                </button>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-semibold text-dark-900 mb-1 font-body">
              नाम (Full Display Name) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., Abhishek Yadav"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 font-body"
              />
              <UserIcon className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>
          </div>

          {/* Instagram-style @Username Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-dark-900 font-body">
                यूजरनेम (Instagram @Username) *
              </label>
              {isCheckingUsername ? (
                <span className="text-[11px] text-muted flex items-center gap-1 font-body">
                  <Loader2 className="w-3 h-3 animate-spin text-gold-600" />
                  जाँच हो रही है...
                </span>
              ) : usernameAvailable === true ? (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 font-body">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  उपलब्ध है!
                </span>
              ) : usernameAvailable === false ? (
                <span className="text-[11px] text-rose-700 font-bold flex items-center gap-1 font-body">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  उपलब्ध नहीं है
                </span>
              ) : null}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="e.g., abhishekyadav"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                  usernameAvailable === true
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20'
                    : usernameAvailable === false
                    ? 'border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-cream-300 bg-cream-50 text-dark-900 focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700'
                }`}
              />
              <AtSign className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>

            {/* Smart Suggestions Chips if Username Taken */}
            {usernameSuggestions.length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 block font-body">
                  सुझाए गए यूजरनेम (Click to Pick):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {usernameSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setEditUsername(sug)}
                      className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-gold-500 hover:text-maroon-950 text-dark-900 border border-gold-400/60 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-cream-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
              className="bg-maroon-900 text-gold-200"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Circular Profile Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageFile={selectedRawImageFile}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedRawImageFile(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default Profile;
