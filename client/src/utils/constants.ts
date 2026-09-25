export const SITE_NAME = 'यदुवंशी दुर्गा पूजा कपूरिपुर';
export const SITE_SUBTITLE = 'डिजिटल स्मृति संचय';
export const SITE_DOMAIN = 'yaduvashidurgapujakapooripur.online';
export const CANONICAL_BASE_URL = 'https://yaduvashidurgapujakapooripur.online';

export const CONTACT_EMAIL = 'contact@yaduvashidurgapujakapooripur.online';
export const LEGAL_ENTITY_NAME = 'यदुवंशी दुर्गा पूजा समिति, कपूरिपुर';
export const EFFECTIVE_DATE = 'सितंबर २०२६ (September 2026)';
export const LOCATION_TEXT = 'कपूरिपुर, दुर्गा पूजा प्रांगण, बिहार';

export const CURRENT_YEAR = new Date().getFullYear();
export const AVAILABLE_YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => CURRENT_YEAR - i
);

export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'अनुचित या आपत्तिजनक सामग्री (Inappropriate Content)' },
  { value: 'spam', label: 'स्पैम या विज्ञापन (Spam / Promotional)' },
  { value: 'offensive', label: 'धार्मिक या सामाजिक सौहार्द बिगाड़ने वाली (Offensive)' },
  { value: 'misleading', label: 'भ्रामक या गलत जानकारी (Misleading)' },
  { value: 'other', label: 'अन्य कारण (Other)' },
];
