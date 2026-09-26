import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME, LOCATION_TEXT } from '../utils/constants';

export const ContributionPolicy: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'purpose', title: '1. Purpose of Contributions' },
    { id: 'voluntary', title: '2. Voluntary Nature' },
    { id: 'categories', title: '3. Utilization Categories' },
    { id: 'processing', title: '4. Payment Processing' },
    { id: 'failed-tx', title: '5. Failed & Duplicate Transactions' },
    { id: 'refund', title: '6. Refund & Cancellation Policy' },
    { id: 'privacy', title: '7. Contributor Privacy & Consent' },
    { id: 'contact', title: '8. Contact & Assistance' },
  ];

  return (
    <LegalPageLayout
      badge="Transparency & Governance"
      title="Contribution Policy"
      description="Clear, transparent terms regarding voluntary community contributions towards the organization of Durga Puja and related cultural activities by Yaduvanshi Durga Puja Samiti, Kapooripur."
      tocItems={tocItems}
    >
      {/* 1. Purpose */}
      <LegalSection id="purpose" number="1" title="Purpose of Contributions">
        <p>
          {LEGAL_ENTITY_NAME} ("Samiti", "we", "us") is a local community initiative responsible for organizing the annual Durga Puja festival, devotional ceremonies, and related cultural events in Kapooripur.
        </p>
        <p>
          Community members, devotees, and well-wishers may voluntarily contribute funds through this website (<code>kapooripur.in</code>) to assist in covering the genuine costs of organizing and managing the Durga Puja celebration and community welfare arrangements.
        </p>
      </LegalSection>

      {/* 2. Voluntary Nature */}
      <LegalSection id="voluntary" number="2" title="Voluntary Nature of Contributions">
        <p>
          All contributions made through this portal are strictly voluntary. They do not constitute:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>A commercial purchase of goods, merchandise, or services.</li>
          <li>An investment, financial instrument, or profit-yielding arrangement.</li>
          <li>A contractual fee for guaranteed personal material benefits.</li>
        </ul>
        <p className="pt-1">
          Contributions are given willingly by individuals who wish to support the religious, cultural, and community traditions of Kapooripur Durga Puja.
        </p>
      </LegalSection>

      {/* 3. Utilization Categories */}
      <LegalSection id="categories" number="3" title="Utilization Categories">
        <p>
          Voluntary contributions are allocated strictly towards legitimate expenses associated with organizing Durga Puja and community programs, subject to the Samiti's actual operational requirements:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300">
            <h4 className="font-bold text-dark-950 text-xs sm:text-sm mb-1">🪔 Puja & Ritual Arrangements</h4>
            <p className="text-xs text-muted">Vedic rituals, priest honorarium, daily puja samagri, havan, and sacred offerings.</p>
          </div>
          <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300">
            <h4 className="font-bold text-dark-950 text-xs sm:text-sm mb-1">🎪 Pandal & Venue Infrastructure</h4>
            <p className="text-xs text-muted">Devotional pandal construction, safety barricading, seating, and weather protection.</p>
          </div>
          <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300">
            <h4 className="font-bold text-dark-950 text-xs sm:text-sm mb-1">🍲 Mahaprasad & Bhandara</h4>
            <p className="text-xs text-muted">Community feast preparation, daily prasad distribution, and clean drinking water facilities.</p>
          </div>
          <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300">
            <h4 className="font-bold text-dark-950 text-xs sm:text-sm mb-1">💡 Lighting & Sound Management</h4>
            <p className="text-xs text-muted">Temple lighting, eco-friendly illuminations, public address sound systems, and backup generators.</p>
          </div>
        </div>
      </LegalSection>

      {/* 4. Payment Processing */}
      <LegalSection id="processing" number="4" title="Payment Processing & Security">
        <p>
          Online contributions, when enabled, are processed securely through authorized, RBI-compliant third-party payment aggregators. Supported payment channels include UPI, Net Banking, Debit Cards, and Credit Cards.
        </p>
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-dark-900 space-y-1">
          <p className="font-bold text-maroon-900">Important Security Clarification:</p>
          <p>
            {LEGAL_ENTITY_NAME} and the website <code>kapooripur.in</code> do <strong>not</strong> collect, store, or process your credit/debit card numbers, CVV codes, UPI PINs, or net banking passwords. All sensitive payment credential entry occurs directly inside the secure, encrypted interface of the payment provider.
          </p>
        </div>
      </LegalSection>

      {/* 5. Failed Transactions */}
      <LegalSection id="failed-tx" number="5" title="Failed & Duplicate Transactions">
        <p>
          In rare circumstances, a technical glitch, network failure, or bank timeout may occur during payment:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>Amount debited but confirmation pending:</strong> Banking networks typically resolve pending status within 24 to 48 hours. If the transaction fails, your bank will automatically reverse the amount back to your original source account within 5–7 working days as per standard banking guidelines.
          </li>
          <li>
            <strong>Duplicate deduction:</strong> If your account is debited twice for a single intended contribution due to multiple clicks or network delays, please contact us immediately with your transaction date and payment ID.
          </li>
        </ul>
      </LegalSection>

      {/* 6. Refund & Cancellation */}
      <LegalSection id="refund" number="6" title="Refund & Cancellation Policy">
        <p>
          Because voluntary contributions are immediately allocated towards ongoing vendor bookings, idol craftsmanship, tent construction, and festival materials, <strong>voluntary contributions are ordinarily non-refundable</strong> once successfully credited.
        </p>
        <p className="font-semibold text-dark-950 pt-1">
          Exceptions & Erroneous Transactions:
        </p>
        <p>
          If an unintentional or duplicate transaction occurred in error, the contributor must notify the Samiti within <strong>7 calendar days</strong> of the transaction date. Please submit your request via email to <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">{CONTACT_EMAIL}</a> with:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
          <li>Contributor Name and Email address</li>
          <li>Payment Date and Exact Amount</li>
          <li>Transaction ID / Bank Reference Number</li>
          <li>Reason for the correction request</li>
        </ul>
        <p className="text-xs text-muted pt-1">
          Upon verification of duplicate or erroneous credit, the Samiti will initiate a reversal through the payment gateway back to the original source account.
        </p>
      </LegalSection>

      {/* 7. Privacy & Consent */}
      <LegalSection id="privacy" number="7" title="Contributor Privacy & Community Wall Consent">
        <p>
          Contributors have full control over how their support is acknowledged:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Consent-based Public Display:</strong> A contributor's name, profile photo, and contribution amount will only be displayed on the public Community Support Wall / TV screen if the contributor has explicitly provided affirmative consent via the provided checkboxes.
          </li>
          <li>
            <strong>Anonymous Option:</strong> Contributors may check the "Donate Anonymously" option, ensuring their personal identity remains confidential.
          </li>
          <li>
            <strong>Zero Public Exposure of Private Credentials:</strong> Phone numbers, email addresses, order IDs, and payment references are never disclosed on public walls.
          </li>
        </ul>
      </LegalSection>

      {/* 8. Contact & Assistance */}
      <LegalSection id="contact" number="8" title="Contact & Assistance">
        <p>
          For any questions, clarifications, or assistance regarding your voluntary contribution, please reach out to the Samiti:
        </p>
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 space-y-2 text-xs font-body">
          <p className="font-bold text-dark-950">{LEGAL_ENTITY_NAME}</p>
          <p>Location: {LOCATION_TEXT}</p>
          <p>
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="pt-1">
            Online Contact Form:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              Visit Contact Page →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default ContributionPolicy;
