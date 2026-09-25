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
        setMessage('सत्यापन टोकन नहीं मिला');
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'ईमेल सफलतापूर्वक सत्यापित हो गया है!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'सत्यापन विफल रहा');
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
            <h2 className="text-xl font-devanagari-heading font-bold text-dark-900">
              ईमेल सत्यापित किया जा रहा है...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-devanagari-heading font-bold text-dark-950">
              सत्यापन सफल!
            </h2>
            <p className="text-sm font-devanagari-body text-muted">{message}</p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" size="md">
                  लॉगिन करें
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-14 h-14 text-maroon-700 mx-auto" />
            <h2 className="text-xl font-devanagari-heading font-bold text-dark-950">
              सत्यापन विफल
            </h2>
            <p className="text-sm font-devanagari-body text-muted">{message}</p>
            <div className="pt-4">
              <Link to="/">
                <Button variant="outline" size="md">
                  मुख्य पृष्ठ पर जाएं
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
