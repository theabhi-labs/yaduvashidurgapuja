import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { REPORT_REASONS } from '../../utils/constants';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, memoryId }) => {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState<string>('inappropriate');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('कृपया रिपोर्ट दर्ज करने के लिए लॉगिन करें');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        memoryId,
        reason,
        description: description.trim(),
      });
      toast.success('आपकी रिपोर्ट दर्ज कर ली गई है। समिति शीघ्र समीक्षा करेगी।');
      onClose();
      setDescription('');
    } catch (err: any) {
      toast.error(err.message || 'रिपोर्ट दर्ज करने में त्रुटि हुई');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="स्मृति की रिपोर्ट करें">
      {!isAuthenticated ? (
        <div className="text-center py-4">
          <AlertTriangle className="w-12 h-12 text-gold-600 mx-auto mb-3" />
          <p className="text-sm font-devanagari-body text-dark-800 mb-6">
            सामग्री की समीक्षा हेतु रिपोर्ट करने के लिए कृपया पहले लॉगिन करें।
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/login">
              <Button variant="primary" size="md">
                लॉगिन करें
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={onClose}>
              रद्द करें
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-devanagari-body font-semibold text-dark-900 mb-2">
              रिपोर्ट का कारण चुनें:
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    reason === item.value
                      ? 'border-maroon-600 bg-maroon-50/60 text-maroon-950 font-medium'
                      : 'border-cream-300 hover:bg-cream-200/60 text-dark-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 text-maroon-700 focus:ring-maroon-500"
                  />
                  <span className="text-xs sm:text-sm font-devanagari-body leading-relaxed">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-devanagari-body font-semibold text-dark-900 mb-1.5">
              अतिरिक्त विवरण (वैकल्पिक):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="समिति के लिए कोई विशेष सूचना..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600 text-sm font-devanagari-body"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              रद्द करें
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={isSubmitting}
            >
              रिपोर्ट सबमिट करें
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
