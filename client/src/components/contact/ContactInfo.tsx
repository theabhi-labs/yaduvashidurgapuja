import React from 'react';
import { CONTACT_EMAIL, LOCATION_TEXT, SITE_DOMAIN } from '../../utils/constants';
import { Mail, MapPin, Globe, ShieldCheck, Sparkles } from 'lucide-react';

export const ContactInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-800 text-xs font-semibold font-devanagari-body mb-3 border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>समिति संपर्क सूत्र</span>
          </div>
          <h2 className="text-xl font-devanagari-heading font-bold text-maroon-950">
            यदुवंशी दुर्गा पूजा समिति, कपूरिपुर
          </h2>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1 leading-relaxed">
            दुर्गा पूजा स्मृति अभिलेखागार, पुरानी तस्वीरों के संकलन, सामग्री सुधार या अन्य किसी भी सुझाव हेतु आप हमसे संपर्क कर सकते हैं।
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-cream-300/80 text-xs sm:text-sm font-devanagari-body">
          {/* Email */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                आधिकारिक ईमेल (Email)
              </span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-dark-950 hover:text-maroon-700 transition-colors break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                स्थान (Location)
              </span>
              <span className="font-medium text-dark-950 block">
                {LOCATION_TEXT}
              </span>
            </div>
          </div>

          {/* Website Domain */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                वेबसाइट पोर्टल
              </span>
              <span className="font-mono text-xs font-semibold text-dark-900">
                {SITE_DOMAIN}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Card */}
      <div className="bg-cream-100/70 p-6 rounded-3xl border border-dashed border-cream-300 space-y-3 text-xs font-devanagari-body text-muted leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-dark-950">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>सामग्री रिपोर्ट एवं गोपनीयता सहायता</span>
        </div>
        <p>
          यदि आप किसी तस्वीर के संबंध में सुधार, नाम संशोधन, या गोपनीयता संबंधी अनुरोध करना चाहते हैं, तो कृपया संबंधित स्मृति का लिंक या विवरण अवश्य लिखें।
        </p>
      </div>
    </div>
  );
};
