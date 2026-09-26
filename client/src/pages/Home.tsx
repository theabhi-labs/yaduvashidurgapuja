import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { MemoryGrid } from '../components/memory/MemoryGrid';
import { CommitteePreview } from '../components/committee/CommitteePreview';
import { HeroSlider } from '../components/home/HeroSlider';
import { AartiTimingsCard } from '../components/home/AartiTimingsCard';
import { Memory, CommitteeMember } from '../types';
import { memoryService } from '../services/memoryService';
import { committeeService } from '../services/committeeService';
import { liveDarshanService } from '../services/liveDarshanService';
import {
  Camera,
  BookOpen,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Flame,
  Sparkles,
  Radio,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingCommittee, setLoadingCommittee] = useState(true);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);

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

  const isLiveActive = liveSessions.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Fully Responsive for Mobile & Desktop)                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 py-12 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-maroon-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Sacred Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-body font-semibold mb-4 sm:mb-6 tracking-wide shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-cream-50 tracking-tight leading-tight mb-4 sm:mb-6"
          >
            माँ दुर्गा की पावन <span className="text-amber-400">स्मृतियाँ</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg lg:text-xl font-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
          >
            कपूरिपुर दुर्गा पूजा के भक्तिमय पलों, महाआरती और पावन संस्मरणों का डिजिटल संचय।
          </motion.p>

          {/* Hero Action CTA Buttons Row (3 Buttons: Share Memory, Explore, Live Darshan) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            {/* Button 1: Share Memory */}
            <Link to="/share-memory">
              <Button
                variant="gold"
                size="md"
                leftIcon={<Camera className="w-4 h-4 sm:w-5 sm:h-5 text-dark-950" />}
                className="font-body text-xs sm:text-base font-bold shadow-gold-glow"
              >
                अपनी याद साझा करें
              </Button>
            </Link>

            {/* Button 2: Explore Memories */}
            <Link to="/memories">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-maroon-800" />}
                className="font-body text-xs sm:text-base font-bold bg-cream-100 hover:bg-cream-50 border-cream-300"
              >
                स्मृतियाँ देखें
              </Button>
            </Link>

            {/* Button 3: Live Darshan with Animated Blinker when Live */}
            <Link to="/live-darshan">
              <Button
                variant="outline"
                size="md"
                leftIcon={
                  isLiveActive ? (
                    <span className="relative flex h-3 w-3 mr-1 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400" />
                    </span>
                  ) : (
                    <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  )
                }
                className={`font-body text-xs sm:text-base font-bold transition-all ${
                  isLiveActive
                    ? 'bg-gradient-to-r from-red-600 via-maroon-800 to-red-600 text-white border-2 border-amber-400 shadow-xl shadow-red-600/30 animate-pulse'
                    : 'bg-maroon-900/70 hover:bg-maroon-800 text-cream-100 border-amber-400/50'
                }`}
              >
                {isLiveActive ? '🔴 लाइव दर्शन (चालू है)' : 'लाइव दर्शन'}
              </Button>
            </Link>
          </motion.div>

          {/* Sacred Animated Imagery Showcase & Dynamic Slideshow */}
          <HeroSlider />

          {/* Value Pillars */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-maroon-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  पावन परंपरा
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">दशकों पुरानी अटूट आस्था</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  निर्मल संचय
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">दिखावे व होड़ से मुक्त</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  भक्तों की यादें
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">मूल गुणवत्ता में संरक्षित</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  सामुदायिक भाव
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">कपूरिपुर का गौरव</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DAILY PUJA & MAHA AARTI TIMINGS (Web & Mobile)                         */}
      {/* ========================================================================= */}
      <AartiTimingsCard isLiveActive={isLiveActive} />

      {/* ========================================================================= */}
      {/* 3. PUJA INTRODUCTION & ARCHIVAL PLEDGE                                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-body border border-maroon-200">
                <span>भक्ति एवं सौहार्द</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-dark-950 leading-tight">
                कपूरिपुर की पावन धरा पर माँ दुर्गा का दिव्य उत्सव
              </h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto lg:mx-0" />
              <p className="text-sm sm:text-base font-body text-dark-800 leading-relaxed">
                यदुवंशी दुर्गा पूजा कपूरिपुर केवल एक वार्षिक धार्मिक उत्सव नहीं, अपितु समस्त ग्रामवासियों, प्रवासियों और माँ के अनन्य भक्तों के अगाध प्रेम, समर्पण व सांस्कृतिक धरोहर का सजीव संगम है।
              </p>
              <div className="pt-2">
                <Link to="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    हमारा इतिहास एवं दर्शन देखें
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border-2 border-amber-400/40 shadow-medium relative">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-maroon-900 mb-3">
                  हमारा पावन संकल्प
                </h3>
                <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed mb-6">
                  "यह डिजिटल मंच किसी भी प्रकार के दिखावे, लाइक्स या सामाजिक प्रतिस्पर्धा से पूर्णतः मुक्त है। हमारा एकमात्र उद्देश्य कपूरिपुर दुर्गा पूजा के प्रत्येक पावन क्षण और भक्तिमय यादों को आने वाली पीढ़ियों के लिए गरिमापूर्वक सहेजना है।"
                </p>
                <div className="pt-4 border-t border-cream-300 flex items-center justify-between text-xs font-body">
                  <span className="text-maroon-800 font-semibold">— पूजा समिति, कपूरिपुर</span>
                  <span className="text-amber-800 font-medium">kapooripur.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PUJA SEVA & DONATION CALLOUT (Mobile & Desktop)                         */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 border-y-2 border-amber-500/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold font-body border border-amber-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>माँ दुर्गा पूजा सेवा एवं महाप्रसाद</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-heading font-bold text-cream-50">
            पूजा, महाप्रसाद एवं व्यवस्था में अपना श्रद्धा सुमन अर्पित करें
          </h2>
          <p className="text-xs sm:text-sm font-body text-cream-200/90 max-w-2xl mx-auto leading-relaxed">
            कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों, महाआरती, प्रसाद वितरण और भव्य आयोजन में सभी भक्त ऑनलाइन दान देकर पुण्य के भागीदार बन सकते हैं।
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contributors">
              <Button
                variant="gold"
                size="md"
                leftIcon={<HeartHandshake className="w-4 h-4 text-dark-950" />}
                className="font-bold shadow-gold-glow"
              >
                पावन सहयोगी बनें (Contributors)
              </Button>
            </Link>

            <Link to="/about">
              <Button
                variant="outline"
                size="md"
                className="text-cream-100 border-amber-400/50 hover:bg-maroon-800/80"
              >
                व्यवस्था एवं विवरण
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MEMORIES FEED PREVIEW (Desktop Only — Hidden on Mobile for fast focus)   */}
      {/* ========================================================================= */}
      <section className="hidden md:block py-16 sm:py-24 bg-cream-50 border-t border-cream-300/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 mb-2 sm:mb-3 tracking-wide uppercase">
                स्मृति संचय
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-maroon-900">
                भक्तों द्वारा साझा की गई पावन स्मृतियाँ
              </h2>
            </div>
            <Link to="/memories" className="self-start sm:self-auto">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                सभी स्मृतियाँ देखें
              </Button>
            </Link>
          </div>

          <MemoryGrid
            memories={memories}
            isLoading={loadingMemories}
            emptyTitle="अभी कोई स्मृति साझा नहीं की गई है"
            emptyDescription="कपूरिपुर दुर्गा पूजा की पहली पावन तस्वीर साझा करके इस डिजिटल संचय की शुरुआत करें।"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMMITTEE PREVIEW                                                      */}
      {/* ========================================================================= */}
      <CommitteePreview members={committee} isLoading={loadingCommittee} />
    </div>
  );
};
