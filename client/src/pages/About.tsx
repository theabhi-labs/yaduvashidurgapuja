import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import {
  Users,
  Mail,
} from 'lucide-react';
import { LEGAL_ENTITY_NAME } from '../utils/constants';

export const About: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[85vh] space-y-12 sm:space-y-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 rounded-3xl p-8 sm:p-14 border-2 border-gold-500/40 shadow-medium relative overflow-hidden text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold font-body border border-gold-400/40">
            <span>{LEGAL_ENTITY_NAME}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-cream-50 leading-tight">
            About Yaduvanshi Durga Puja Samiti
          </h1>

          <p className="text-base sm:text-lg font-medium text-gold-200 font-body">
            Celebrating Maa Durga with devotion, tradition, culture and community in Kapooripur.
          </p>

          <p className="text-xs sm:text-sm font-body text-cream-200/90 leading-relaxed max-w-2xl mx-auto pt-2">
            Yaduvanshi Durga Puja Samiti, Kapooripur is a community initiative that brings people together to celebrate Durga Puja and participate in cultural and community activities.
          </p>
        </div>
      </section>

      {/* 2. OUR PURPOSE & COMMUNITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Our Purpose */}
        <section className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-maroon-800 text-amber-400 flex items-center justify-center font-bold text-lg">
              🪔
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block font-body">
                Foundation & Mission
              </span>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-maroon-950">
                Our Purpose
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
            The primary purpose of {LEGAL_ENTITY_NAME} is to organize the annual Durga Puja celebration with traditional sanctity, foster religious harmony, and maintain a respectful digital memory archive for our community.
          </p>
          <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
            We are dedicated to preserving the cultural heritage, ritual traditions, idol artistry, and devotional spirit of Kapooripur for current and future generations.
          </p>
        </section>

        {/* Our Community */}
        <section className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-cream-50 flex items-center justify-center font-bold text-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block font-body">
                People & Harmony
              </span>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-maroon-950">
                Our Community
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
            Our initiative thrives on the active participation, dedication, and goodwill of the local residents of Kapooripur, neighboring villages in Bhadohi district, and family members living across India and abroad.
          </p>
          <p className="text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
            Every festival event is organized collaboratively through volunteer seva, bringing elders, youth, and families together in mutual respect and shared celebration.
          </p>
        </section>
      </div>

      {/* 3. DURGA PUJA CELEBRATION & COMMUNITY ACTIVITIES */}
      <section className="bg-cream-50 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-8">
        <SectionHeading
          badge="Festive Traditions"
          title="Durga Puja Celebration & Community Activities"
          subtitle="How we organize sacred rituals and community welfare programs during Navratri and Durga Puja."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-maroon-800 text-amber-400 flex items-center justify-center text-base">
              🌺
            </div>
            <h4 className="font-heading font-bold text-sm text-dark-950">
              Vedic Rituals & Maha Aarti
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Conducting authentic daily puja, Chandi Path, Kumari Puja, Sandhi Puja, and grand evening Maha Aarti with devotional traditional chanting.
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-cream-50 flex items-center justify-center text-base">
              🍲
            </div>
            <h4 className="font-heading font-bold text-sm text-dark-950">
              Mahaprasad & Bhandara
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Organizing pure, clean community prasad distribution and annual Bhandara feast open to all devotees and visitors without distinction.
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-cream-50 flex items-center justify-center text-base">
              🎭
            </div>
            <h4 className="font-heading font-bold text-sm text-dark-950">
              Cultural & Social Harmony
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Encouraging local youth talent through devotional music, stage performances, bhajan sandhya, and village community programs.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW WE WORK & CORE VALUES */}
      <section className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-maroon-900 text-gold-300 flex items-center justify-center font-bold text-lg">
            ⚖️
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block font-body">
              Governance & Transparency
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-950">
              How We Work & Core Values
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
          <p>
            {LEGAL_ENTITY_NAME} operates through a dedicated team of volunteer organizers. We adhere to simple, honest principles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-1.5">
              <h4 className="font-bold text-dark-950 text-xs sm:text-sm">🙏 Sacred Devotion</h4>
              <p className="text-[11px] text-muted">Maintaining highest ritual purity and respect for tradition.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-1.5">
              <h4 className="font-bold text-dark-950 text-xs sm:text-sm">🤝 Inclusivity</h4>
              <p className="text-[11px] text-muted">Welcoming every community member and devotee equally.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-1.5">
              <h4 className="font-bold text-dark-950 text-xs sm:text-sm">📜 Transparency</h4>
              <p className="text-[11px] text-muted">Clear accounting of voluntary contributions and event spending.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-1.5">
              <h4 className="font-bold text-dark-950 text-xs sm:text-sm">🛡️ Devotee Privacy</h4>
              <p className="text-[11px] text-muted">No commercial ads, no user data selling, and consent-based display.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTACT CTA */}
      <section className="bg-cream-100/80 p-6 sm:p-8 rounded-3xl border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm sm:text-base text-dark-950 font-body">
            Have questions about the Samiti or events?
          </h4>
          <p className="text-xs text-muted font-body">
            Get in touch with our organizers for inquiries, seva participation, or feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/contact">
            <Button variant="primary" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />}>
              Contact the Samiti
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
