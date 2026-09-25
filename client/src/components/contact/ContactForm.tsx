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
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMessage('Message must be at least 10 characters long');
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
        toast.success('Your message was sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      const msg = err.message || 'Error sending message. Please try again.';
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
        <h3 className="text-2xl font-heading font-bold text-dark-950">
          Message Received! Thank You.
        </h3>
        <p className="text-sm font-body text-muted max-w-md mx-auto leading-relaxed">
          Your message has been received by the Yaduvanshi Durga Puja Committee. We will review it and reply via email shortly.
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsSuccess(false)}
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-medium">
      <h3 className="text-xl font-heading font-bold text-maroon-950 mb-1">
        Send a Message
      </h3>
      <p className="text-xs sm:text-sm font-body text-muted mb-6">
        Please enter your contact details and message or inquiry below.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-maroon-50 border border-maroon-200 text-maroon-950 flex items-start gap-3 text-xs sm:text-sm font-body">
          <AlertCircle className="w-5 h-5 text-maroon-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-body">
        {/* Name */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            Your Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Abhishek Yadav"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block font-semibold text-dark-900 mb-1.5">
            Subject *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Archival Photo Submission / Seva Inquiry"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-dark-900">
              Message *
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
            placeholder="Type your message in detail here..."
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
            className="w-full font-body font-bold"
          >
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
};
