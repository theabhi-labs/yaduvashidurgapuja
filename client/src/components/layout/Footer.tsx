import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Mail, Globe, Sparkles } from 'lucide-react';
import { SITE_DOMAIN, CONTACT_EMAIL, LOCATION_TEXT } from '../../utils/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-cream-100 border-t-4 border-gold-500 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sacred Top Banner */}
        <div className="flex items-center justify-center gap-2 pb-8 mb-8 border-b border-dark-700/60 text-gold-400 text-xs sm:text-sm font-devanagari-heading font-bold text-center">
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
          <span>🙏 जय माँ दुर्गा • यादों में बसी दुर्गा पूजा • कपूरिपुर धाम 🙏</span>
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-dark-700/80">
          {/* Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon-700 flex items-center justify-center text-gold-400 font-devanagari-heading font-bold text-xl border border-gold-500/40 shadow-sm">
                य
              </div>
              <div className="flex flex-col">
                <span className="font-devanagari-heading font-bold text-lg text-cream-50 leading-tight">
                  यदुवंशी दुर्गा पूजा
                </span>
                <span className="text-xs font-devanagari-body text-gold-400">
                  कपूरिपुर • डिजिटल स्मृति संचय
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-devanagari-body text-cream-300/80 leading-relaxed">
              "यादें, लोकप्रियता नहीं" — कपूरिपुर की पावन दुर्गा पूजा की स्मृतियों, परंपराओं और भक्तों के समर्पण का एक गरिमामयी डिजिटल अभिलेखागार।
            </p>

            <div className="flex items-center gap-2 text-xs text-gold-400/90 font-devanagari-body pt-1">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{LOCATION_TEXT}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-devanagari-body mb-4">
              मुख्य अनुभाग
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-devanagari-body">
              <li>
                <Link to="/" className="text-cream-300 hover:text-gold-300 transition-colors">
                  मुख्य पृष्ठ (Home)
                </Link>
              </li>
              <li>
                <Link to="/memories" className="text-cream-300 hover:text-gold-300 transition-colors">
                  स्मृति दीर्घा (Memories Archive)
                </Link>
              </li>
              <li>
                <Link to="/committee" className="text-cream-300 hover:text-gold-300 transition-colors">
                  पूजा समिति सदस्य (Committee)
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream-300 hover:text-gold-300 transition-colors">
                  परिचय एवं इतिहास (About Us)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream-300 hover:text-gold-300 transition-colors">
                  संपर्क सूत्र (Contact Us)
                </Link>
              </li>
              <li>
                <Link to="/share-memory" className="text-gold-400 hover:text-gold-300 font-medium transition-colors block pt-1">
                  अपनी याद साझा करें +
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Archival Philosophy */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-devanagari-body mb-4">
              नीतियां एवं नियम
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-devanagari-body">
              <li>
                <Link to="/privacy" className="text-cream-300 hover:text-gold-300 transition-colors">
                  गोपनीयता नीति (Privacy Policy)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-cream-300 hover:text-gold-300 transition-colors">
                  नियम एवं शर्तें (Terms & Conditions)
                </Link>
              </li>
              <li className="pt-2">
                <div className="space-y-2 text-cream-300/70 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>कोई लाइक्स या सामाजिक रेटिंग नहीं</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>निजी ईमेल एवं डेटा पूर्णतः सुरक्षित</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Official Domain & Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-devanagari-body mb-4">
              आधिकारिक पोर्टल
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
              <p className="text-[11px] font-devanagari-body text-cream-400/80 leading-relaxed pt-1">
                किसी भी प्रश्न, सुझाव या पुरानी तस्वीरों के संग्रह हेतु समिति से संपर्क करें।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-devanagari-body text-cream-400/70">
          <p>© {new Date().getFullYear()} यदुवंशी दुर्गा पूजा समिति, कपूरिपुर। सर्वाधिकार सुरक्षित।</p>
          <div className="flex items-center gap-1">
            <span>माँ जगदम्बा की कृपा से निर्मित</span>
            <Heart className="w-3.5 h-3.5 text-maroon-500 fill-maroon-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
