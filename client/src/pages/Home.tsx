import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { MemoryGrid } from '../components/memory/MemoryGrid';
import { CommitteePreview } from '../components/committee/CommitteePreview';
import { Memory, CommitteeMember } from '../types';
import { memoryService } from '../services/memoryService';
import { committeeService } from '../services/committeeService';
import { usePWAInstall } from '../hooks/usePWAInstall';
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
  ChevronRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingCommittee, setLoadingCommittee] = useState(true);
  const { isInstalled, installApp } = usePWAInstall();

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
        {/* 1. Mobile Sacred Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 border-2 border-amber-500/40 shadow-xl p-4 text-cream-50">
          <div className="absolute inset-0 bg-maroon-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-devanagari-body font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
            </div>

            <h1 className="text-2xl font-devanagari-heading font-black leading-tight text-cream-50 pt-1">
              यादों में बसी <span className="text-amber-400">दुर्गा पूजा</span>
            </h1>

            <p className="text-xs font-devanagari-body text-cream-200/90 leading-relaxed">
              कपूरिपुर की दुर्गा पूजा की पावन स्मृतियों का डिजिटल संचय।
            </p>

            {/* Sacred Darshan Image Card */}
            <div className="w-full mt-3 rounded-2xl overflow-hidden aspect-[4/3] bg-dark-950 border border-amber-500/30 relative shadow-inner">
              <img
                src="/hero-durga.jpg"
                alt="यदुवंशी दुर्गा पूजा कपूरिपुर"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 text-xs text-cream-100 font-devanagari-body font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>कपूरिपुर पूजा प्रांगण</span>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-dark-950 font-bold px-2 py-0.5 rounded-full">
                    वर्ष 2026
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
            <h3 className="text-xs font-devanagari-heading font-bold text-dark-950">
              पावन पूजा एवं महाआरती समय
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-devanagari-body">
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/80">
              <span className="text-[10px] text-muted block">प्रातः काल</span>
              <strong className="text-dark-900">07:30 AM — पुष्पांजलि</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/80">
              <span className="text-[10px] text-muted block">संध्या काल</span>
              <strong className="text-dark-900">07:00 PM — महाआरती</strong>
            </div>
          </div>
        </div>

        {/* 3. 1-Tap Mobile Feature Navigation Tiles */}
        <div className="space-y-2">
          <h3 className="text-xs font-devanagari-heading font-bold text-dark-900 px-1">
            मुख्य अनुभाग (Quick Access)
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
                  <h4 className="text-xs font-bold text-dark-950 font-devanagari-heading">
                    स्मृतियाँ देखें
                  </h4>
                  <p className="text-[10px] text-muted font-devanagari-body">वर्ष 2020-2026</p>
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
                  <h4 className="text-xs font-bold text-amber-950 font-devanagari-heading">
                    याद साझा करें
                  </h4>
                  <p className="text-[10px] text-amber-800 font-devanagari-body">फ़ोटो अपलोड</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-800 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 3: Committee */}
            <Link
              to="/committee"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-cream-300 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-maroon-800 text-cream-50 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark-950 font-devanagari-heading">
                    पूजा समिति
                  </h4>
                  <p className="text-[10px] text-muted font-devanagari-body">संरक्षक व सेवक</p>
                </div>
                <ChevronRight className="w-4 h-4 text-maroon-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 4: About & History */}
            <Link
              to="/about"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-cream-300 shadow-soft flex flex-col justify-between h-28 group active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-maroon-800 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark-950 font-devanagari-heading">
                    इतिहास व परिचय
                  </h4>
                  <p className="text-[10px] text-muted font-devanagari-body">कपूरिपुर गौरव</p>
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
                य
              </div>
              <div>
                <h4 className="text-xs font-bold font-devanagari-heading">
                  दुर्गा पूजा ऐप इंस्टॉल करें
                </h4>
                <p className="text-[10px] font-devanagari-body opacity-90">
                  बिना ब्राउज़र के सीधे होम स्क्रीन से चलाएं
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] bg-maroon-900 text-cream-50 font-bold px-3 py-1.5 rounded-full">
              <Download className="w-3.5 h-3.5" />
              <span>इंस्टॉल</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP FULL OVERVIEW SECTIONS (Visible ONLY on Desktop md:flex)        */}
      {/* ========================================================================= */}
      <div className="hidden md:flex md:flex-col">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500">
          <div className="absolute inset-0 bg-maroon-pattern opacity-40 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-devanagari-body font-semibold mb-6 tracking-wide"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-devanagari-heading font-black text-cream-50 tracking-tight leading-tight mb-6"
            >
              यादों में बसी <span className="text-amber-400">दुर्गा पूजा</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-xl lg:text-2xl font-devanagari-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              कपूरिपुर की दुर्गा पूजा की यादों का अपना डिजिटल घर।
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
                  className="font-devanagari-body text-base shadow-gold-glow"
                >
                  अपनी याद साझा करें
                </Button>
              </Link>

              <Link to="/memories">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<BookOpen className="w-5 h-5 text-maroon-800" />}
                  className="font-devanagari-body text-base bg-cream-100 hover:bg-cream-50 border-cream-300"
                >
                  यादें देखें
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
                  alt="यदुवंशी दुर्गा पूजा कपूरिपुर"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent flex items-end p-8">
                  <div className="text-left">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/90 text-dark-950 font-devanagari-body uppercase tracking-wider inline-block mb-2">
                      कपूरिपुर पावन धाम
                    </span>
                    <p className="text-lg font-devanagari-heading font-bold text-cream-50 leading-snug max-w-xl drop-shadow-md">
                      माँ जगदम्बा की पावन ज्योति और भक्तों की अखंड आस्था का जीवंत संचय।
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
                  <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                    पवित्र परंपरा
                  </h4>
                  <p className="text-[11px] text-cream-300/70">दशकों की आस्था</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                    शुद्ध संचय
                  </h4>
                  <p className="text-[11px] text-cream-300/70">कोई सोशल दिखावा नहीं</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <Camera className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                    भक्तों की तस्वीरें
                  </h4>
                  <p className="text-[11px] text-cream-300/70">मूल गुणवत्ता में सुरक्षित</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
                <HeartHandshake className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                    ग्राम परिवार
                  </h4>
                  <p className="text-[11px] text-cream-300/70">कपूरिपुर का गौरव</p>
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-devanagari-body border border-maroon-200">
                  <span>॥ आस्था एवं सौहार्द ॥</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-devanagari-heading font-bold text-dark-950 leading-tight">
                  कपूरिपुर की पावन भूमि पर माँ दुर्गा का अलौकिक उत्सव
                </h2>
                <div className="w-16 h-1 bg-amber-500 rounded-full" />
                <p className="text-base font-devanagari-body text-dark-800 leading-relaxed">
                  यदुवंशी दुर्गा पूजा, कपूरिपुर केवल एक वार्षिक धार्मिक अनुष्ठान नहीं, अपितु समूचे ग्रामवासियों के अपनत्व, संस्कृति और असीम भक्ति का जीवंत संगम है।
                </p>
                <Link to="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    विस्तृत इतिहास एवं नियम पढ़ें
                  </Button>
                </Link>
              </div>

              <div className="col-span-5">
                <div className="bg-cream-100 p-8 rounded-3xl border-2 border-amber-400/40 shadow-medium relative">
                  <h3 className="text-xl font-devanagari-heading font-bold text-maroon-900 mb-3">
                    स्मृति संचय का संकल्प
                  </h3>
                  <p className="text-sm font-devanagari-body text-dark-800 leading-relaxed mb-6">
                    "यह मंच लोकप्रियता, लाइक्स या टिप्पणियों की होड़ से पूरी तरह मुक्त है। हमारा एकमात्र उद्देश्य है कि कपूरिपुर की दुर्गा पूजा की प्रत्येक पावन तस्वीर और संस्मरण हमेशा के लिए सुरक्षित रहे।"
                  </p>
                  <div className="pt-4 border-t border-cream-300 flex items-center justify-between text-xs font-devanagari-body">
                    <span className="text-maroon-800 font-semibold">— पूजा समिति, कपूरिपुर</span>
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
                  स्मृति दीर्घा
                </span>
                <h2 className="text-3xl lg:text-4xl font-devanagari-heading font-bold text-maroon-900">
                  भक्तों की नवीनतम स्मृतियाँ
                </h2>
              </div>
              <Link to="/memories">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  सभी स्मृतियाँ देखें
                </Button>
              </Link>
            </div>

            <MemoryGrid
              memories={memories}
              isLoading={loadingMemories}
              emptyTitle="अभी कोई स्मृति दर्ज नहीं है"
              emptyDescription="कपूरिपुर दुर्गा पूजा की पहली तस्वीर और संस्मरण आप साझा करें।"
            />
          </div>
        </section>

        {/* 4. COMMITTEE PREVIEW */}
        <CommitteePreview members={committee} isLoading={loadingCommittee} />
      </div>
    </div>
  );
};
