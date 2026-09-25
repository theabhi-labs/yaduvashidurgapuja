import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Camera,
  Users,
  EyeOff,
  Lock,
  FileText,
  Mail,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[85vh] space-y-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 rounded-3xl p-8 sm:p-14 border-2 border-gold-500/40 shadow-medium relative overflow-hidden text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold font-devanagari-body border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-devanagari-heading font-black text-cream-50 leading-tight">
            यादों में बसी <span className="text-gold-400">दुर्गा पूजा</span>
          </h1>

          <p className="text-base sm:text-lg font-medium text-gold-200 font-devanagari-body">
            यदुवंशी दुर्गा पूजा, कपूरिपुर की स्मृतियों का पावन संचय।
          </p>

          <p className="text-xs sm:text-sm font-devanagari-body text-cream-200/90 leading-relaxed max-w-2xl mx-auto pt-2">
            कपूरिपुर की पावन दुर्गा पूजा की स्मृतियों, परंपराओं, भक्तिमय पलों और श्रद्धालुओं के समर्पण का एक गरिमामयी डिजिटल अभिलेखागार।
          </p>
        </div>
      </section>

      {/* 2. OUR PURPOSE & CORE PHILOSOPHY */}
      <section className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-lg">
            ॥
          </div>
          <div>
            <span className="text-xs font-bold text-gold-800 uppercase tracking-wider block font-devanagari-body">
              हमारा उद्देश्य एवं दर्शन
            </span>
            <h2 className="text-xl sm:text-2xl font-devanagari-heading font-bold text-maroon-950">
              "यादें, लोकप्रियता नहीं" (Memory, not popularity)
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-devanagari-body text-dark-800 leading-relaxed">
          <p>
            इस डिजिटल मंच का प्राथमिक उद्देश्य यदुवंशी दुर्गा पूजा, कपूरिपुर के पावन इतिहास, भव्य पंडालों, महाआरती, सांस्कृतिक आयोजनों और भक्तों की अनमोल तस्वीरों को सुरक्षित व सुव्यवस्थित रखना है।
          </p>
          <p>
            यह कोई सोशल मीडिया मंच नहीं है। यहाँ किसी प्रकार की प्रतिस्पर्धा या सामाजिक रैंकिंग नहीं होती। इसी कारण इस पोर्टल पर निम्नलिखित सुविधाएं <strong>पूर्णतः अनुपस्थित</strong> हैं:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">कोई लाइक्स या रिएक्शन्स नहीं</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">कोई कमेंट या रेटिंग नहीं</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">कोई फॉलोअर या फॉलोइंग नहीं</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">कोई पब्लिक व्यू काउंटर्स नहीं</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">कोई ट्रेंडिंग एल्गोरिदम नहीं</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-dark-900">केवल शुद्ध श्रद्धा व स्मृति संचय</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW TO SHARE A MEMORY */}
      <section className="bg-cream-50 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-6">
        <SectionHeading
          badge="सरल प्रक्रिया"
          title="अपनी पावन याद कैसे साझा करें?"
          subtitle="कपूरिपुर दुर्गा पूजा से जुड़ी तस्वीरें आप निम्नलिखित चरणों द्वारा अभिलेखागार में जोड़ सकते हैं:"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              १
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-devanagari-body">
              खाता बनाएं व लॉगिन करें
            </h4>
            <p className="text-xs text-muted font-devanagari-body leading-relaxed">
              अपने नाम व ईमेल से सुरक्षित खाता बनाएं ताकि आपकी याद के साथ आपका नाम प्रदर्शित हो सके।
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              २
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-devanagari-body">
              तस्वीर चुनें
            </h4>
            <p className="text-xs text-muted font-devanagari-body leading-relaxed">
              पूजा पंडाल, आरती, मूर्तिकला अथवा परिवार संग पूजा प्रांगण की साफ तस्वीर अपलोड करें।
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              ३
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-devanagari-body">
              वर्ष व संस्मरण लिखें
            </h4>
            <p className="text-xs text-muted font-devanagari-body leading-relaxed">
              संबंधित पूजा वर्ष चुनें और उस क्षण की भावना अथवा विवरण 600 अक्षरों में दर्ज करें।
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              ४
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-devanagari-body">
              सुरक्षित संचय
            </h4>
            <p className="text-xs text-muted font-devanagari-body leading-relaxed">
              तस्वीर स्वतः अनुकूलित (WebP) होकर स्थायी रूप से सार्वजनिक स्मृति दीर्घा में संरक्षित हो जाती है।
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link to="/share-memory">
            <Button
              variant="gold"
              size="md"
              leftIcon={<Camera className="w-4 h-4 text-dark-950" />}
              className="font-devanagari-body font-bold"
            >
              अपनी याद अभी साझा करें
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. COMMUNITY & MODERATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Community */}
        <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-3">
          <div className="flex items-center gap-2 text-maroon-800 font-bold text-sm font-devanagari-body">
            <Users className="w-5 h-5 text-gold-600" />
            <span>सामुदायिक सौहार्द एवं सहभागिता</span>
          </div>
          <h3 className="text-lg font-devanagari-heading font-bold text-dark-950">
            कपूरिपुर समुदाय की संयुक्त धरोहर
          </h3>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted leading-relaxed">
            यह डिजिटल अभिलेखागार कपूरिपुर गांव के सभी निवासियों, प्रवासियों, सेवादारों और माँ दुर्गा के श्रद्धालुओं के सहयोग से समृद्ध होता है। प्रत्येक व्यक्ति की याद इस उत्सव के इतिहास की एक अनमोल कड़ी है।
          </p>
        </div>

        {/* Content Moderation */}
        <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-3">
          <div className="flex items-center gap-2 text-maroon-800 font-bold text-sm font-devanagari-body">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>सामग्री गरिमा एवं नियमन</span>
          </div>
          <h3 className="text-lg font-devanagari-heading font-bold text-dark-950">
            संयमित एवं पवित्र वातावरण
          </h3>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted leading-relaxed">
            अभिलेखागार की पवित्रता बनाए रखने हेतु सभी अपलोड की गई सामग्री नियमों के अधीन है। किसी भी अनुचित अथवा आपत्तिजनक सामग्री को समिति द्वारा तुरंत हटाया अथवा छिपाया जा सकता है।
          </p>
        </div>
      </div>

      {/* 5. LEGAL & CONTACT QUICK LINKS */}
      <section className="bg-cream-100/70 p-6 sm:p-8 rounded-3xl border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm text-dark-950 font-devanagari-body">
            नियम, शर्तें एवं गोपनीयता की जानकारी
          </h4>
          <p className="text-xs text-muted font-devanagari-body">
            हमारी नीतियों एवं संपर्क विवरण की अधिक जानकारी हेतु नीचे दिए गए लिंक देखें।
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/privacy">
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              गोपनीयता नीति (Privacy)
            </Button>
          </Link>
          <Link to="/terms">
            <Button variant="outline" size="sm" leftIcon={<Lock className="w-3.5 h-3.5" />}>
              नियम एवं शर्तें (Terms)
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="primary" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />}>
              संपर्क करें (Contact)
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
