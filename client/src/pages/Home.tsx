import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { MemoryGrid } from '../components/memory/MemoryGrid';
import { CommitteePreview } from '../components/committee/CommitteePreview';
import { Memory, CommitteeMember } from '../types';
import { memoryService } from '../services/memoryService';
import { committeeService } from '../services/committeeService';
import { liveDarshanService } from '../services/liveDarshanService';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DonateButton } from '../components/donation/DonateButton';
import {
  Camera,
  BookOpen,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Flame,
  Sparkles,
  Users,
  Compass,
  Clock,
  Download,
  MapPin,
  ChevronRight,
  Radio,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingCommittee, setLoadingCommittee] = useState(true);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const { isInstalled, installApp } = usePWAInstall();

  // Poll for active live broadcasts every 30 seconds
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await liveDarshanService.listLiveSessions();
        if (res.success && Array.isArray(res.data)) {
          setLiveSessions(res.data);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    checkLiveStatus();
    const liveTimer = setInterval(checkLiveStatus, 30000);
    return () => clearInterval(liveTimer);
  }, []);

  useEffect(() => {
    // Fetch latest data for desktop overview
    const fetchHomeData = async () => {
      try {
        const memRes = await memoryService.getMemories({ limit: 6 });
        if (memRes.success) {
          setMemories(memRes.data);
        }
      } catch (err) {
        console.error('Failed to load memories for home:', err);
      } finally {
        setLoadingMemories(false);
      }

      try {
        const commRes = await committeeService.getCommittee();
        if (commRes.success) {
          setCommittee(commRes.data);
        }
      } catch (err) {
        console.error('Failed to load committee for home:', err);
      } finally {
        setLoadingCommittee(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========================================================================= */}
      {/* 📱 MOBILE-FIRST SACRED HOME PORTAL (Visible ONLY on Mobile md:hidden)      */}
      {/* ========================================================================= */}
      <div className="block md:hidden px-3 pt-3 pb-8 space-y-4">
        {/* 🔴 Mobile Live Darshan Active Banner */}
        {liveSessions.length > 0 && (
          <Link
            to="/live-darshan"
            className="block p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-maroon-800 to-red-700 text-white border-2 border-amber-400 shadow-xl animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Radio className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                    <h4 className="text-xs font-bold font-heading uppercase tracking-wide text-amber-200">
                      Live Aarti Broadcast
                    </h4>
                  </div>
                  <p className="text-[11px] text-cream-100 font-body">
                    Watch live darshan from Kapooripur pandal →
                  </p>
                </div>
              </div>
              <span className="bg-amber-400 text-maroon-950 text-xs font-black px-3 py-1.5 rounded-xl font-body shadow">
                Watch
              </span>
            </div>
          </Link>
        )}

        {/* 1. Mobile Sacred Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 border-2 border-amber-500/40 shadow-xl p-4 text-cream-50">
          <div className="absolute inset-0 bg-maroon-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-body font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Yaduvashi Durga Puja Kapooripur</span>
            </div>

            <h1 className="text-2xl font-heading font-black leading-tight text-cream-50 pt-1">
              Sacred Memories of <span className="text-amber-400">Durga Puja</span>
            </h1>

            <p className="text-xs font-body text-cream-200/90 leading-relaxed">
              A digital archive dedicated to preserving the holy traditions and memories of Kapooripur Durga Puja.
            </p>

            {/* Sacred Darshan Image Card */}
            <div className="w-full mt-3 rounded-2xl overflow-hidden aspect-[4/3] bg-dark-950 border border-amber-500/30 relative shadow-inner">
              <img
                src="/hero-durga.jpg"
                alt="Yaduvashi Durga Puja Kapooripur"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 text-xs text-cream-100 font-body font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kapooripur Puja Ground</span>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-dark-950 font-bold px-2 py-0.5 rounded-full">
                    Year 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Puja Schedule & Sacred Aarti Card */}
        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cream-200">
            <Clock className="w-4 h-4 text-maroon-700" />
            <h3 className="text-xs font-heading font-bold text-dark-950">
              Daily Puja & Maha Aarti Timings
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-body">
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/80">
              <span className="text-[10px] text-muted block">Morning</span>
              <strong className="text-dark-900">07:30 AM — Pushpanjali</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/80">
              <span className="text-[10px] text-muted block">Evening</span>
              <strong className="text-dark-900">07:00 PM — Maha Aarti</strong>
            </div>
          </div>
        </div>

        {/* 3. 1-Tap Mobile Feature Navigation Tiles */}
        <div className="space-y-2">
          <h3 className="text-xs font-heading font-bold text-dark-900 px-1">
            Quick Access
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Tile 1: Explore Memories */}
            <Link
              to="/memories"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-cream-300 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-maroon-800 text-amber-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark-950 font-heading">
                    Explore Archive
                  </h4>
                  <p className="text-[10px] text-muted font-body">2020-2026</p>
                </div>
                <ChevronRight className="w-4 h-4 text-maroon-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 2: Share Memory */}
            <Link
              to="/share-memory"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/80 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-cream-50 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 font-heading">
                    Share Memory
                  </h4>
                  <p className="text-[10px] text-amber-800 font-body">Upload Photo</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-800 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 3: Live Darshan */}
            <Link
              to="/live-darshan"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-red-100 to-cream-50 border border-red-300/80 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-red-700 text-cream-50 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-950 font-heading">
                    Live Darshan
                  </h4>
                  <p className="text-[10px] text-red-800 font-body">Aarti & Seva</p>
                </div>
                <ChevronRight className="w-4 h-4 text-red-800 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 4: Committee */}
            <Link
              to="/committee"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-cream-300 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-maroon-800 text-cream-50 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark-950 font-heading">
                    Committee
                  </h4>
                  <p className="text-[10px] text-muted font-body">Members & Seva</p>
                </div>
                <ChevronRight className="w-4 h-4 text-maroon-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 4. Mobile PWA Install Banner */}
        {!isInstalled && (
          <div
            onClick={installApp}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-dark-950 shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon-900 text-amber-400 flex items-center justify-center font-bold text-lg">
                Y
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading">
                  Install Durga Puja App
                </h4>
                <p className="text-[10px] font-body opacity-90">
                  Enjoy fast 1-tap access directly from home screen
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] bg-maroon-900 text-cream-50 font-bold px-3 py-1.5 rounded-full">
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP FULL OVERVIEW SECTIONS (Visible ONLY on Desktop md:flex)        */}
      {/* ========================================================================= */}
      <div className="hidden md:flex md:flex-col">
        {/* 🔴 Desktop Live Darshan Banner */}
        {liveSessions.length > 0 && (
          <div className="bg-gradient-to-r from-red-700 via-maroon-900 to-red-700 text-white py-3 px-4 border-b-2 border-gold-400 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-black uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Live Now
                </span>
                <span className="text-sm font-heading font-bold text-gold-200">
                  Live Maha Aarti broadcast is currently streaming from Kapooripur pandal!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/live-darshan">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold shadow border border-gold-300"
                  >
                    🔴 Join Live Darshan
                  </Button>
                </Link>
                <DonateButton size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500">
          <div className="absolute inset-0 bg-maroon-pattern opacity-40 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-body font-semibold mb-6 tracking-wide"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Yaduvashi Durga Puja Kapooripur</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-cream-50 tracking-tight leading-tight mb-6"
            >
              Sacred Memories of <span className="text-amber-400">Durga Puja</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-xl lg:text-2xl font-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              The digital home for Kapooripur Durga Puja's timeless memories and devotion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-14"
            >
              <Link to="/share-memory">
                <Button
                  variant="gold"
                  size="lg"
                  leftIcon={<Camera className="w-5 h-5 text-dark-950" />}
                  className="font-body text-base shadow-gold-glow"
                >
                  Share a Memory
                </Button>
              </Link>

              <Link to="/memories">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<BookOpen className="w-5 h-5 text-maroon-800" />}
                  className="font-body text-base bg-cream-100 hover:bg-cream-50 border-cream-300"
                >
                  Explore Memories
                </Button>
              </Link>
            </motion.div>

            {/* Sacred Imagery Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl p-2 bg-gradient-to-b from-amber-500/30 via-maroon-900/50 to-maroon-950"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-dark-950">
                <img
                  src="/hero-durga.jpg"
                  alt="Yaduvashi Durga Puja Kapooripur"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent flex items-end p-8">
                  <div className="text-left">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/90 text-dark-950 font-body uppercase tracking-wider inline-block mb-2">
                      Kapooripur Sacred Dham
                    </span>
                    <p className="text-lg font-heading font-bold text-cream-50 leading-snug max-w-xl drop-shadow-md">
                      A living digital archive honoring Maa Durga's grace and devotees' timeless faith.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Value Pillars */}
            <div className="mt-16 pt-8 border-t border-maroon-800/80 grid grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <Flame className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-body">
                    Holy Tradition
                  </h4>
                  <p className="text-[11px] text-cream-300/70">Decades of Faith</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-body">
                    Pure Archive
                  </h4>
                  <p className="text-[11px] text-cream-300/70">No Vanity Metrics</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <Camera className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-body">
                    Devotee Photos
                  </h4>
                  <p className="text-[11px] text-cream-300/70">Original Quality Preservation</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <HeartHandshake className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-body">
                    Community Spirit
                  </h4>
                  <p className="text-[11px] text-cream-300/70">Kapooripur Pride</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PUJA INTRODUCTION */}
        <section className="py-24 bg-cream-200">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-12 gap-14 items-center">
              <div className="col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-body border border-maroon-200">
                  <span>Devotion & Harmony</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-dark-950 leading-tight">
                  The Divine Celebration of Maa Durga on the Sacred Soil of Kapooripur
                </h2>
                <div className="w-16 h-1 bg-amber-500 rounded-full" />
                <p className="text-base font-body text-dark-800 leading-relaxed">
                  Yaduvashi Durga Puja Kapooripur is more than an annual religious celebration — it is a living symbol of devotion, togetherness, and cultural heritage for the entire village and devotees worldwide.
                </p>
                <Link to="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Read Full History & Guidelines
                  </Button>
                </Link>
              </div>

              <div className="col-span-5">
                <div className="bg-cream-100 p-8 rounded-3xl border-2 border-amber-400/40 shadow-medium relative">
                  <h3 className="text-xl font-heading font-bold text-maroon-900 mb-3">
                    Our Archival Pledge
                  </h3>
                  <p className="text-sm font-body text-dark-800 leading-relaxed mb-6">
                    "This platform is completely free from vanity metrics, likes, and social competitions. Our sole mission is to preserve every sacred photograph and moment of Kapooripur Durga Puja for generations to come."
                  </p>
                  <div className="pt-4 border-t border-cream-300 flex items-center justify-between text-xs font-body">
                    <span className="text-maroon-800 font-semibold">— Puja Committee, Kapooripur</span>
                    <span className="text-amber-800 font-medium">yaduvashidurgapujakapooripur.online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MEMORIES FEED PREVIEW */}
        <section className="py-24 bg-cream-50 border-t border-cream-300/80">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 mb-3 tracking-wide uppercase">
                  Memories Archive
                </span>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-maroon-900">
                  Latest Devotee Memories
                </h2>
              </div>
              <Link to="/memories">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Memories
                </Button>
              </Link>
            </div>

            <MemoryGrid
              memories={memories}
              isLoading={loadingMemories}
              emptyTitle="No memories archived yet"
              emptyDescription="Be the first to share a photograph or memory of Kapooripur Durga Puja."
            />
          </div>
        </section>

        {/* 4. COMMITTEE PREVIEW */}
        <CommitteePreview members={committee} isLoading={loadingCommittee} />
      </div>
    </div>
  );
};
