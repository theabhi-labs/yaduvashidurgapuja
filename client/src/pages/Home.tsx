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
  OFFICIAL_PHONE,
} from '../utils/constants';
import {
  Camera,
  Calendar,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Flame,
  Radio,
  Users,
  Sparkles,
  MapPin,
  Phone,
  FileText,
  Clock,
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
      {/* 1. HERO SECTION (Clean, Trustworthy & Premium Community Identity)          */}
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

          {/* Exact Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-cream-50 tracking-tight leading-tight mb-4 sm:mb-6"
          >
            Yaduvanshi Durga Puja Samiti, <span className="text-amber-400">Kapooripur</span>
          </motion.h1>

          {/* Exact Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg lg:text-xl font-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
          >
            Celebrating Maa Durga with devotion, tradition, culture and community.
          </motion.p>

          {/* Short Introduction Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="max-w-2xl mx-auto bg-maroon-900/60 p-4 rounded-2xl border border-amber-500/30 text-xs sm:text-sm text-cream-200 mb-8 sm:mb-10 leading-relaxed shadow-sm"
          >
            Yaduvanshi Durga Puja Samiti, Kapooripur is a community initiative that brings people together to celebrate Durga Puja and participate in cultural and community activities.
          </motion.div>

          {/* Hero CTAs: Primary = Support Durga Puja, Secondary = View Events, Live Darshan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            {/* Primary CTA: Support Durga Puja */}
            <Link to="/support">
              <Button
                variant="gold"
                size="md"
                leftIcon={<HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-dark-950" />}
                className="font-body text-xs sm:text-base font-bold shadow-gold-glow"
              >
                Support Durga Puja
              </Button>
            </Link>

            {/* Secondary CTA: View Events */}
            <Link to="/events">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-maroon-800" />}
                className="font-body text-xs sm:text-base font-bold bg-cream-100 hover:bg-cream-50 border-cream-300"
              >
                View Events & Schedule
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
                {isLiveActive ? '🔴 लाइव दर्शन (Live)' : 'Live Darshan'}
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
                <p className="text-[10px] sm:text-[11px] text-cream-300/70">भक्तिमय पलों का आर्काइव</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
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
      {/* 2. DAILY PUJA & MAHA AARTI TIMINGS                                         */}
      {/* ========================================================================= */}
      <AartiTimingsCard isLiveActive={isLiveActive} />

      {/* ========================================================================= */}
      {/* 3. ABOUT THE SAMITI SECTION                                               */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-body border border-maroon-200">
                <Sparkles className="w-3.5 h-3.5 text-maroon-800" />
                <span>About the Samiti</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-dark-950 leading-tight">
                Yaduvanshi Durga Puja Samiti, Kapooripur
              </h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto lg:mx-0" />
              <p className="text-sm sm:text-base font-body text-dark-800 leading-relaxed">
                Yaduvanshi Durga Puja Samiti, Kapooripur is a community initiative that brings people together to celebrate Durga Puja and participate in cultural and community activities.
              </p>
              <p className="text-xs sm:text-sm font-body text-dark-700 leading-relaxed">
                Organized at Kapooripur in Bhadohi district, the Samiti conducts traditional Sharadotsav Vedic rituals, daily Maha Aarti, community Bhandara, and cultural events, maintaining the heritage and unity of our village.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Read Full About Samiti
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="secondary" size="md">
                    View Puja Schedule
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border-2 border-amber-400/40 shadow-medium space-y-4">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-maroon-900">
                  Our Community Heritage
                </h3>
                <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
                  "Our festival brings together resident families, elders, youth, and devotees who travel back from across the nation to worship Maa Durga in our sacred village ground."
                </p>
                <div className="pt-3 border-t border-cream-300 space-y-2 text-xs text-dark-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-maroon-700 shrink-0" />
                    <span>{LOCATION_TEXT}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-maroon-700 shrink-0" />
                    <span>Voluntary Community Participation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. UPCOMING EVENTS & DURGA PUJA SCHEDULE PREVIEW                          */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-50 border-t border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 mb-2 sm:mb-3 tracking-wide uppercase">
                Durga Puja Schedule
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-maroon-900">
                Upcoming Events & Sacred Timeline
              </h2>
              <p className="text-xs sm:text-sm text-dark-700 mt-1">
                Event details and timings for the upcoming Sharadotsav celebration at Kapooripur Ground.
              </p>
            </div>
            <Link to="/events" className="self-start sm:self-auto">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Events & Schedule
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-2 hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>अश्विन कृष्ण पक्ष</span>
                <span className="px-2 py-0.5 rounded bg-amber-200/60">Mahalaya</span>
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                महालया (Tarpan & Aagomoni)
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                पितृ तर्पण एवं माँ भगवती दुर्गा के पावन आगमन का शुभ शंखनाद।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>प्रातः 05:00 बजे से</span>
              </div>
            </div>

            <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-2 hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>अश्विन शुक्ल षष्ठी</span>
                <span className="px-2 py-0.5 rounded bg-amber-200/60">Maha Shashthi</span>
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                महा षष्ठी (Bodhon & Kalparambha)
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                माँ दुर्गा की प्रतिमा का पावन अनावरण, बेलवरण एवं अधिवास अनुष्ठान।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>सायं 06:30 बजे</span>
              </div>
            </div>

            <div className="bg-cream-100 p-5 rounded-2xl border-2 border-gold-400/80 space-y-2 shadow-xs bg-gradient-to-br from-amber-50 to-cream-100">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>अश्विन शुक्ल अष्टमी</span>
                <span className="px-2 py-0.5 rounded bg-amber-300 text-maroon-950 font-bold">Maha Ashtami</span>
              </div>
              <h3 className="text-base font-heading font-bold text-maroon-950">
                महा अष्टमी एवं संधि पूजा
              </h3>
              <p className="text-xs text-dark-800 leading-relaxed">
                अष्टमी महापूजन, पुष्पांजलि, 108 दीप प्रज्वलन एवं पावन संधि महाआरती।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>प्रातः 08:00 बजे / संधि काल</span>
              </div>
            </div>

            <div className="bg-cream-100 p-5 rounded-2xl border-2 border-gold-400/80 space-y-2 shadow-xs bg-gradient-to-br from-amber-50 to-cream-100">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>अश्विन शुक्ल नवमी</span>
                <span className="px-2 py-0.5 rounded bg-amber-300 text-maroon-950 font-bold">Maha Navami</span>
              </div>
              <h3 className="text-base font-heading font-bold text-maroon-950">
                महा नवमी हवन एवं महाप्रसाद (भंडारा)
              </h3>
              <p className="text-xs text-dark-800 leading-relaxed">
                अखंड चंडी महायज्ञ, पूर्णाहूति, कुमारी पूजन एवं सर्व-भक्त महाप्रसाद वितरण।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>प्रातः 09:00 बजे हवन / दोपहर 01:00 बजे भंडारा</span>
              </div>
            </div>

            <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-2 hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>अश्विन शुक्ल दशमी</span>
                <span className="px-2 py-0.5 rounded bg-amber-200/60">Vijaya Dashami</span>
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                विजयादशमी एवं विसर्जन यात्रा
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                अपराजिता पूजन, पारंपरिक सिंदूर खेला एवं विसर्जन यात्रा।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>दोपहर 02:00 बजे से विसर्जन</span>
              </div>
            </div>

            <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-2 hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>सप्तमी से नवमी</span>
                <span className="px-2 py-0.5 rounded bg-amber-200/60">Cultural Events</span>
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                सांस्कृतिक संध्या एवं भजन कीर्तन
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                स्थानीय कलाकारों एवं युवाओं द्वारा देवी जागरण व सांस्कृतिक प्रस्तुतियाँ।
              </p>
              <div className="text-[11px] text-muted pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-maroon-700" />
                <span>रात्रि 08:30 बजे</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COMMUNITY ACTIVITIES SECTION                                           */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-8">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 border border-maroon-200 uppercase">
              Community Activities
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-dark-950">
              Community Programs & Initiatives
            </h2>
            <p className="text-xs sm:text-sm text-dark-700">
              The Samiti coordinates multiple devotional, cultural, and community welfare initiatives during and around the Durga Puja season.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="bg-cream-100 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                🪔
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                Vedic Rituals & Aarti
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Traditional Chandi Path, daily morning and evening Maha Aarti, and holy Sankalpa conducted by learned priests.
              </p>
            </div>

            <div className="bg-cream-100 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center font-bold">
                🍲
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                Mahaprasad & Bhandara
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Distribution of sanctified Bhog and free community Bhandara serving hundreds of villagers and visiting devotees.
              </p>
            </div>

            <div className="bg-cream-100 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                🎭
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                Cultural Programs
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Devotional music, folk performances, drama, and youth talent programs promoting local arts and traditions.
              </p>
            </div>

            <div className="bg-cream-100 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                📸
              </div>
              <h3 className="text-base font-heading font-bold text-dark-950">
                Digital Memory Archive
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                A dignified portal preserving photographs, videos, and historical memories of Kapooripur Durga Puja across the years.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SUPPORT DURGA PUJA (Voluntary Contribution Section)                    */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 border-y-4 border-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold font-body border border-amber-400/40">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Voluntary Community Seva</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-cream-50">
            Support Durga Puja
          </h2>

          <p className="text-sm sm:text-base font-body text-cream-200 max-w-2xl mx-auto leading-relaxed">
            Community members and well-wishers may voluntarily contribute towards the organization of Durga Puja and related community activities.
          </p>

          <p className="text-xs text-amber-200/80 max-w-xl mx-auto leading-relaxed">
            Contributions directly support ritual arrangements, pandal setup, prasad distribution, and cultural programs organized by the Samiti.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link to="/support">
              <Button
                variant="gold"
                size="md"
                leftIcon={<HeartHandshake className="w-4 h-4 text-dark-950" />}
                className="font-bold shadow-gold-glow"
              >
                Make a Contribution
              </Button>
            </Link>

            <Link to="/contribution-policy">
              <Button
                variant="outline"
                size="md"
                leftIcon={<FileText className="w-4 h-4 text-amber-400" />}
                className="text-cream-100 border-amber-400/50 hover:bg-maroon-800/80"
              >
                View Contribution Policy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRANSPARENCY & TRUST SECTION                                           */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-cream-100 border-b border-cream-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
              Trust & Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-950">
              Our Commitment to Transparency
            </h2>
            <p className="text-xs sm:text-sm text-dark-700">
              Clear organization details, verified contact channels, and transparent policies for all community members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Trust Item 1: Official Samiti Info */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-maroon-100 text-maroon-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                Official Samiti Info
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                {LEGAL_ENTITY_NAME} represents the genuine local community organization of Kapooripur.
              </p>
            </div>

            {/* Trust Item 2: Clear Contact Details */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                Clear Contact Details
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Reach us directly at {OFFICIAL_PHONE} or via email at {CONTACT_EMAIL}.
              </p>
            </div>

            {/* Trust Item 3: Contribution Purpose */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                Contribution Purpose
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Voluntary contributions strictly fund puja rituals, prasad, pandal, and festival operations.
              </p>
            </div>

            {/* Trust Item 4: Transparent Policies */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-heading font-bold text-dark-950">
                Transparent Policies
              </h3>
              <p className="text-xs text-dark-700 leading-relaxed">
                Publicly published Privacy Policy, Terms & Conditions, Contribution Policy, and Disclaimer.
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
      {/* 8. MEMORIES FEED PREVIEW (Desktop View)                                    */}
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
      {/* 9. COMMITTEE PREVIEW                                                      */}
      {/* ========================================================================= */}
      <CommitteePreview members={committee} isLoading={loadingCommittee} />
    </div>
  );
};
