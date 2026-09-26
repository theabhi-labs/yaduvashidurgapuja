export const SITE_NAME = 'Yaduvanshi Durga Puja Samiti, Kapooripur';
export const SITE_SUBTITLE = 'Community Initiative & Cultural Heritage';
export const SITE_TAGLINE = 'Celebrating Maa Durga with devotion, tradition, culture and community.';
export const SITE_DOMAIN = 'kapooripur.in';
export const CANONICAL_BASE_URL = 'https://www.kapooripur.in';

export const CONTACT_EMAIL = 'contact@kapooripur.in';
export const OFFICIAL_PHONE = '+91 94528 29755';
export const LEGAL_ENTITY_NAME = 'Yaduvanshi Durga Puja Samiti, Kapooripur';
export const EFFECTIVE_DATE = 'September 2026';
export const LOCATION_TEXT = 'Kapooripur, Durga Puja Ground, Suriyanwa, Bhadohi, Uttar Pradesh - 221404';

export const CURRENT_YEAR = new Date().getFullYear();
export const AVAILABLE_YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => CURRENT_YEAR - i
);

export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate or Unrelated Content' },
  { value: 'spam', label: 'Spam or Promotional' },
  { value: 'offensive', label: 'Offensive or Disrespectful' },
  { value: 'misleading', label: 'Misleading Information' },
  { value: 'other', label: 'Other Reason' },
];
