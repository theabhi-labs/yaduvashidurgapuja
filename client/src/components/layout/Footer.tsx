import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Mail, Phone, Globe, Sparkles, ShieldCheck } from 'lucide-react';
import {
  LEGAL_ENTITY_NAME,
  SITE_DOMAIN,
  CONTACT_EMAIL,
  OFFICIAL_PHONE,
  LOCATION_TEXT,
  CURRENT_YEAR,
} from '../../utils/constants';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 text-cream-100 border-t-4 border-gold-500 pt-14 pb-8 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sacred Top Banner */}
        <div className="flex items-center justify-center gap-2 pb-8 mb-8 border-b border-dark-800 text-gold-400 text-xs sm:text-sm font-heading font-bold text-center">
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
          <span>॥ श्री यदुवंशी दुर्गा पूजा समिति कपूरिपुर ॥</span>
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-dark-800">
          {/* Column 1: Organization Identity */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="light" />
            <h3 className="text-sm font-heading font-bold text-gold-300">
              {LEGAL_ENTITY_NAME}
            </h3>
            <p className="text-xs sm:text-sm text-cream-300/80 leading-relaxed">
              Community-led Durga Puja celebration, devotional rituals, and cultural activities bringing devotees together in harmony.
            </p>
            <p className="text-xs text-gold-400/90 font-medium">
              Kapooripur, Bhadohi, Uttar Pradesh
            </p>
          </div>

          {/* Column 2: Explore Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 font-heading mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream-300 hover:text-gold-300 transition-colors">
                  About the Samiti
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Events & Schedule
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  Support Durga Puja
                </Link>
              </li>
              <li>
                <Link to="/memories" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Memories Archive
                </Link>
              </li>
              <li>
                <Link to="/committee" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Samiti Committee
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Policy Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 font-heading mb-4">
              Legal & Policies
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/privacy-policy" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contribution-policy" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Contribution Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-cream-300 hover:text-gold-300 transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li className="pt-2">
                <div className="bg-dark-900/90 p-3 rounded-xl border border-dark-800 space-y-1.5 text-[11px] text-cream-300/70">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Transparent Community Trust</span>
                  </div>
                  <p>Voluntary contributions support ritual, prasad & pandal arrangements.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Verified Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 font-heading mb-4">
              Official Contact
            </h4>
            <div className="bg-dark-900/90 p-4 rounded-2xl border border-dark-800 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-cream-200">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-cream-300">
                  {LOCATION_TEXT}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-cream-200">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`tel:${OFFICIAL_PHONE.replace(/\s+/g, '')}`}
                  className="text-[11px] text-cream-300 hover:text-gold-300 transition-colors"
                >
                  {OFFICIAL_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-cream-200">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[11px] text-cream-300 hover:text-gold-300 transition-colors truncate"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-cream-200 pt-1 border-t border-dark-800">
                <Globe className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="font-mono text-[11px] text-cream-400">{SITE_DOMAIN}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-400/70">
          <p>© {CURRENT_YEAR} {LEGAL_ENTITY_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Organized with Devotion & Community Spirit</span>
            <Heart className="w-3.5 h-3.5 text-maroon-500 fill-maroon-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
