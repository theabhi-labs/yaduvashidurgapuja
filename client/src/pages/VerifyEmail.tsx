import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/common/Button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token not found in URL.');
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[75vh] flex flex-col justify-center">
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-medium p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-maroon-700 mx-auto" />
            <h2 className="text-xl font-heading font-bold text-dark-900">
              Verifying Email...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-heading font-bold text-dark-950">
              Verification Successful!
            </h2>
            <p className="text-sm font-body text-muted">{message}</p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" size="md">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-14 h-14 text-maroon-700 mx-auto" />
            <h2 className="text-xl font-heading font-bold text-dark-950">
              Verification Failed
            </h2>
            <p className="text-sm font-body text-muted">{message}</p>
            <div className="pt-4">
              <Link to="/">
                <Button variant="outline" size="md">
                  Go to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
