import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME } from '../utils/constants';

export const PrivacyPolicy: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'memories', title: '3. Uploaded Memories' },
    { id: 'usage', title: '4. How We Use Information' },
    { id: 'cookies', title: '5. Cookies & Authentication' },
    { id: 'images', title: '6. Image Processing & Privacy' },
    { id: 'sharing', title: '7. Data Sharing' },
    { id: 'retention', title: '8. Data Retention' },
    { id: 'rights', title: '9. User Rights' },
    { id: 'security', title: '10. Security Practices' },
    { id: 'children', title: '11. Children\'s Privacy' },
    { id: 'changes', title: '12. Policy Updates' },
    { id: 'contact', title: '13. Contact Us' },
  ];

  return (
    <LegalPageLayout
      badge="Privacy & Security"
      titleHindi="Privacy Policy"
      titleEnglish="How we protect and manage your data on Yaduvanshi Durga Puja Archive"
      description="This Privacy Policy outlines how Yaduvanshi Durga Puja Kapooripur collects, protects, uses, and displays your account details and contributed photographs."
      tocItems={tocItems}
    >
      {/* 1. Introduction */}
      <LegalSection id="intro" number="1" title="Introduction">
        <p>
          Welcome to the official digital portal (<code>yaduvashidurgapujakapooripur.online</code>) managed by {LEGAL_ENTITY_NAME} ("we", "our committee", or "portal").
        </p>
        <p>
          Our platform is a sacred digital memory archive. We fully respect the privacy and dignity of our devotees and visitors, adhering to transparent data protection practices.
        </p>
      </LegalSection>

      {/* 2. Information We Collect */}
      <LegalSection id="collection" number="2" title="Information We Collect">
        <p>We collect only the minimum necessary information required to operate the portal and maintain the digital archive:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>Account Registration Data:</strong> Your full name, email address, and securely hashed (Bcrypt) password.
          </li>
          <li>
            <strong>Memory Submissions:</strong> Photographs voluntarily uploaded by you, accompanying captions, and festival years.
          </li>
          <li>
            <strong>Contact & Report Inquiries:</strong> Messages, feedback, or content violation reports submitted through our forms.
          </li>
          <li>
            <strong>Technical Logs:</strong> IP address, request timestamps, and browser user agent for security and rate-limiting.
          </li>
        </ul>
      </LegalSection>

      {/* 3. Uploaded Memories */}
      <LegalSection id="memories" number="3" title="Uploaded Memories">
        <p>
          This portal is a public community archive. When a registered devotee publishes a photograph and caption, the image, text description, festival year, and contributor's <strong>Display Name</strong> become visible to all website visitors.
        </p>
        <p className="p-3 bg-cream-100 rounded-xl border border-gold-400/40 text-gold-950">
          <strong>Important:</strong> Your private email address, encrypted password, and internal account IDs are never exposed on public memory cards or pages.
        </p>
      </LegalSection>

      {/* 4. How We Use Information */}
      <LegalSection id="usage" number="4" title="How We Use Information">
        <p>We utilize the collected information strictly for legitimate festival and archival purposes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>User registration, authentication, and secure session management.</li>
          <li>Cataloging and presenting annual Durga Puja festival memories chronologically.</li>
          <li>Facilitating secure password resets and necessary service notifications.</li>
          <li>Content moderation, spam prevention, and reviewing flagged submissions.</li>
          <li>Responding promptly to user support inquiries and feedback.</li>
        </ul>
      </LegalSection>

      {/* 5. Cookies & Authentication */}
      <LegalSection id="cookies" number="5" title="Cookies & Authentication">
        <p>
          We use <strong>Secure HTTP-Only Cookies</strong> strictly for user authentication:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Cookies store signed JSON Web Tokens (JWT) for authenticated sessions.</li>
          <li>HTTP-Only flags prevent access via browser JavaScript, safeguarding against XSS vulnerabilities.</li>
          <li>We never store authentication tokens in vulnerable browser <code>localStorage</code>.</li>
          <li>We do not employ third-party advertising or commercial tracking cookies.</li>
        </ul>
      </LegalSection>

      {/* 6. Image Processing & Privacy */}
      <LegalSection id="images" number="6" title="Image Processing & EXIF Sanitization">
        <p>
          For your privacy and device security, our server utilizes an automated <strong>Sharp image processing pipeline</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>EXIF / GPS Stripping:</strong> Camera metadata, GPS geolocation tags, and device identifiers are stripped immediately upon upload.
          </li>
          <li>
            <strong>WebP Optimization:</strong> Images are converted and compressed into modern WebP format for fast loading and reduced bandwidth consumption.
          </li>
          <li>
            <strong>File Type Validation:</strong> Only validated JPG, PNG, and WebP images are permitted; arbitrary or executable files are rejected automatically.
          </li>
        </ul>
      </LegalSection>

      {/* 7. Data Sharing */}
      <LegalSection id="sharing" number="7" title="Data Sharing">
        <p>
          We do not sell, rent, or trade your personal information or email addresses to any advertisers or third-party brokers. Data is processed exclusively by our trusted infrastructure providers (Cloudflare R2, MongoDB Atlas, and hosting servers) solely to deliver this service.
        </p>
      </LegalSection>

      {/* 8. Data Retention */}
      <LegalSection id="retention" number="8" title="Data Retention">
        <p>
          The archival goal is long-term historical preservation. Published memories remain preserved until deleted by the author or removed by the committee administration. When you delete a memory, its associated image and records are purged.
        </p>
      </LegalSection>

      {/* 9. User Rights */}
      <LegalSection id="rights" number="9" title="User Rights & Controls">
        <p>Every registered devotee has full control over their contributed content:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Access the 'My Memories' section to review, manage, or delete your submissions at any time.</li>
          <li>Submit report flags against inappropriate or unauthorized content.</li>
          <li>Contact the committee administration to request account assistance or data updates.</li>
        </ul>
      </LegalSection>

      {/* 10. Security Practices */}
      <LegalSection id="security" number="10" title="Security Practices">
        <p>We implement industry-standard protective measures:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Full end-to-end SSL/TLS encryption across all communications (HTTPS).</li>
          <li>Cryptographic password hashing using Bcrypt with salt rounds.</li>
          <li>Automated rate-limiting on authentication and sensitive endpoints to thwart brute-force attacks.</li>
          <li>Robust security headers (Helmet) and strict input validation (Zod schemas).</li>
        </ul>
      </LegalSection>

      {/* 11. Children's Privacy */}
      <LegalSection id="children" number="11" title="Children's Privacy">
        <p>
          This website serves a family-friendly devotional community. We do not intentionally collect personal information from minors. Family photos containing children must be uploaded with parental or guardian knowledge and consent.
        </p>
      </LegalSection>

      {/* 12. Policy Updates */}
      <LegalSection id="changes" number="12" title="Policy Updates">
        <p>
          We may revise this Privacy Policy periodically to reflect technological updates or legal requirements. Updated versions will be published directly on this page with the revised effective date.
        </p>
      </LegalSection>

      {/* 13. Contact Us */}
      <LegalSection id="contact" number="13" title="Contact Us">
        <p>
          If you have questions regarding this Privacy Policy, your uploaded photos, or account data, please reach out:
        </p>
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 space-y-1.5 text-xs font-body">
          <p className="font-bold text-dark-950">{LEGAL_ENTITY_NAME}</p>
          <p>
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Online Contact Form:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Click Here →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};
