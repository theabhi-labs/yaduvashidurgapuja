import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Lock, CheckCircle2 } from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const resetToken =
    (location.state as any)?.resetToken ||
    searchParams.get('token') ||
    searchParams.get('resetToken') ||
    '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      toast.error('रीसेट टोकन अमान्य है। कृपया पुनः OTP सत्यापित करें।');
      navigate('/forgot-password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('दोनों पासवर्ड मेल नहीं खाते हैं।');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ resetToken, newPassword });
      toast.success('पासवर्ड सफलतापूर्वक बदल दिया गया! कृपया नए पासवर्ड से लॉगिन करें।');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'पासवर्ड रीसेट करने में समस्या आई। पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle="पासवर्ड निर्माण त्रुटि"
      fallbackMessage="नया पासवर्ड फॉर्म लोड करने में समस्या आई।"
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
              नया पासवर्ड बनाएं
            </h1>
            <p className="text-xs sm:text-sm font-devanagari-body text-amber-900/90 font-medium mt-1">
              अपने खाते के लिए एक सुरक्षित नया पासवर्ड (कम से कम 8 अक्षर) दर्ज करें।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
                नया पासवर्ड (New Password) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="कम से कम 8 अक्षर"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
                पासवर्ड की पुष्टि करें (Confirm Password) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="नया पासवर्ड दोबारा दर्ज करें"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="w-full font-body font-bold mt-2"
            >
              पासवर्ड सुरक्षित करें (Update Password)
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-cream-300 text-center">
            <Link
              to="/login"
              className="text-xs font-devanagari-body font-semibold text-maroon-800 hover:underline"
            >
              लॉगिन पेज पर जाएं (Back to Login)
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ResetPassword;
