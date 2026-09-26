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
  LEGAL_ENTITY_NAME,
  LOCATION_TEXT,
  CONTACT_EMAIL,
} from '../utils/constants';
import {
  Camera,
  ArrowRight,
  ShieldCheck,
  Flame,
  Radio,
  Users,
  Sparkles,
  MapPin,
  Mail,
  Heart,
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
    <div className="flex flex-col min-h-screen font-body">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Pure Devotional Hindi Identity)                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-maroon-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Sacred Devotional Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-body font-semibold mb-4 sm:mb-6 tracking-wide shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
          </motion.div>

          {/* Pure Hindi Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-cream-50 tracking-tight leading-tight mb-4 sm:mb-6"
          >
            यदुवंशी दुर्गा पूजा समिति, <span className="text-amber-400">कपूरिपुर</span>
          </motion.h1>

          {/* Hindi Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg lg:text-xl font-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
          >
            माँ दुर्गा की पावन आराधना, परंपरा, संस्कृति और समरसता का दिव्य उत्सव।
          </motion.p>

          {/* Short Introduction Box in Pure Hindi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="max-w-2xl mx-auto bg-maroon-900/60 p-4 rounded-2xl border border-amber-500/30 text-xs sm:text-sm text-cream-200 mb-8 sm:mb-10 leading-relaxed shadow-sm"
          >
            यदुवंशी दुर्गा पूजा समिति, कपूरिपुर एक पावन सामुदायिक पहल है जो सभी श्रद्धालुओं एवं ग्रामवासियों को माँ दुर्गा की पूजा और सांस्कृतिक कार्यक्रमों में सम्मिलित होने के लिए एकजुट करती है।
          </motion.div>

          {/* Hero CTAs: Only "Share Memory" and "Live Darshan" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            {/* Share Memory Button */}
            <Link to="/share-memory">
              <Button
                variant="gold"
                size="md"
                leftIcon={<Camera className="w-4 h-4 sm:w-5 sm:h-5 text-dark-950" />}
                className="font-body text-xs sm:text-base font-bold shadow-gold-glow"
              >
                अपनी याद साझा करें (Share Memory)
              </Button>
            </Link>

            {/* Live Darshan Button */}
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
                {isLiveActive ? '🔴 लाइव दर्शन (Live)' : 'लाइव दर्शन (Live Darshan)'}
              </Button>
            </Link>
          </motion.div>

          {/* Sacred Animated Imagery Showcase & Dynamic Slideshow */}
          <HeroSlider />

          {/* Committee Quick Link below the Hero */}
          <div className="mt-4 sm:mt-5 text-center">
            <Link
              to="/committee"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maroon-900/90 hover:bg-maroon-800 text-amber-300 hover:text-amber-200 border border-amber-400/50 text-xs sm:text-sm font-heading font-semibold shadow-md transition-all active:scale-95 group cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>समिति सदस्य विवरण (Committee Members)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Value Pillars */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-maroon-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  पावन परंपरा
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">वैदिक पूजन एवं आराधना</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  पारदर्शी व्यवस्था
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">सामुदायिक निष्ठा व शुचिता</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  स्मृति संचय
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">भक्तिमय पलों का संकलन</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-body">
                  सामुदायिक सहभागिता
                </h4>
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">कपूरिपुर का पावन गौरव</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DAILY PUJA & SCHEDULE                                                  */}
      {/* ========================================================================= */}
      <AartiTimingsCard isLiveActive={isLiveActive} />

      {/* ========================================================================= */}
      {/* 3. ABOUT THE SAMITI SECTION (Pure Hindi)                                  */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-body border border-maroon-200">
                <Sparkles className="w-3.5 h-3.5 text-maroon-800" />
                <span>समिति परिचय</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-dark-950 leading-tight">
                यदुवंशी दुर्गा पूजा समिति, कपूरिपुर
              </h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto lg:mx-0" />
              <p className="text-sm sm:text-base font-body text-dark-800 leading-relaxed">
                यदुवंशी दुर्गा पूजा समिति, कपूरिपुर एक पावन सामुदायिक पहल है जो सभी श्रद्धालुओं को माँ दुर्गा के पूजन, परंपरा और सांस्कृतिक गतिविधियों में भाग लेने के लिए एक साथ लाती है।
              </p>
              <p className="text-xs sm:text-sm font-body text-dark-700 leading-relaxed">
                भदोही जनपद के कपूरिपुर में आयोजित यह समिति पारंपरिक शारदोत्सव, वैदिक अनुष्ठान, दैनिक महाआरती, विशाल भंडारा और सांस्कृतिक आयोजनों के माध्यम से ग्राम की एकता और पावन धरोहर को संजोए रखती है।
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    समिति का संपूर्ण विवरण देखें
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border-2 border-amber-400/40 shadow-medium space-y-4">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-maroon-900">
                  हमारी सांस्कृतिक धरोहर
                </h3>
                <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
                  "हमारा यह पावन उत्सव स्थानीय परिवारों, बुजुर्गों, युवाओं और देश भर से गाँव लौटने वाले सभी श्रद्धालुओं को माँ दुर्गा के पावन प्रांगण में एक सूत्र में पिरोता है।"
                </p>
                <div className="pt-3 border-t border-cream-300 space-y-2 text-xs text-dark-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-maroon-700 shrink-0" />
                    <span>{LOCATION_TEXT}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-maroon-700 shrink-0" />
                    <span>स्वैच्छिक सामुदायिक सहभागिता</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COMMUNITY ACTIVITIES SECTION (Pure Hindi)                              */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-100 border-t border-cream-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-8">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 border border-maroon-200 uppercase">
              सामुदायिक सेवा व पहल
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-dark-950">
              धार्मिक एवं सांस्कृतिक कार्यक्रम
            </h2>
            <p className="text-xs sm:text-sm text-dark-700">
              समिति द्वारा दुर्गा पूजा के पावन अवसर पर विभिन्न धार्मिक, सांस्कृतिक एवं जनकल्याणकारी कार्यक्रम आयोजित किए जाते हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                🪔
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                वैदिक अनुष्ठान एवं आरती
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                पारंपरिक चंडी पाठ, प्रातः व सायं दिव्य महाआरती और विद्वान आचार्यों द्वारा विधि-विधान से संपन्न पावन संकल्प।
              </p>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center font-bold">
                🍲
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                महाप्रसाद एवं भंडारा
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                माँ भगवती के पावन भोग का वितरण एवं सभी ग्रामवासियों व पधारे हुए श्रद्धालुओं हेतु विशाल भंडारा।
              </p>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                🎭
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                सांस्कृतिक संध्या व भजन
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                स्थानीय कलाकारों एवं युवाओं द्वारा भक्ति संगीत, देवी जागरण और सांस्कृतिक प्रस्तुतियाँ।
              </p>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                📸
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                डिजिटल स्मृति संचय
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                कपूरिपुर दुर्गा पूजा के ऐतिहासिक व पावन क्षणों, तस्वीरों और वीडियो को संजोने हेतु डिजिटल संग्रह।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRANSPARENCY & TRUST SECTION (Desktop only, hidden on mobile)           */}
      {/* ========================================================================= */}
      <section className="hidden md:block py-14 sm:py-20 bg-cream-200 border-t border-cream-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
              पारदर्शिता एवं शुचिता
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-950">
              सामुदायिक निष्ठा व प्रामाणिकता
            </h2>
            <p className="text-xs sm:text-sm text-dark-700">
              स्पष्ट संगठनात्मक जानकारी, अधिकृत संपर्क सूत्र एवं पारदर्शी नीतियां।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Trust Item 1: Official Samiti Info */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-maroon-100 text-maroon-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                अधिकृत समिति
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                {LEGAL_ENTITY_NAME} कपूरिपुर की वास्तविक व प्रामाणिक स्थानीय सामुदायिक संस्था है।
              </p>
            </div>

            {/* Trust Item 2: Contact Details */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                अधिकृत संपर्क सूत्र
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                किसी भी जानकारी अथवा प्रश्न हेतु आधिकारिक ईमेल {CONTACT_EMAIL} पर संपर्क करें।
              </p>
            </div>

            {/* Trust Item 3: Transparent Policies */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                पारदर्शी नीतियां
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                गोपनीयता नीति (Privacy Policy), नियम व शर्तें और दिशा-निर्देश सार्वजनिक रूप से उपलब्ध हैं।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-body pt-2 text-dark-700">
            <Link to="/privacy-policy" className="hover:text-maroon-800 underline">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-maroon-800 underline">Terms & Conditions</Link>
            <span>•</span>
            <Link to="/contribution-policy" className="hover:text-maroon-800 underline">Contribution Policy</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-maroon-800 underline">Disclaimer</Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MEMORIES FEED PREVIEW (Desktop View)                                    */}
      {/* ========================================================================= */}
      <section className="hidden md:block py-16 sm:py-20 bg-cream-50 border-t border-cream-300">
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
      {/* 7. COMMITTEE PREVIEW                                                      */}
      {/* ========================================================================= */}
      <CommitteePreview members={committee} isLoading={loadingCommittee} />
    </div>
  );
};
