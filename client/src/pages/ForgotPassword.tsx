import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'OTP has been sent to your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-maroon-900/10 text-maroon-800 flex items-center justify-center mx-auto mb-3 border border-gold-500/30">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-maroon-950">
            Forgot Password?
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted mt-1">
            Enter your registered email address. We will send you a 6-digit verification OTP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@kapooripur.online"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<KeyRound className="w-4 h-4" />}
            className="w-full font-body font-bold"
          >
            Get 6-Digit OTP
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-300 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-maroon-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
