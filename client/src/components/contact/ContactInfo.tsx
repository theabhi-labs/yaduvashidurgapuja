import React from 'react';
import { CONTACT_EMAIL, LOCATION_TEXT, SITE_DOMAIN, LEGAL_ENTITY_NAME } from '../../utils/constants';
import { Mail, MapPin, Globe, ShieldCheck, Sparkles, Clock } from 'lucide-react';

export const ContactInfo: React.FC = () => {
  return (
    <div className="space-y-6 font-body">
      <div className="bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-800 text-xs font-semibold mb-3 border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Official Samiti Information</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-maroon-950">
            {LEGAL_ENTITY_NAME}
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
            For questions regarding Durga Puja, community activities, or website information, please contact the Samiti.
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-cream-300/80 text-xs sm:text-sm">
          {/* Address */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Official Address
              </span>
              <span className="font-medium text-dark-950 block leading-relaxed">
                {LOCATION_TEXT}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Official Email
              </span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-dark-950 hover:text-maroon-700 transition-colors break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {/* Website Domain */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Official Web Portal
              </span>
              <span className="font-mono text-xs font-semibold text-dark-900">
                {SITE_DOMAIN}
              </span>
            </div>
          </div>
        </div>

        {/* Response Expectation Notice */}
        <div className="pt-2 border-t border-cream-200 flex items-center gap-2 text-xs text-muted">
          <Clock className="w-4 h-4 text-maroon-700 shrink-0" />
          <span>We will respond as soon as possible.</span>
        </div>
      </div>

      {/* Guidelines Card */}
      <div className="bg-cream-100/70 p-6 rounded-3xl border border-dashed border-cream-300 space-y-2.5 text-xs text-muted leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-dark-950">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Community Assistance & Privacy Requests</span>
        </div>
        <p>
          For contribution inquiries, photo modification requests, or questions regarding our festival activities, please reach out to the Samiti with relevant details for prompt assistance.
        </p>
      </div>
    </div>
  );
};
