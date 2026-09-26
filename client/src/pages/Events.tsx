import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import {
  Clock,
  MapPin,
  Radio,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import { LOCATION_TEXT } from '../utils/constants';

interface EventItem {
  id: string;
  name: string;
  hindiName: string;
  dateDesc: string;
  time: string;
  venue: string;
  description: string;
  highlight?: boolean;
  status: 'upcoming' | 'live' | 'completed';
}

const EVENTS_SCHEDULE: EventItem[] = [
  {
    id: 'mahalaya',
    name: 'Mahalaya (Tarpan & Aagomoni)',
    hindiName: 'महालया (तर्पण एवं माँ का आह्वान)',
    dateDesc: 'अश्विन कृष्ण पक्ष अमावस्या',
    time: 'प्रातः 05:00 बजे से',
    venue: 'पावन पूजन प्रांगण, कपूरिपुर',
    description: 'पितृ तर्पण एवं माँ भगवती दुर्गा के पावन आगमन का शुभ शंखनाद। चंडी पाठ व भक्तिमय प्रभात फेरी।',
    status: 'upcoming',
  },
  {
    id: 'shashthi',
    name: 'Maha Shashthi (Bodhon & Kalparambha)',
    hindiName: 'महा षष्ठी (कल्पारम्भ एवं देवी बोधन)',
    dateDesc: 'अश्विन शुक्ल षष्ठी',
    time: 'सायं 06:30 बजे',
    venue: 'मुख्य पूजा मंडप, कपूरिपुर',
    description: 'माँ दुर्गा की प्रतिमा का पावन अनावरण, बेलवरण, अधिवास एवं कल्पारम्भ अनुष्ठान।',
    status: 'upcoming',
  },
  {
    id: 'saptami',
    name: 'Maha Saptami (Navapatrika Puja)',
    hindiName: 'महा सप्तमी (नवपत्रिका प्रवेश व पूजन)',
    dateDesc: 'अश्विन शुक्ल सप्तमी',
    time: 'प्रातः 07:30 बजे / सायं 07:00 बजे (आरती)',
    venue: 'मुख्य पूजा मंडप, कपूरिपुर',
    description: 'पवित्र नवपत्रिका (कोलाबोउ) स्नान, प्राण प्रतिष्ठा, विशेष वैदिक पूजन एवं भव्य संध्या महाआरती।',
    status: 'upcoming',
  },
  {
    id: 'ashtami',
    name: 'Maha Ashtami & Sandhi Puja',
    hindiName: 'महा अष्टमी एवं पावन संधि पूजा',
    dateDesc: 'अश्विन शुक्ल अष्टमी',
    time: 'प्रातः 08:00 बजे (अष्टमी पूजन) / संधि काल',
    venue: 'मुख्य पूजा मंडप, कपूरिपुर',
    description: 'अष्टमी का विशेष महापूजन, पुष्पांजलि, 108 पावन दीप प्रज्वलन एवं संधि काल में विशेष महाआरती।',
    highlight: true,
    status: 'upcoming',
  },
  {
    id: 'navami',
    name: 'Maha Navami & Maha Havan',
    hindiName: 'महा नवमी एवं पूर्णाहूति महायज्ञ',
    dateDesc: 'अश्विन शुक्ल नवमी',
    time: 'प्रातः 09:00 बजे (हवन) / दोपहर 01:00 बजे (महाप्रसाद)',
    venue: 'यज्ञशाला एवं भंडारा प्रांगण, कपूरिपुर',
    description: 'अखंड चंडी महायज्ञ, पूर्णाहूति, कुमारी पूजन एवं समस्त ग्रामवासियों व भक्तों हेतु वृहद महाप्रसाद (भंडारा)।',
    highlight: true,
    status: 'upcoming',
  },
  {
    id: 'dashami',
    name: 'Vijaya Dashami & Visarjan Yatra',
    hindiName: 'विजयादशमी, सिंदूर खेला एवं विसर्जन',
    dateDesc: 'अश्विन शुक्ल दशमी',
    time: 'दोपहर 02:00 बजे से विसर्जन यात्रा',
    venue: 'कपूरिपुर प्रांगण से पावन विसर्जन घाट',
    description: 'माता का पावन अपराजिता पूजन, महिलाओं द्वारा पारंपरिक सिंदूर खेला एवं भव्य गाजे-बाजे के साथ विसर्जन यात्रा।',
    status: 'upcoming',
  },
  {
    id: 'cultural',
    name: 'Community Cultural Programs',
    hindiName: 'सांस्कृतिक संध्या एवं भजन कीर्तन',
    dateDesc: 'सप्तमी से नवमी (प्रत्येक संध्या)',
    time: 'रात्रि 08:30 बजे से 11:00 बजे',
    venue: 'कपूरिपुर सांस्कृतिक मंच',
    description: 'स्थानीय युवाओं व कलाकारों द्वारा भजन संध्या, देवी जागरण एवं पारंपरिक सांस्कृतिक प्रस्तुतियाँ।',
    status: 'upcoming',
  },
];

export const Events: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[85vh] space-y-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-cream-50 rounded-3xl p-6 sm:p-12 border-2 border-gold-500/40 shadow-medium text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold font-body border border-gold-400/40">
            <span>यदुवंशी दुर्गा पूजा समिति कपूरिपुर</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black text-cream-50 leading-tight">
            Durga Puja & Community Events
          </h1>

          <p className="text-xs sm:text-base font-body text-cream-200/90 leading-relaxed max-w-2xl mx-auto">
            कपूरिपुर दुर्गा पूजा के पावन अनुष्ठानों, दैनिक महाआरती, महाप्रसाद एवं सामुदायिक कार्यक्रमों की प्रामाणिक समय-सारणी।
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-body text-gold-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              {LOCATION_TEXT}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Notice Box */}
      <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm font-body text-maroon-950 flex items-start gap-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-maroon-900">
            महत्वपूर्ण सूचना (Event Schedule Advisory):
          </p>
          <p className="text-xs text-dark-800 leading-relaxed">
            सभी धार्मिक अनुष्ठानों एवं महाआरती के समय पंचांग, स्थानीय व्यवस्था व मौसम की अनुकूलता के अनुसार समिति द्वारा अद्यतन (update) किए जा सकते हैं। किसी भी तात्कालिक जानकारी के लिए समिति से संपर्क करें।
          </p>
        </div>
      </div>

      {/* 3. Event Schedule Cards Grid */}
      <div className="space-y-6">
        <SectionHeading
          badge="Event Schedule"
          title="पावन अनुष्ठान एवं कार्यक्रम विवरण"
          subtitle="Annual Durga Puja festival timeline organized by Yaduvanshi Durga Puja Samiti."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {EVENTS_SCHEDULE.map((evt) => (
            <div
              key={evt.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-3 bg-white ${
                evt.highlight
                  ? 'border-gold-400 shadow-md ring-1 ring-gold-400/50 bg-gradient-to-br from-amber-50/50 via-white to-cream-50'
                  : 'border-cream-300 shadow-soft hover:border-gold-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-cream-200 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-body block mb-0.5">
                    {evt.dateDesc}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-dark-950">
                    {evt.hindiName}
                  </h3>
                  <p className="text-xs font-body text-muted">{evt.name}</p>
                </div>

                {evt.highlight && (
                  <span className="px-2.5 py-0.5 rounded-full bg-maroon-800 text-gold-200 text-[10px] font-bold shrink-0">
                    विशेष पर्व
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-body text-dark-800 pt-1">
                <div className="flex items-center gap-2 text-maroon-900 font-semibold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>समय: {evt.time}</span>
                </div>

                <div className="flex items-center gap-2 text-dark-700">
                  <MapPin className="w-4 h-4 text-muted shrink-0" />
                  <span>स्थान: {evt.venue}</span>
                </div>

                <p className="text-muted leading-relaxed pt-1 text-[11px] sm:text-xs">
                  {evt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Broadcast & Support Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
        {/* Live Broadcast Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-maroon-950 to-maroon-900 text-cream-50 border border-gold-500/40 shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-400/40 text-red-300 text-xs font-bold font-body">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>डिजिटल दर्शन</span>
            </div>
            <h3 className="text-lg font-heading font-bold text-cream-50">
              लाइव आरती एवं दर्शन
            </h3>
            <p className="text-xs font-body text-cream-200/90 leading-relaxed">
              घर बैठे कपूरिपुर दुर्गा पूजा की महाआरती और पावन दर्शन में सम्मिलित हों।
            </p>
          </div>

          <div>
            <Link to="/live-darshan">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                लाइव दर्शन देखें
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Card */}
        <div className="p-6 rounded-3xl bg-cream-100 rounded-3xl border border-cream-300 shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/50 text-maroon-900 text-xs font-bold font-body">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
              <span>सहयोग एवं सेवा</span>
            </div>
            <h3 className="text-lg font-heading font-bold text-dark-950">
              माँ दुर्गा पूजा सेवा में सहयोग
            </h3>
            <p className="text-xs font-body text-muted leading-relaxed">
              दुर्गा पूजा आयोजन, महाप्रसाद एवं व्यवस्था हेतु अपना ऐच्छिक पावन सहयोग समर्पित करें।
            </p>
          </div>

          <div>
            <Link to="/contributors">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                सहयोग करें (Support)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
