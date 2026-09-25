import React from 'react';
import { SectionHeading } from '../components/common/SectionHeading';
import { ContactInfo } from '../components/contact/ContactInfo';
import { ContactForm } from '../components/contact/ContactForm';

export const Contact: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="Contact & Support"
        title="Get in Touch with Us"
        subtitle="For questions, corrections, content concerns, or general inquiries, please get in touch with the committee."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Official Contact Info */}
        <div className="lg:col-span-5">
          <ContactInfo />
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};
