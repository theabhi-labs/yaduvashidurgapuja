import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { MemoryGrid } from '../components/memory/MemoryGrid';
import { CommitteePreview } from '../components/committee/CommitteePreview';
import { Memory, CommitteeMember } from '../types';
import { memoryService } from '../services/memoryService';
import { committeeService } from '../services/committeeService';
import {
  Camera,
  BookOpen,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Flame,
  Sparkles,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingCommittee, setLoadingCommittee] = useState(true);

  useEffect(() => {
    // Fetch latest memories
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
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 border-b-4 border-gold-500">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 bg-maroon-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Sacred Trishul & Diya motif */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-300 text-xs sm:text-sm font-devanagari-body font-semibold mb-6 tracking-wide"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
          </motion.div>

          {/* Hindi Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-devanagari-heading font-black text-cream-50 tracking-tight leading-tight mb-6"
          >
            यादों में बसी <span className="text-gold-400">दुर्गा पूजा</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-xl lg:text-2xl font-devanagari-body text-cream-200/90 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            कपूरिपुर की दुर्गा पूजा की यादों का अपना डिजिटल घर।
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link to="/share-memory" className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="lg"
                leftIcon={<Camera className="w-5 h-5 text-dark-950" />}
                className="w-full font-devanagari-body text-base shadow-gold-glow"
              >
                अपनी याद साझा करें
              </Button>
            </Link>

            <Link to="/memories" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<BookOpen className="w-5 h-5 text-maroon-800" />}
                className="w-full font-devanagari-body text-base bg-cream-100 hover:bg-cream-50 border-cream-300"
              >
                यादें देखें
              </Button>
            </Link>
          </motion.div>

          {/* Hero Sacred Imagery Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden border-2 border-gold-500/50 shadow-2xl p-2 bg-gradient-to-b from-gold-500/30 via-maroon-900/50 to-maroon-950"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-dark-950">
              <img
                src="/hero-durga.jpg"
                alt="यदुवंशी दुर्गा पूजा कपूरिपुर"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent flex items-end p-4 sm:p-8">
                <div className="text-left">
                  <span className="text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-gold-500/90 text-dark-950 font-devanagari-body uppercase tracking-wider inline-block mb-2">
                    कपूरिपुर पावन धाम
                  </span>
                  <p className="text-sm sm:text-lg font-devanagari-heading font-bold text-cream-50 leading-snug max-w-xl drop-shadow-md">
                    माँ जगदम्बा की पावन ज्योति और भक्तों की अखंड आस्था का जीवंत संचय।
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Value Pillars Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-maroon-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Flame className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                  पवित्र परंपरा
                </h4>
                <p className="text-[11px] text-cream-300/70">दशकों की आस्था</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <ShieldCheck className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                  शुद्ध संचय
                </h4>
                <p className="text-[11px] text-cream-300/70">कोई सोशल दिखावा नहीं</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <Camera className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                  भक्तों की तस्वीरें
                </h4>
                <p className="text-[11px] text-cream-300/70">मूल गुणवत्ता में सुरक्षित</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-maroon-900/50 border border-maroon-800/50">
              <HeartHandshake className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-cream-100 font-devanagari-body">
                  ग्राम परिवार
                </h4>
                <p className="text-[11px] text-cream-300/70">कपूरिपुर का गौरव</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PUJA INTRODUCTION SECTION */}
      <section className="py-16 sm:py-24 bg-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-100 text-maroon-900 text-xs font-semibold font-devanagari-body border border-maroon-200">
                <span>॥ आस्था एवं सौहार्द ॥</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-devanagari-heading font-bold text-dark-950 leading-tight">
                कपूरिपुर की पावन भूमि पर माँ दुर्गा का अलौकिक उत्सव
              </h2>
              <div className="w-16 h-1 bg-gold-500 rounded-full" />
              <p className="text-sm sm:text-base font-devanagari-body text-dark-800 leading-relaxed">
                यदुवंशी दुर्गा पूजा, कपूरिपुर केवल एक वार्षिक धार्मिक अनुष्ठान नहीं, अपितु समूचे ग्रामवासियों के अपनत्व, संस्कृति और असीम भक्ति का जीवंत संगम है।
              </p>
              <p className="text-sm sm:text-base font-devanagari-body text-muted leading-relaxed">
                दशकों से हर वर्ष शरद ऋतु में यहाँ माँ जगदम्बा की भव्य प्रतिमा स्थापित होती है। ढाक की थाप, सिंदूर खेला की भावुकता, महाआरती के प्रज्वलित दीप और महाप्रसाद का आनंद—इन सभी अनमोल पलों को संजोने के लिए यह डिजिटल स्मृति स्थल तैयार किया गया है।
              </p>
              <div className="pt-2">
                <Link to="/about">
                  <Button
                    variant="outline"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    विस्तृत इतिहास एवं नियम पढ़ें
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Card / Quote */}
            <div className="lg:col-span-5">
              <div className="bg-cream-100 p-8 rounded-3xl border-2 border-gold-400/40 shadow-medium relative">
                <div className="absolute top-4 right-4 text-gold-500 opacity-20 text-6xl font-serif">
                  "
                </div>
                <h3 className="text-xl font-devanagari-heading font-bold text-maroon-900 mb-3">
                  स्मृति संचय का संकल्प
                </h3>
                <p className="text-xs sm:text-sm font-devanagari-body text-dark-800 leading-relaxed mb-6">
                  "यह मंच लोकप्रियता, लाइक्स या टिप्पणियों की होड़ से पूरी तरह मुक्त है। हमारा एकमात्र उद्देश्य है कि कपूरिपुर की दुर्गा पूजा की प्रत्येक पावन तस्वीर और संस्मरण हमेशा के लिए सुरक्षित रहे।"
                </p>
                <div className="pt-4 border-t border-cream-300 flex items-center justify-between text-xs font-devanagari-body">
                  <span className="text-maroon-800 font-semibold">— पूजा समिति, कपूरिपुर</span>
                  <span className="text-gold-700 font-medium">yaduvashidurgapujakapooripur.online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEMORIES FEED PREVIEW */}
      <section className="py-16 sm:py-24 bg-cream-50 border-t border-cream-300/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300/60 mb-3 tracking-wide uppercase">
                स्मृति दीर्घा
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-devanagari-heading font-bold text-maroon-900">
                भक्तों की नवीनतम स्मृतियाँ
              </h2>
            </div>
            <Link to="/memories" className="mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
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

      {/* 5. SHARE MEMORY CTA BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-cream-50 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-maroon-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400 mx-auto shadow-inner">
            <Camera className="w-8 h-8 text-gold-300" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-devanagari-heading font-black text-cream-50 leading-tight">
            क्या आपके पास कपूरिपुर दुर्गा पूजा की पुरानी यादें हैं?
          </h2>

          <p className="text-sm sm:text-base font-devanagari-body text-cream-200/90 max-w-xl mx-auto leading-relaxed">
            चाहे वह आरती का पावन क्षण हो, पंडाल निर्माण की मेहनत, या परिवार संग पूजा प्रांगण की तस्वीर—अपनी यादों को इस डिजिटल धरोहर में सदा के लिए संजोएं।
          </p>

          <div className="pt-2 flex justify-center">
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
          </div>
        </div>
      </section>
    </div>
  );
};
