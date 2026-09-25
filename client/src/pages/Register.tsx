import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-maroon-700 text-gold-300 flex items-center justify-center font-heading font-bold text-2xl mx-auto mb-3 shadow-sm border border-gold-500/40">
            Y
          </div>
          <h1 className="text-2xl font-heading font-bold text-maroon-950">
            Devotee Registration
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted mt-1">
            Join the Yaduvanshi Durga Puja Kapooripur Family
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abhishek Yadav"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Email Address *
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

          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="w-full font-body font-bold mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-300 text-center text-xs font-body text-muted">
          <span>Already registered? </span>
          <Link to="/login" className="text-maroon-800 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
