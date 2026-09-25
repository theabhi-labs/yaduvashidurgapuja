import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('कृपया ईमेल और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error handled inside AuthContext
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
        <div className="text-center mb-8">
          {/* Sacred Favicon Emblem */}
          <div className="w-14 h-14 rounded-2xl bg-maroon-800 p-1.5 flex items-center justify-center mx-auto mb-3 shadow-md border border-amber-400/40">
            <img
              src="/favicon.svg"
              alt="यदुवंशी दुर्गा पूजा"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <h1 className="text-2xl font-serif font-bold text-maroon-950">
            भक्त लॉगिन
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-amber-900/90 font-medium mt-1">
            यदुवंशी दुर्गा पूजा कपूरीपुर डिजिटल संग्रह में प्रवेश करें
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
              ईमेल पता (Email Address)
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-dark-900 font-devanagari-body">
                पासवर्ड (Password)
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-devanagari-body text-maroon-700 hover:underline"
              >
                पासवर्ड भूल गए?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="w-full font-body font-bold mt-2"
          >
            लॉगिन करें (Log In)
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-300 text-center text-xs font-devanagari-body text-muted">
          <span>खाता नहीं है? </span>
          <Link to="/register" className="text-maroon-800 font-bold hover:underline ml-1">
            पंजीकरण करें (Register / Sign Up)
          </Link>
        </div>
      </div>
    </div>
  );
};
