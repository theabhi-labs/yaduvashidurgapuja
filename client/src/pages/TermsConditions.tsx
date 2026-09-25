import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME } from '../utils/constants';

export const TermsConditions: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'platform', title: '2. About the Platform' },
    { id: 'accounts', title: '3. User Accounts' },
    { id: 'uploads', title: '4. Memory Upload Rules' },
    { id: 'ownership', title: '5. Content Ownership & Rights' },
    { id: 'public-view', title: '6. Public Memories' },
    { id: 'moderation', title: '7. Content Moderation & Reporting' },
    { id: 'prohibited', title: '8. Prohibited Activities' },
    { id: 'availability', title: '9. Service Availability' },
    { id: 'third-party', title: '10. Third-Party Services' },
    { id: 'modifications', title: '11. Changes to Terms' },
    { id: 'contact', title: '12. Contact Us' },
  ];

  return (
    <LegalPageLayout
      badge="Terms & Governance"
      titleHindi="Terms & Conditions"
      titleEnglish="Terms of use for Yaduvanshi Durga Puja Kapooripur Memory Archive"
      description="Please review these terms and conditions carefully before using or contributing photographs to the Yaduvanshi Durga Puja Kapooripur digital portal."
      tocItems={tocItems}
    >
      {/* 1. Acceptance */}
      <LegalSection id="acceptance" number="1" title="Acceptance of Terms">
        <p>
          By accessing or using this website (<code>kapooripur.in</code>) and contributing photographs or memories, you signify your agreement to these Terms & Conditions and our Privacy Policy.
        </p>
        <p>
          If you do not agree with any part of these terms, please discontinue your use of the platform.
        </p>
      </LegalSection>

      {/* 2. About Platform */}
      <LegalSection id="platform" number="2" title="About the Platform">
        <p>
          This portal is a cultural, non-commercial digital memory archive operated by {LEGAL_ENTITY_NAME}.
        </p>
        <p>
          Its sole purpose is to preserve and celebrate the rich heritage, traditions, idol craftsmanship, pandals, Maha Arti moments, and devotional experiences of the annual Kapooripur Durga Puja festival for future generations.
        </p>
      </LegalSection>

      {/* 3. User Accounts */}
      <LegalSection id="accounts" number="3" title="User Accounts">
        <p>When creating an account to share memories, users agree to the following obligations:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Provide authentic and accurate details (valid full name and active email address).</li>
          <li>Maintain the confidentiality and security of your account credentials.</li>
          <li>Impersonation of any individual, organization, or committee member is strictly forbidden.</li>
          <li>The administration reserves the right to suspend accounts violating community standards.</li>
        </ul>
      </LegalSection>

      {/* 4. Memory Upload Rules */}
      <LegalSection id="uploads" number="4" title="Memory Upload Rules">
        <p>
          Devotees may upload photographs and remembrances solely related to <strong>Yaduvanshi Durga Puja Kapooripur</strong>, for which they possess legitimate rights or consent.
        </p>
        <p className="font-semibold text-maroon-900">The following content is strictly prohibited:</p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-red-950">
          <li>Content that harms religious, communal, or social harmony.</li>
          <li>Vulgar, defamatory, violent, threatening, or illegal photographs and text.</li>
          <li>Commercial advertisements, spam, promotional campaigns, or unrelated media.</li>
          <li>Media infringing on third-party copyrights, trademarks, or privacy rights.</li>
          <li>Misleading, falsified, or abusive historical claims.</li>
        </ul>
      </LegalSection>

      {/* 5. Content Ownership */}
      <LegalSection id="ownership" number="5" title="Content Ownership & Rights">
        <div className="space-y-2">
          <p>
            <strong>User Submissions:</strong> You retain ownership of the photos and captions you upload. By submitting content, you grant {LEGAL_ENTITY_NAME} a non-exclusive, royalty-free license to display, optimize, and archive the media on this digital platform.
          </p>
          <p>
            <strong>Platform IP:</strong> The portal's branding, layout, custom code, graphics, and official text content remain the intellectual property of {LEGAL_ENTITY_NAME}.
          </p>
        </div>
      </LegalSection>

      {/* 6. Public Memories */}
      <LegalSection id="public-view" number="6" title="Public Memories">
        <p>
          Submitting a memory implies acknowledgement that the photo, caption, festival year, and contributor name will be publicly visible in the memory archive. Visitors may share these links to celebrate the festival spirit.
        </p>
      </LegalSection>

      {/* 7. Content Moderation */}
      <LegalSection id="moderation" number="7" title="Content Moderation & Reporting">
        <p>
          To maintain the dignity and sacred character of the archive, the committee administration reviews submitted content and holds the absolute right to:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Hide or permanently delete any photograph or text violating community guidelines.</li>
          <li>Investigate reports submitted by community members and take appropriate actions.</li>
          <li>Restrict upload privileges for accounts repeatedly violating rules.</li>
        </ul>
      </LegalSection>

      {/* 8. Prohibited Activities */}
      <LegalSection id="prohibited" number="8" title="Prohibited Activities">
        <p>Users shall not engage in any of the following malicious activities:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Attempting unauthorized access to servers, databases, or API infrastructure.</li>
          <li>Scraping content using automated bots, crawlers, or scripts.</li>
          <li>Disrupting normal website operations, livestreams, or donation processes.</li>
        </ul>
      </LegalSection>

      {/* 9. Service Availability */}
      <LegalSection id="availability" number="9" title="Service Availability">
        <p>
          While we strive for high uptime and smooth operations, the platform may experience scheduled maintenance or occasional downtime. The committee bears no liability for temporary unavailability.
        </p>
      </LegalSection>

      {/* 10. Third-Party Services */}
      <LegalSection id="third-party" number="10" title="Third-Party Services">
        <p>
          We employ cloud infrastructure providers (such as Cloudflare R2, MongoDB Atlas, and payment gateways) to operate the platform. These third-party services operate under their respective terms and privacy policies.
        </p>
      </LegalSection>

      {/* 11. Changes to Terms */}
      <LegalSection id="modifications" number="11" title="Changes to Terms">
        <p>
          The committee reserves the right to modify these Terms & Conditions whenever necessary. Updated terms will take effect immediately upon publication on this page.
        </p>
      </LegalSection>

      {/* 12. Contact Us */}
      <LegalSection id="contact" number="12" title="Contact Us">
        <p>
          If you have questions, inquiries, or feedback regarding these terms, please contact us:
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
            Online Inquiry Form:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Send Message Here →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};
