import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Lock, CheckCircle2, KeyRound } from 'lucide-react';

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
      toast.error('Reset token is missing or invalid. Please verify OTP again.');
      navigate('/forgot-password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ resetToken, newPassword });
      toast.success('Password updated successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
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
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted mt-1">
            Enter a secure new password (minimum 8 characters) for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-900 font-body mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
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
            className="w-full font-body font-bold"
          >
            Update Password
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-300 text-center">
          <Link
            to="/login"
            className="text-xs font-body font-semibold text-maroon-800 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
