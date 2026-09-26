import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  AtSign,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [hasManuallyEditedUsername, setHasManuallyEditedUsername] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Auto-slugify username from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!hasManuallyEditedUsername && val.trim().length > 0) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_.]/g, '')
        .slice(0, 20);
      setUsername(slug);
    }
  };

  // Debounced username checker
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await authService.checkUsername(clean);
        if (res.success) {
          setUsernameAvailable(res.data.available);
          setUsernameSuggestions(res.data.suggestions || []);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('कृपया सभी आवश्यक फ़ील्ड भरें।');
      return;
    }

    if (password.length < 6) {
      toast.error('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('पासवर्ड मेल नहीं खाते।');
      return;
    }

    if (usernameAvailable === false) {
      toast.error('यह यूजरनेम पहले से किसी अन्य भक्त द्वारा उपयोग किया जा रहा है। कृपया नीचे दिए गए सुझावों में से चुनें।');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, username.trim() || undefined);
      navigate('/');
    } catch {
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
            भक्त पंजीकरण
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-amber-900/90 font-medium mt-1">
            यदुवंशी दुर्गा पूजा कपूरीपुर परिवार से जुड़ें
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
              पूरा नाम (Full Name) *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="उदा. अभिषेक यादव"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          {/* Instagram-style @Username */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-dark-900 font-devanagari-body">
                यूजरनेम (Instagram @Username)
              </label>
              {isCheckingUsername ? (
                <span className="text-[11px] text-muted flex items-center gap-1 font-body">
                  <Loader2 className="w-3 h-3 animate-spin text-gold-600" />
                  जाँच हो रही है...
                </span>
              ) : usernameAvailable === true ? (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 font-body">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  उपलब्ध है!
                </span>
              ) : usernameAvailable === false ? (
                <span className="text-[11px] text-rose-700 font-bold flex items-center gap-1 font-body">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  लिया जा चुका है
                </span>
              ) : null}
            </div>

            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setHasManuallyEditedUsername(true);
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }}
                placeholder="abhishekyadav"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                  usernameAvailable === true
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20'
                    : usernameAvailable === false
                    ? 'border-rose-400 bg-rose-50/40 text-rose-950 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-cream-300 bg-cream-50 text-dark-900 focus:ring-2 focus:ring-maroon-600'
                }`}
              />
            </div>

            {/* Suggestions if username is taken */}
            {usernameSuggestions.length > 0 && (
              <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-300/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block font-body">
                  उपलब्ध सुझाव (Click to Pick):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {usernameSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setHasManuallyEditedUsername(true);
                        setUsername(sug);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-gold-500 hover:text-maroon-950 text-dark-900 border border-gold-400 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
              ईमेल पता (Email Address) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@kapooripur.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
              पासवर्ड (Password) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="कम से कम 6 अक्षर"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-devanagari-body mb-1.5">
              पासवर्ड दोबारा दर्ज करें (Confirm Password) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="वही पासवर्ड दोबारा दर्ज करें"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-5 h-5" />}
            className="w-full font-bold shadow-lg mt-2"
          >
            पंजीकरण करें (Register Now)
          </Button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-cream-200">
          <p className="text-xs text-muted font-devanagari-body">
            पहले से खाता है?{' '}
            <Link
              to="/login"
              className="text-maroon-900 font-bold hover:underline"
            >
              लॉगिन करें (Sign In)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
