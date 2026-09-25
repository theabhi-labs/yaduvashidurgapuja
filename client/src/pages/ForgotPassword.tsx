import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setIsSent(true);
      toast.success(res.message || 'पासवर्ड रीसेट लिंक तैयार हो गया है');
      if (res.data?.resetToken) {
        setDevResetToken(res.data.resetToken);
      }
    } catch (err: any) {
      toast.error(err.message || 'अनुरोध विफल हुआ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-devanagari-heading font-bold text-maroon-950">
            पासवर्ड रीसेट
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            अपना पंजीकृत ईमेल पता दर्ज करें।
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
                ईमेल पता
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
              leftIcon={<Send className="w-4 h-4" />}
              className="w-full font-devanagari-body font-bold"
            >
              रीसेट लिंक प्राप्त करें
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-devanagari-body leading-relaxed">
              यदि यह ईमेल पंजीकृत है, तो पासवर्ड रीसेट निर्देश जारी कर दिए गए हैं।
            </div>

            {devResetToken && (
              <div className="p-3 bg-cream-200 rounded-xl text-left border border-gold-400/40">
                <p className="text-[11px] font-semibold text-maroon-900 mb-1">
                  सीधा रीसेट परीक्षण लिंक (Direct Reset Link):
                </p>
                <Link
                  to={`/reset-password?token=${devResetToken}`}
                  className="text-xs text-maroon-800 underline font-mono break-all"
                >
                  पासवर्ड अभी रीसेट करने के लिए यहाँ क्लिक करें →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-cream-300 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-devanagari-body font-semibold text-maroon-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>लॉगिन पृष्ठ पर लौटें</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
