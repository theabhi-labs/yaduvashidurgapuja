export const SITE_NAME = 'Yaduvashi Durga Puja Kapooripur';
export const SITE_SUBTITLE = 'Digital Archive';
export const SITE_DOMAIN = 'yaduvashidurgapujakapooripur.online';
export const CANONICAL_BASE_URL = 'https://yaduvashidurgapujakapooripur.online';

export const CONTACT_EMAIL = 'contact@yaduvashidurgapujakapooripur.online';
export const LEGAL_ENTITY_NAME = 'Yaduvashi Durga Puja Committee, Kapooripur';
export const EFFECTIVE_DATE = 'September 2026';
export const LOCATION_TEXT = 'Kapooripur, Durga Puja Ground, Suriyanwa, Bhadohi';

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
