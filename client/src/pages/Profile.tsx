import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import {
  Mail,
  ShieldCheck,
  Calendar,
  Bookmark,
  Camera,
  ShieldAlert,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="भक्त विवरण"
        title="आपकी प्रोफाइल"
        subtitle="यदुवंशी दुर्गा पूजा कपूरिपुर में आपका व्यक्तिगत खाता।"
      />

      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-10 space-y-8">
        {/* Avatar and Main Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-cream-300/80 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-maroon-700 text-gold-300 flex items-center justify-center font-bold text-3xl border-4 border-gold-400/40 shadow-inner overflow-hidden shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-devanagari-heading font-bold text-dark-950">
              {user.name}
            </h2>
            <p className="text-sm font-devanagari-body text-muted flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-gold-600" />
              <span>{user.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                सत्यापित भक्त
              </span>

              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-maroon-100 text-maroon-800 border border-maroon-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-maroon-700" />
                  व्यवस्थापक (Admin)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-devanagari-body">
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300">
            <span className="text-xs text-muted block mb-1">सदस्यता प्रारंभ</span>
            <div className="flex items-center gap-2 font-semibold text-dark-900">
              <Calendar className="w-4 h-4 text-gold-600" />
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300">
            <span className="text-xs text-muted block mb-1">खाता भूमिका</span>
            <div className="font-semibold text-dark-900">
              {user.role === 'ADMIN' ? 'समिति व्यवस्थापक' : 'समुदाय सदस्य (भक्त)'}
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Link to="/my-memories" className="flex-1">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Bookmark className="w-4 h-4 text-maroon-700" />}
              className="w-full font-devanagari-body"
            >
              मेरी साझा की गई यादें देखें
            </Button>
          </Link>

          <Link to="/share-memory" className="flex-1">
            <Button
              variant="gold"
              size="md"
              leftIcon={<Camera className="w-4 h-4 text-dark-950" />}
              className="w-full font-devanagari-body font-bold"
            >
              नई याद साझा करें +
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
