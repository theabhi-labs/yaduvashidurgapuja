import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME, LOCATION_TEXT } from '../utils/constants';

export const PrivacyPolicy: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'intro', title: '1. Introduction & Scope' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'contributions', title: '3. Voluntary Contribution Information' },
    { id: 'payment-sec', title: '4. Third-Party Payment Processing' },
    { id: 'wall-consent', title: '5. Community Support Wall & Public Consent' },
    { id: 'contact-data', title: '6. Contact Form & Inquiries' },
    { id: 'memories', title: '7. Uploaded Archive Memories' },
    { id: 'cookies', title: '8. Cookies & Technical Logs' },
    { id: 'sharing', title: '9. Data Sharing & Third Parties' },
    { id: 'retention', title: '10. Data Retention' },
    { id: 'security', title: '11. Data Security Measures' },
    { id: 'user-rights', title: '12. User Rights & Data Requests' },
    { id: 'children', title: '13. Children\'s Privacy' },
    { id: 'changes', title: '14. Policy Updates' },
    { id: 'contact', title: '15. Contact Information' },
  ];

  return (
    <LegalPageLayout
      badge="Privacy & Data Protection"
      title="Privacy Policy"
      description="This Privacy Policy outlines how Yaduvanshi Durga Puja Samiti, Kapooripur collects, uses, protects, and manages information provided by visitors, contributors, and devotees on kapooripur.in."
      tocItems={tocItems}
    >
      {/* 1. Introduction */}
      <LegalSection id="intro" number="1" title="Introduction & Scope">
        <p>
          Welcome to the official community portal (<code>kapooripur.in</code>) operated by {LEGAL_ENTITY_NAME} ("Samiti", "we", "us", or "portal").
        </p>
        <p>
          We are committed to maintaining the highest level of trust, transparency, and data privacy for all community members, contributors, and visitors. This Privacy Policy details how personal information is collected, processed, and safeguarded.
        </p>
      </LegalSection>

      {/* 2. Information We Collect */}
      <LegalSection id="collection" number="2" title="Information We Collect">
        <p>We collect only the minimum necessary information required to operate community services, maintain the memory archive, and acknowledge voluntary contributions:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>Voluntary Contributor Information:</strong> Full name, email address, optional phone number, contribution amount, and optional devotional message when you choose to support Durga Puja.
          </li>
          <li>
            <strong>Account Registration Data:</strong> Name, email address, username, profile photograph (if uploaded), and securely hashed passwords for community members who register to share memories.
          </li>
          <li>
            <strong>Contact Form Messages:</strong> Name, email address, phone number, and message inquiries submitted via our contact channels.
          </li>
          <li>
            <strong>Uploaded Archival Media:</strong> Photographs and captions voluntarily contributed to document festive moments.
          </li>
          <li>
            <strong>Technical Log Data:</strong> Standard server logs, IP addresses, request timestamps, and browser user-agent strings collected strictly for server security and spam prevention.
          </li>
        </ul>
      </LegalSection>

      {/* 3. Voluntary Contribution Information */}
      <LegalSection id="contributions" number="3" title="Voluntary Contribution Information">
        <p>
          When you make a voluntary contribution to support festival आयोजन and community activities, we collect your name, email, chosen amount, and message so that we can generate an electronic confirmation receipt and properly attribute your support.
        </p>
      </LegalSection>

      {/* 4. Payment Processing */}
      <LegalSection id="payment-sec" number="4" title="Payment Processing & Third-Party Gateways">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs sm:text-sm text-dark-900 space-y-2">
          <p className="font-bold text-maroon-900">
            Crucial Distinction Regarding Payment Data:
          </p>
          <p>
            Online payment transactions, when active, are processed entirely by authorized, RBI-licensed payment aggregators.
          </p>
          <p>
            <strong>{LEGAL_ENTITY_NAME} and the website <code>kapooripur.in</code> never store, process, or have access to your credit card numbers, debit card details, CVV codes, net banking passwords, or UPI PINs.</strong> All sensitive payment credentials are entered directly into the payment gateway's secure, encrypted TLS environment.
          </p>
        </div>
      </LegalSection>

      {/* 5. Community Support Wall Consent */}
      <LegalSection id="wall-consent" number="5" title="Community Support Wall & Public Consent">
        <p>
          To maintain transparency, the portal features a Community Support Wall / Contributors Wall. The public display of your information is strictly consent-driven:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>Affirmative Consent:</strong> Your name and contribution amount will only be displayed publicly on the website or Mandap TV screen if you have actively checked the consent box (<i>"I agree to the public display of my name and contribution amount"</i>).
          </li>
          <li>
            <strong>Anonymous Contribution Option:</strong> You can select the <i>"Donate Anonymously"</i> option to keep your name and identity completely hidden from public listings.
          </li>
          <li>
            <strong>Protected Details:</strong> We never publicly display your email address, phone number, order ID, or payment transaction IDs.
          </li>
        </ul>
      </LegalSection>

      {/* 6. Contact Data */}
      <LegalSection id="contact-data" number="6" title="Contact Form & Inquiries">
        <p>
          When you communicate with the Samiti via our contact form or official email, your contact details are used solely to respond to your question, feedback, or grievance. We do not use contact form submissions for unsolicited promotional marketing.
        </p>
      </LegalSection>

      {/* 7. Uploaded Memories */}
      <LegalSection id="memories" number="7" title="Uploaded Archive Memories & Image Processing">
        <p>
          The portal allows devotees to upload historical and current Durga Puja photos. For user privacy and security:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>EXIF metadata, device serial numbers, and camera GPS coordinates are stripped upon upload via our automated image sanitization pipeline.</li>
          <li>Images are converted to optimized WebP format for fast, secure delivery.</li>
        </ul>
      </LegalSection>

      {/* 8. Cookies */}
      <LegalSection id="cookies" number="8" title="Cookies & Technical Logs">
        <p>
          We use strictly necessary HTTP-only session cookies to authenticate logged-in users and secure administrative actions. We do not use third-party behavioral advertising cookies.
        </p>
      </LegalSection>

      {/* 9. Data Sharing */}
      <LegalSection id="sharing" number="9" title="Data Sharing & Third-Party Service Providers">
        <p>
          We do not sell, rent, or trade personal data to commercial data brokers. Information is shared only with trusted technical infrastructure providers necessary to operate the platform (e.g., Cloudflare for CDN/DDoS protection, MongoDB Atlas for secure database storage, and Brevo for transactional receipt emails).
        </p>
      </LegalSection>

      {/* 10. Data Retention */}
      <LegalSection id="retention" number="10" title="Data Retention">
        <p>
          Account and memory data are retained as part of the historical festival archive until requested for removal by the author or committee administration. Financial accounting logs of contributions are retained for audit and verification purposes in compliance with applicable standards.
        </p>
      </LegalSection>

      {/* 11. Security */}
      <LegalSection id="security" number="11" title="Data Security Measures">
        <p>
          We employ industry-standard administrative, physical, and technical safeguards, including HTTPS (SSL/TLS encryption), cryptographic password hashing (Bcrypt), strict API rate limiting, and secure server headers.
        </p>
      </LegalSection>

      {/* 12. User Rights */}
      <LegalSection id="user-rights" number="12" title="User Rights & Data Deletion Requests">
        <p>
          Community members have the right to request access to, correction of, or deletion of their personal data or uploaded photographs. To request data deletion or update, please email <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      {/* 13. Children */}
      <LegalSection id="children" number="13" title="Children's Privacy">
        <p>
          This is a family-oriented community website. We do not knowingly collect personal information from children under 13 without parental or guardian knowledge.
        </p>
      </LegalSection>

      {/* 14. Changes */}
      <LegalSection id="changes" number="14" title="Policy Updates">
        <p>
          The Samiti may update this Privacy Policy periodically to reflect operational, legal, or regulatory enhancements. Any changes will be posted on this page with the updated revision date.
        </p>
      </LegalSection>

      {/* 15. Contact */}
      <LegalSection id="contact" number="15" title="Contact Information">
        <p>
          For questions, concerns, or requests regarding this Privacy Policy or your data, please contact:
        </p>
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 space-y-1.5 text-xs font-body">
          <p className="font-bold text-dark-950">{LEGAL_ENTITY_NAME}</p>
          <p>Address: {LOCATION_TEXT}</p>
          <p>
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="pt-1">
            Online Contact Form:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Contact Us →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
