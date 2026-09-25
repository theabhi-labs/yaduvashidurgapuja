import React, { useState } from 'react';
import { contactService, ContactFormData } from '../../services/contactService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Send, CheckCircle2, User, Mail, MessageSquare, AlertCircle } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toast = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMessage('संदेश कम से कम 10 अक्षरों का होना चाहिए');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await contactService.submitMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        toast.success('आपका संदेश सफलतापूर्वक भेज दिया गया है!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      const msg = err.message || 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-cream-100 p-8 sm:p-12 rounded-3xl border border-cream-300 shadow-soft text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-devanagari-heading font-bold text-dark-950">
          संदेश प्राप्त हुआ! धन्यवाद।
        </h3>
        <p className="text-sm font-devanagari-body text-muted max-w-md mx-auto leading-relaxed">
          आपका संदेश यदुवंशी दुर्गा पूजा समिति को भेज दिया गया है। हम आपके संदेश की समीक्षा कर शीघ्र ही ईमेल द्वारा संपर्क करेंगे।
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsSuccess(false)}
          >
            एक और संदेश भेजें
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-medium">
      <h3 className="text-xl font-devanagari-heading font-bold text-maroon-950 mb-1">
        संदेश भेजें (Send a Message)
      </h3>
      <p className="text-xs sm:text-sm font-devanagari-body text-muted mb-6">
        कृपया अपना विवरण और प्रश्न अथवा सुझाव नीचे दिए गए फॉर्म में भरें।
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-maroon-50 border border-maroon-200 text-maroon-950 flex items-start gap-3 text-xs sm:text-sm font-devanagari-body">
          <AlertCircle className="w-5 h-5 text-maroon-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-devanagari-body">
        {/* Name */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            आपका नाम (Name) *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="उदा. अभिषेक यादव"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            ईमेल पता (Email) *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@kapooripur.online"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            विषय (Subject) *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="उदा. पुरानी पूजा तस्वीर साझा करने हेतु / सुझाव"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-dark-900">
              संदेश (Message) *
            </label>
            <span className="text-xs text-muted font-mono">
              {formData.message.length}/1500
            </span>
          </div>
          <textarea
            rows={5}
            name="message"
            required
            maxLength={1500}
            value={formData.message}
            onChange={handleChange}
            placeholder="अपना संदेश यहाँ विस्तार से लिखें..."
            className="w-full p-3.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
            className="w-full font-devanagari-body font-bold"
          >
            संदेश भेजें
          </Button>
        </div>
      </form>
    </div>
  );
};
