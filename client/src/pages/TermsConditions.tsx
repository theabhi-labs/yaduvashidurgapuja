import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, OFFICIAL_PHONE, LEGAL_ENTITY_NAME, LOCATION_TEXT } from '../utils/constants';

export const TermsConditions: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'about', title: '2. About the Community Initiative' },
    { id: 'usage', title: '3. Website Usage & Eligibility' },
    { id: 'events', title: '4. Community Events & Schedules' },
    { id: 'contributions', title: '5. Voluntary Contributions' },
    { id: 'payment', title: '6. Payment Gateway Processing' },
    { id: 'support-wall', title: '7. Community Support Wall' },
    { id: 'content', title: '8. User-Submitted Content & Memories' },
    { id: 'moderation', title: '9. Content Moderation Standards' },
    { id: 'ip', title: '10. Intellectual Property Rights' },
    { id: 'third-party', title: '11. Third-Party Services & Links' },
    { id: 'availability', title: '12. Service Availability & Uptime' },
    { id: 'liability', title: '13. Limitation of Liability' },
    { id: 'modifications', title: '14. Amendments to Terms' },
    { id: 'contact', title: '15. Contact Information' },
  ];

  return (
    <LegalPageLayout
      badge="Terms of Governance"
      title="Terms & Conditions"
      description="These Terms & Conditions govern the access, voluntary contributions, and use of the Yaduvanshi Durga Puja Samiti, Kapooripur community portal on kapooripur.in."
      tocItems={tocItems}
    >
      {/* 1. Acceptance */}
      <LegalSection id="acceptance" number="1" title="Acceptance of Terms">
        <p>
          By accessing or using the website <code>kapooripur.in</code> ("Website"), participating in community activities, or submitting voluntary contributions, you agree to be bound by these Terms & Conditions and our <Link to="/privacy" className="text-maroon-800 underline font-semibold">Privacy Policy</Link> and <Link to="/contribution-policy" className="text-maroon-800 underline font-semibold">Contribution Policy</Link>.
        </p>
        <p>
          If you do not agree with any provision of these terms, please refrain from using the Website.
        </p>
      </LegalSection>

      {/* 2. About Initiative */}
      <LegalSection id="about" number="2" title="About the Community Initiative">
        <p>
          {LEGAL_ENTITY_NAME} ("Samiti", "we", "us") is a local community organization established in Kapooripur to coordinate the annual celebration of Durga Puja, traditional religious rituals, and community cultural programs.
        </p>
        <p>
          This website serves as an authentic informational portal and digital memory archive to connect residents, devotees, and well-wishers worldwide.
        </p>
      </LegalSection>

      {/* 3. Website Usage */}
      <LegalSection id="usage" number="3" title="Website Usage & Eligibility">
        <p>Users agree to use the website in a lawful, respectful, and peaceful manner:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>You will not use the portal for any unlawful, fraudulent, or harmful purposes.</li>
          <li>You will not disrupt normal website operations, livestreams, or server infrastructure.</li>
          <li>Account credentials must be kept confidential; impersonation of committee members or other devotees is strictly forbidden.</li>
        </ul>
      </LegalSection>

      {/* 4. Events */}
      <LegalSection id="events" number="4" title="Community Events & Schedules">
        <p>
          Festival schedules, aarti times, and program venues published on the website are provided for community coordination. All event timings are subject to change by the Samiti based on ritual requirements, local administration directives, or weather conditions.
        </p>
      </LegalSection>

      {/* 5. Voluntary Contributions */}
      <LegalSection id="contributions" number="5" title="Voluntary Contributions">
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs sm:text-sm text-dark-900 space-y-1.5">
          <p className="font-bold text-maroon-900">Nature of Contributions:</p>
          <p>
            Contributions made through the website are completely voluntary and are intended exclusively to support the Durga Puja आयोजन (pandal setup, idol craftsmanship, puja samagri, Maha Aarti, bhog distribution, and cultural activities) and related community activities described on the website.
          </p>
          <p>
            Contributions do not constitute a purchase of commercial products or services, nor do they entitle the contributor to any commercial returns, shares, or material considerations.
          </p>
        </div>
      </LegalSection>

      {/* 6. Payment Processing */}
      <LegalSection id="payment" number="6" title="Payment Gateway Processing">
        <p>
          Online voluntary contributions are handled by third-party payment aggregators (e.g., Razorpay). The website does not store sensitive card data, CVVs, or bank credentials. All transactions are subject to the terms and privacy regulations of the payment provider and your issuing bank.
        </p>
      </LegalSection>

      {/* 7. Support Wall */}
      <LegalSection id="support-wall" number="7" title="Community Support Wall">
        <p>
          Contributors may opt to have their name and contribution amount displayed on the public Community Support Wall. Such display requires affirmative user consent via the designated checkbox. Contributors also have the option to contribute anonymously.
        </p>
      </LegalSection>

      {/* 8. User Content */}
      <LegalSection id="content" number="8" title="User-Submitted Content & Memories">
        <p>
          Devotees uploading photographs and descriptions to the memory archive warrant that they have the right or consent to share such content. By submitting content, users grant the Samiti a non-exclusive license to host, optimize, and archive the media on the portal.
        </p>
      </LegalSection>

      {/* 9. Content Moderation */}
      <LegalSection id="moderation" number="9" title="Content Moderation Standards">
        <p>
          To maintain the sacred character of the portal, the Samiti reserves the right to review, edit, or remove any submitted photograph, message, or user account that violates community guidelines, contains vulgarity, promotes commercial spam, or causes social discord.
        </p>
      </LegalSection>

      {/* 10. Intellectual Property */}
      <LegalSection id="ip" number="10" title="Intellectual Property Rights">
        <p>
          The layout, design, custom graphics, portal software, and official text on <code>kapooripur.in</code> are the intellectual property of {LEGAL_ENTITY_NAME}. Contributed user photographs remain the property of their respective creators.
        </p>
      </LegalSection>

      {/* 11. Third-Party Services */}
      <LegalSection id="third-party" number="11" title="Third-Party Services & Links">
        <p>
          The portal may integrate cloud services (e.g., Cloudflare, MongoDB, Razorpay) to provide functionality. The Samiti is not responsible for the independent operations, outages, or terms of third-party platforms.
        </p>
      </LegalSection>

      {/* 12. Service Availability */}
      <LegalSection id="availability" number="12" title="Service Availability & Uptime">
        <p>
          The Samiti endeavors to provide continuous, reliable access to the website and live streams but does not warrant uninterrupted or error-free service during maintenance, network outages, or unforeseen technical difficulties.
        </p>
      </LegalSection>

      {/* 13. Limitation of Liability */}
      <LegalSection id="liability" number="13" title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, {LEGAL_ENTITY_NAME}, its organizers, and volunteers shall not be liable for any direct, indirect, or incidental damages arising out of your access to or inability to use the Website.
        </p>
      </LegalSection>

      {/* 14. Modifications */}
      <LegalSection id="modifications" number="14" title="Amendments to Terms">
        <p>
          The Samiti reserves the right to update these Terms & Conditions as necessary. Continued use of the website following any changes signifies your acceptance of the revised terms.
        </p>
      </LegalSection>

      {/* 15. Contact */}
      <LegalSection id="contact" number="15" title="Contact Information">
        <p>
          For questions or formal communications regarding these Terms & Conditions, please contact us:
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
            Phone:{' '}
            <a href={`tel:${OFFICIAL_PHONE}`} className="text-maroon-800 underline font-mono">
              {OFFICIAL_PHONE}
            </a>
          </p>
          <p className="pt-1">
            Online Contact:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Contact Form →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsConditions;
