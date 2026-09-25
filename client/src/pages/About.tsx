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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold font-body border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Shree Yaduvanshi Durga Puja Kapooripur</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-cream-50 leading-tight">
            Memories of <span className="text-gold-400">Durga Puja</span>
          </h1>

          <p className="text-base sm:text-lg font-medium text-gold-200 font-body">
            A sacred digital archive preserving festive memories of Yaduvanshi Durga Puja, Kapooripur.
          </p>

          <p className="text-xs sm:text-sm font-body text-cream-200/90 leading-relaxed max-w-2xl mx-auto pt-2">
            A dignified digital heritage commemorating traditions, divine moments, live arti, and the heartfelt devotion of the Kapooripur community.
          </p>
        </div>
      </section>

      {/* 2. OUR PURPOSE & CORE PHILOSOPHY */}
      <section className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-lg">
            ✦
          </div>
          <div>
            <span className="text-xs font-bold text-gold-800 uppercase tracking-wider block font-body">
              Our Purpose & Core Philosophy
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-950">
              "Memories, Not Popularity"
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-body text-dark-800 leading-relaxed">
          <p>
            The primary purpose of this digital platform is to preserve the rich heritage, grand pandals, Maha Arti ceremonies, cultural events, and cherished photographs submitted by devotees of Yaduvanshi Durga Puja Kapooripur.
          </p>
          <p>
            This is not a conventional social media network. There is no vanity competition or social ranking. To ensure purity and peace of mind, the following features are <strong>completely absent</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">No Likes or Reactions</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">No Comment Sections</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">No Followers or Following</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">No Public View Counts</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-maroon-700 shrink-0" />
              <span className="font-semibold text-dark-900">No Trending Algorithms</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-dark-900">Pure Devotion & Heritage</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW TO SHARE A MEMORY */}
      <section className="bg-cream-50 rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-soft space-y-6">
        <SectionHeading
          badge="Simple Workflow"
          title="How to Share Your Sacred Memory"
          subtitle="You can contribute your photographs and experiences related to Kapooripur Durga Puja in a few simple steps:"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-body">
              Create Account & Log In
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Sign up securely with your name and email so your contributions are properly attributed.
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-body">
              Select Photograph
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Upload clear photos of the puja pandal, arti, idol sculptures, or family celebrations.
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-body">
              Add Year & Caption
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Choose the festival year and write a short description or remembrance (up to 600 characters).
            </p>
          </div>

          <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
              4
            </div>
            <h4 className="font-bold text-sm text-dark-950 font-body">
              Archived Permanently
            </h4>
            <p className="text-xs text-muted font-body leading-relaxed">
              Photos are automatically optimized (WebP) and stored safely in our digital public gallery.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link to="/share-memory">
            <Button
              variant="gold"
              size="md"
              leftIcon={<Camera className="w-4 h-4 text-dark-950" />}
              className="font-body font-bold"
            >
              Share Your Memory Now
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. COMMUNITY & MODERATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Community */}
        <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-3">
          <div className="flex items-center gap-2 text-maroon-800 font-bold text-sm font-body">
            <Users className="w-5 h-5 text-gold-600" />
            <span>Community Harmony & Participation</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-dark-950">
            A Shared Heritage of Kapooripur
          </h3>
          <p className="text-xs sm:text-sm font-body text-muted leading-relaxed">
            This digital archive thrives through the contributions of Kapooripur residents, the diaspora, volunteers, and devotees of Maa Durga worldwide. Every shared memory is a vital chapter in our collective history.
          </p>
        </div>

        {/* Content Moderation */}
        <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 space-y-3">
          <div className="flex items-center gap-2 text-maroon-800 font-bold text-sm font-body">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Dignity & Moderation Standards</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-dark-950">
            A Respectful & Sacred Atmosphere
          </h3>
          <p className="text-xs sm:text-sm font-body text-muted leading-relaxed">
            To preserve sanctity and decorum, all uploaded memories and comments are subject to community guidelines. Inappropriate or irrelevant content will be removed promptly by the committee administration.
          </p>
        </div>
      </div>

      {/* 5. LEGAL & CONTACT QUICK LINKS */}
      <section className="bg-cream-100/70 p-6 sm:p-8 rounded-3xl border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm text-dark-950 font-body">
            Policies, Terms & Inquiries
          </h4>
          <p className="text-xs text-muted font-body">
            Learn more about our data protection policies and terms of service.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/privacy">
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              Privacy Policy
            </Button>
          </Link>
          <Link to="/terms">
            <Button variant="outline" size="sm" leftIcon={<Lock className="w-3.5 h-3.5" />}>
              Terms & Conditions
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="primary" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />}>
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
