import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

export const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const toast = useToast();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];

    if (cleanVal.length > 1) {
      // Handle paste of full or multi-digit code
      const digits = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pastedData.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      toast.error('कृपया पूरा 6-अंकों का OTP दर्ज करें');
      return;
    }

    if (!email) {
      toast.error('ईमेल पता अनुपलब्ध है, कृपया पुनः प्रयास करें');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOtp({ email, otp: fullOtp });
      toast.success('OTP सत्यापित हुआ! अब नया पासवर्ड दर्ज करें।');
      const resetToken = res.data.resetToken;
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`, {
        state: { resetToken, email },
      });
    } catch (err: any) {
      toast.error(err.message || 'अमान्य OTP, कृपया पुनः प्रयास करें');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;

    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      toast.success('नया OTP आपके ईमेल पर भेज दिया गया है');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message || 'OTP पुनः भेजने में समस्या आई');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-700 flex items-center justify-center mx-auto mb-3 border border-gold-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-devanagari-heading font-bold text-maroon-950">
            OTP सत्यापन
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            हमने <span className="font-semibold text-maroon-900">{email || 'आपके ईमेल'}</span> पर 6-अंकों का OTP भेजा है।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-box OTP input fields */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
                className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 border-cream-300 bg-cream-50 text-maroon-950 focus:border-maroon-700 focus:ring-2 focus:ring-maroon-700/20 focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <div className="text-center text-xs font-devanagari-body text-muted">
            OTP की वैधता: <span className="font-bold text-maroon-900">10 मिनट</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-devanagari-body font-bold"
          >
            OTP सत्यापित करें
          </Button>
        </form>

        {/* Resend OTP button & timer */}
        <div className="mt-6 pt-6 border-t border-cream-300 flex items-center justify-between text-xs font-devanagari-body">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 font-semibold text-maroon-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ईमेल बदलें</span>
          </Link>

          {countdown > 0 ? (
            <span className="text-muted font-medium">
              पुनः भेजें ({countdown}s)
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-maroon-800 hover:text-maroon-950 hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>OTP पुनः भेजें</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
