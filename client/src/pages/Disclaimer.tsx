import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME, LOCATION_TEXT } from '../utils/constants';

export const Disclaimer: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'info', title: '1. Community Information Purpose' },
    { id: 'events', title: '2. Event Dates & Schedule Changes' },
    { id: 'livestream', title: '3. Live Streaming & Digital Broadcasts' },
    { id: 'third-party', title: '4. Third-Party Payment Providers' },
    { id: 'external', title: '5. External Links & Media' },
    { id: 'liability', title: '6. Limitation of Liability' },
    { id: 'contact', title: '7. Official Verification & Inquiries' },
  ];

  return (
    <LegalPageLayout
      badge="Legal & Information"
      title="Disclaimer"
      description="Important general information, event schedule notices, live broadcast availability, and third-party service disclaimers for Yaduvanshi Durga Puja Samiti, Kapooripur."
      tocItems={tocItems}
    >
      {/* 1. Community Information */}
      <LegalSection id="info" number="1" title="Community Information Purpose">
        <p>
          The information contained on this website (<code>kapooripur.in</code>) is published in good faith by {LEGAL_ENTITY_NAME} ("Samiti") purely for general information, cultural heritage awareness, and community participation.
        </p>
        <p>
          This portal is maintained on a community-driven basis to keep residents, devotees, and well-wishers informed about Durga Puja ceremonies and related community activities in Kapooripur.
        </p>
      </LegalSection>

      {/* 2. Events */}
      <LegalSection id="events" number="2" title="Event Dates & Schedule Changes">
        <p>
          All festival dates, Maha Aarti schedules, bhog timings, and cultural programs listed on the website are tentative and based on religious almanacs and current committee planning.
        </p>
        <p>
          Event details may be updated or modified by the Samiti due to weather conditions, local administrative directives, security advisories, or logistical requirements. Visitors are encouraged to verify current schedules directly with the Samiti.
        </p>
      </LegalSection>

      {/* 3. Livestream */}
      <LegalSection id="livestream" number="3" title="Live Streaming & Digital Broadcasts">
        <p>
          Live Darshan and audio-visual broadcasts provided through the portal depend on rural network bandwidth, internet service provider availability, power continuity, and camera equipment.
        </p>
        <p>
          While the Samiti makes reasonable efforts to maintain live stream feeds during major aartis, uninterrupted or error-free continuous broadcast is not guaranteed.
        </p>
      </LegalSection>

      {/* 4. Third-Party */}
      <LegalSection id="third-party" number="4" title="Third-Party Payment Providers">
        <p>
          Online voluntary contribution processing is facilitated through authorized third-party payment gateway providers (e.g., Razorpay).
        </p>
        <p>
          {LEGAL_ENTITY_NAME} does not operate as a financial institution or banking entity. All online payment authorizations, card verification, and banking settlements are handled independently by the user's issuing bank and the payment gateway.
        </p>
      </LegalSection>

      {/* 5. External Links */}
      <LegalSection id="external" number="5" title="External Links & Contributed Media">
        <p>
          Devotees voluntarily submit photographs and remembrances to the digital memory archive. The Samiti exercises moderation to uphold sacred decorum but assumes no responsibility for external links or third-party web content that may be referenced.
        </p>
      </LegalSection>

      {/* 6. Liability */}
      <LegalSection id="liability" number="6" title="Limitation of Liability">
        <p>
          In no event shall {LEGAL_ENTITY_NAME}, its organizers, or volunteers be held liable for any incidental, indirect, or consequential loss arising from the use of this website, temporary site downtime, or reliance on information presented herein.
        </p>
      </LegalSection>

      {/* 7. Contact */}
      <LegalSection id="contact" number="7" title="Official Verification & Inquiries">
        <p>
          For official clarifications, event verifications, or feedback, please contact the Samiti directly:
        </p>
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 space-y-1.5 text-xs font-body">
          <p className="font-bold text-dark-950">{LEGAL_ENTITY_NAME}</p>
          <p>Location: {LOCATION_TEXT}</p>
          <p>
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Online Inquiries:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Contact Form →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Disclaimer;
