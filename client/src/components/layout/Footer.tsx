import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Mail, Globe, Sparkles } from 'lucide-react';
import { SITE_DOMAIN, CONTACT_EMAIL, LOCATION_TEXT } from '../../utils/constants';

import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-cream-100 border-t-4 border-gold-500 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sacred Top Banner */}
        <div className="flex items-center justify-center gap-2 pb-8 mb-8 border-b border-dark-700/60 text-gold-400 text-xs sm:text-sm font-heading font-bold text-center">
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
          <span>Jai Maa Durga • Preserving Sacred Memories • Kapooripur Dham</span>
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-dark-700/80">
          {/* Brand & Philosophy */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="light" />

            <p className="text-xs sm:text-sm font-body text-cream-300/80 leading-relaxed">
              "Memories, Not Popularity" — A dignified digital archive preserving sacred memories, traditions, and devotional moments of Kapooripur Durga Puja.
            </p>

            <div className="flex items-center gap-2 text-xs text-gold-400/90 font-body pt-1">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{LOCATION_TEXT}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-body mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-body">
              <li>
                <Link to="/" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/memories" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Memories Archive
                </Link>
              </li>
              <li>
                <Link to="/committee" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Committee Members
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream-300 hover:text-gold-300 transition-colors">
                  About & History
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/contributors" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                  Contributors (सहयोगी)
                </Link>
              </li>

              <li>
                <Link to="/share-memory" className="text-gold-400 hover:text-gold-300 font-medium transition-colors block pt-1">
                  Share a Memory +
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Archival Philosophy */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-body mb-4">
              Policies & Terms
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-body">
              <li>
                <Link to="/privacy" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li className="pt-2">
                <div className="space-y-2 text-cream-300/70 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>No public vanity metrics</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Private & secure devotee data</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Official Domain & Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-body mb-4">
              Official Portal
            </h4>
            <div className="bg-dark-800/80 p-4 rounded-2xl border border-dark-700 space-y-3">
              <div className="flex items-center gap-2 text-xs text-cream-200">
                <Globe className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="font-mono text-[11px] truncate">{SITE_DOMAIN}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cream-200">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[11px] text-cream-300 hover:text-gold-300 transition-colors truncate"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <p className="text-[11px] font-body text-cream-400/80 leading-relaxed pt-1">
                For questions, archival photos, or seva inquiries, please reach out to the committee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-cream-400/70">
          <p>© {new Date().getFullYear()} Yaduvanshi Durga Puja Committee, Kapooripur. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with Devotion</span>
            <Heart className="w-3.5 h-3.5 text-maroon-500 fill-maroon-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
