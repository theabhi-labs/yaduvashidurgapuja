import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('कृपया अपना पंजीकृत ईमेल पता दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      toast.success(res.message || '6-अंकों का OTP आपके ईमेल पर भेज दिया गया है।');
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      toast.error(err.message || 'OTP भेजने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle="पासवर्ड रीसेट त्रुटि"
      fallbackMessage="पासवर्ड रीसेट फॉर्म लोड करने में समस्या आई।"
    >
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
        <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
          <div className="text-center mb-6">
            {/* Sacred Favicon Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-maroon-800 p-1.5 flex items-center justify-center mx-auto mb-3 shadow-md border border-amber-400/40">
              <img
                src="/favicon.svg"
                alt="यदुवंशी दुर्गा पूजा"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-maroon-950">
              पासवर्ड भूल गए?
            </h1>
            <p className="text-xs sm:text-sm font-devanagari-body text-amber-900/90 font-medium mt-1">
              अपना पंजीकृत ईमेल पता दर्ज करें। हम सत्यापन के लिए 6-अंकों का OTP भेजेंगे।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
                ईमेल पता (Registered Email Address) *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@kapooripur.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 font-sans"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<KeyRound className="w-4 h-4" />}
              className="w-full font-body font-bold mt-2"
            >
              6-अंकों का OTP प्राप्त करें (Get OTP)
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-cream-300 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-devanagari-body font-semibold text-maroon-800 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>लॉगिन पेज पर वापस जाएं (Back to Login)</span>
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ForgotPassword;
