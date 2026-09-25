import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Flame, Sparkles, Radio, ChevronRight, Bell } from 'lucide-react';
import { PujaSchedule } from '../../types';
import { pujaScheduleService } from '../../services/pujaScheduleService';

const FALLBACK_SCHEDULES: PujaSchedule[] = [
  {
    _id: '1',
    title: 'प्रातः मंगला आरती',
    time: '06:30 AM',
    description: 'माँ भगवती का पावन अभिषेक एवं मंगला स्तुति',
    isSpecial: false,
    order: 1,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: '2',
    title: 'मध्याह्न भोग व आरती',
    time: '12:00 PM',
    description: 'माँ को नैवेद्य अर्पण एवं मध्याह्न पावन आरती',
    isSpecial: false,
    order: 2,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: '3',
    title: 'संध्या दिव्य महाआरती',
    time: '07:30 PM',
    description: 'कपूरिपुर प्रांगण में भव्य 108 दीप महाआरती व शंखनाद',
    isSpecial: true,
    order: 3,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: '4',
    title: 'शयन आरती व वंदना',
    time: '10:00 PM',
    description: 'रात्रि विश्राम पूर्व माँ की पावन क्षमा प्रार्थना व आरती',
    isSpecial: false,
    order: 4,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
];

interface AartiTimingsCardProps {
  isLiveActive?: boolean;
}

export const AartiTimingsCard: React.FC<AartiTimingsCardProps> = ({ isLiveActive = false }) => {
  const [schedules, setSchedules] = useState<PujaSchedule[]>(FALLBACK_SCHEDULES);

  useEffect(() => {
    let isMounted = true;
    const fetchSchedules = async () => {
      try {
        const res = await pujaScheduleService.getSchedules();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSchedules(res.data);
        }
      } catch {
        // Quiet fallback
      }
    };
    fetchSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-100 border-y border-amber-300/40 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-maroon-800/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-maroon-100 border border-maroon-300/60 text-maroon-900 text-xs font-bold font-body">
            <Bell className="w-3.5 h-3.5 text-maroon-800 animate-bounce" />
            <span>दैनिक पूजा व महाआरती समय</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-dark-950">
            माँ दुर्गा नित्य पूजन व <span className="text-maroon-800">आरती समय सारणी</span>
          </h2>

          <p className="text-xs sm:text-sm font-body text-dark-700 max-w-lg mx-auto leading-relaxed">
            कपूरिपुर दुर्गा पूजा प्रांगण में प्रतिदिन निर्धारित समय पर आयोजित होने वाले पावन अनुष्ठान एवं आरती।
          </p>
        </div>

        {/* Timings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {schedules.map((item, idx) => (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                item.isSpecial
                  ? 'bg-gradient-to-b from-maroon-900 via-maroon-950 to-dark-950 text-cream-50 border-2 border-amber-400/80 shadow-lg shadow-maroon-950/20'
                  : 'bg-cream-50 text-dark-950 border border-cream-300 hover:border-amber-400/60 shadow-sm'
              }`}
            >
              <div>
                {/* Card Top Row: Badge / Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      item.isSpecial
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-maroon-100 text-maroon-800'
                    }`}
                  >
                    {item.isSpecial ? (
                      <Flame className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-maroon-800" />
                    )}
                  </div>

                  {item.isSpecial && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-gold-400 text-dark-950 uppercase tracking-wider font-body shadow-sm">
                      <Sparkles className="w-3 h-3 text-dark-950" />
                      प्रमुख महाआरती
                    </span>
                  )}
                </div>

                {/* Aarti Time */}
                <div
                  className={`text-xl sm:text-2xl font-heading font-black tracking-tight mb-1.5 ${
                    item.isSpecial ? 'text-amber-300' : 'text-maroon-900'
                  }`}
                >
                  {item.time}
                </div>

                {/* Aarti Title */}
                <h3
                  className={`text-base font-heading font-bold mb-2 leading-snug ${
                    item.isSpecial ? 'text-cream-50' : 'text-dark-950'
                  }`}
                >
                  {item.title}
                </h3>

                {/* Aarti Description */}
                {item.description && (
                  <p
                    className={`text-xs font-body leading-relaxed ${
                      item.isSpecial ? 'text-cream-200/80' : 'text-dark-600'
                    }`}
                  >
                    {item.description}
                  </p>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-5 pt-3 border-t border-cream-200/20 flex items-center justify-between text-xs font-body">
                <span
                  className={
                    item.isSpecial ? 'text-amber-400/80 font-semibold' : 'text-muted'
                  }
                >
                  कपूरिपुर प्रांगण
                </span>

                <Link
                  to="/live-darshan"
                  className={`inline-flex items-center gap-1 font-bold transition-colors ${
                    item.isSpecial
                      ? 'text-amber-300 hover:text-amber-100'
                      : 'text-maroon-800 hover:text-maroon-950'
                  }`}
                >
                  <span>लाइव दर्शन</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Aarti Notification Banner below schedule */}
        <div className="mt-8 p-4 rounded-2xl bg-cream-50 border border-amber-300/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLiveActive
                  ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'bg-maroon-100 text-maroon-800'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-heading font-bold text-dark-950">
                {isLiveActive
                  ? '🔴 कपूरिपुर प्रांगण से आरती का सीधा प्रसारण चालू है!'
                  : 'घर बैठे माँ भगवती के दिव्य दर्शन व महाआरती में शामिल हों'}
              </h4>
              <p className="text-xs font-body text-dark-600">
                लाइव दर्शन पेज पर जाकर आप आरती में डिजिटल दीप व पुष्प अर्पित कर सकते हैं।
              </p>
            </div>
          </div>

          <Link
            to="/live-darshan"
            className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-xs font-bold transition-all shadow-md ${
              isLiveActive
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-maroon-800 hover:bg-maroon-900 text-cream-50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isLiveActive ? 'अभी लाइव देखें' : 'लाइव दर्शन पेज'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
