import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME } from '../utils/constants';

export const TermsConditions: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'acceptance', title: 'नियमों की स्वीकृति (Acceptance of Terms)' },
    { id: 'platform', title: 'मंच का परिचय एवं स्वरूप (About the Platform)' },
    { id: 'accounts', title: 'उपयोगकर्ता खाते (User Accounts)' },
    { id: 'uploads', title: 'स्मृति अपलोड के नियम (Memory Upload Rules)' },
    { id: 'ownership', title: 'स्वामित्व एवं सर्वाधिकार (Content Ownership)' },
    { id: 'public-view', title: 'सार्वजनिक स्मृतियाँ (Public Memories)' },
    { id: 'moderation', title: 'सामग्री मॉडरेशन एवं रिपोर्ट (Content Moderation)' },
    { id: 'prohibited', title: 'प्रतिबंधित गतिविधियां (Prohibited Activities)' },
    { id: 'availability', title: 'सेवा की निरंतरता (Service Availability)' },
    { id: 'third-party', title: 'तृतीय-पक्ष सेवाएं (Third-Party Services)' },
    { id: 'modifications', title: 'शर्तों में परिवर्तन (Changes to Terms)' },
    { id: 'contact', title: 'संपर्क सूत्र (Contact Us)' },
  ];

  return (
    <LegalPageLayout
      badge="नियम एवं शर्तें"
      titleHindi="नियम एवं शर्तें (Terms & Conditions)"
      titleEnglish="Terms of use for Yaduvashi Durga Puja Kapoori Pur Memory Archive"
      description="यदुवंशी दुर्गा पूजा कपूरिपुर के डिजिटल स्मृति संचय पोर्टल का उपयोग करने से पूर्व कृपया इन नियमों एवं शर्तों को ध्यानपूर्वक पढ़ें।"
      tocItems={tocItems}
    >
      {/* 1. Acceptance */}
      <LegalSection id="acceptance" number="1" title="नियमों की स्वीकृति (Acceptance of Terms)">
        <p>
          इस वेबसाइट (<code>yaduvashidurgapujakapooripur.online</code>) का उपयोग अथवा इस पर किसी भी स्मृति/तस्वीर का प्रकाशन यह पुष्टि करता है कि आप इन नियमों एवं शर्तों तथा हमारी गोपनीयता नीति से पूर्णतः सहमत हैं।
        </p>
        <p>
          यदि आप इनमें से किसी भी शर्त से असहमत हैं, तो कृपया पोर्टल का उपयोग अथवा सामग्री अपलोड न करें।
        </p>
      </LegalSection>

      {/* 2. About Platform */}
      <LegalSection id="platform" number="2" title="मंच का परिचय एवं स्वरूप (About the Platform)">
        <p>
          यह पोर्टल {LEGAL_ENTITY_NAME} द्वारा संचालित एक सांस्कृतिक एवं गैर-व्यावसायिक डिजिटल स्मृति संचय (Digital Memory Archive) है।
        </p>
        <p>
          इसका एकमात्र उद्देश्य कपूरिपुर में आयोजित होने वाली ऐतिहासिक दुर्गा पूजा की स्मृतियों, परंपराओं, मूर्तियों, पंडालों और भक्तों के पावन संस्मरणों को भविष्य की पीढ़ियों के लिए गरिमापूर्वक संरक्षित करना है। यह कोई सोशल मीडिया या व्यावसायिक मंच नहीं है।
        </p>
      </LegalSection>

      {/* 3. User Accounts */}
      <LegalSection id="accounts" number="3" title="उपयोगकर्ता खाते (User Accounts)">
        <p>स्मृति साझा करने हेतु खाता निर्माण करते समय उपयोगकर्ता निम्नलिखित का पालन करने हेतु वचनबद्ध हैं:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>पंजीकरण के समय केवल सही एवं प्रामाणिक जानकारी (नाम एवं वैध ईमेल) दर्ज करें।</li>
          <li>अपने खाते के पासवर्ड की गोपनीयता बनाए रखने के लिए आप स्वयं उत्तरदायी हैं।</li>
          <li>किसी अन्य व्यक्ति अथवा संस्था के नाम का दुरुपयोग (Impersonation) करना पूर्णतः वर्जित है।</li>
          <li>नियमों के गंभीर उल्लंघन की स्थिति में व्यवस्थापक खाते को निलंबित (Suspend) कर सकते हैं।</li>
        </ul>
      </LegalSection>

      {/* 4. Memory Upload Rules */}
      <LegalSection id="uploads" number="4" title="स्मृति अपलोड के नियम (Memory Upload Rules)">
        <p>
          भक्त केवल वही तस्वीरें व संस्मरण अपलोड कर सकते हैं जिनका संबंध <strong>यदुवंशी दुर्गा पूजा कपूरिपुर</strong> से हो और जिन्हें साझा करने का उचित अधिकार अथवा अनुमति उनके पास हो।
        </p>
        <p className="font-semibold text-maroon-900">निम्नलिखित प्रकार की सामग्री अपलोड करना सख्त प्रतिबंधित है:</p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-red-950">
          <li>धार्मिक, सामाजिक अथवा सामुदायिक सौहार्द बिगाड़ने वाली कोई भी अनुचित सामग्री।</li>
          <li>अश्लील, अपमानजनक, हिंसक, धमकी भरी अथवा गैर-कानूनी तस्वीरें या टिप्पणियां।</li>
          <li>व्यावसायिक विज्ञापन, स्पैम, प्रचार सामग्री अथवा अप्रासंगिक चित्र।</li>
          <li>किसी तीसरे पक्ष के कॉपीराइट, ट्रेडमार्क अथवा निजता का उल्लंघन करने वाली सामग्री।</li>
          <li>भ्रामक या असत्य ऐतिहासिक दावे।</li>
        </ul>
      </LegalSection>

      {/* 5. Content Ownership */}
      <LegalSection id="ownership" number="5" title="स्वामित्व एवं सर्वाधिकार (Content Ownership & Rights)">
        <div className="space-y-2">
          <p>
            <strong>उपयोगकर्ता सामग्री:</strong> आपके द्वारा अपलोड की गई तस्वीरों और संस्मरणों का मूल स्वामित्व आपके पास ही रहता है। सामग्री अपलोड करके आप पोर्टल को उस सामग्री को केवल इस डिजिटल अभिलेखागार में प्रदर्शित एवं संरक्षित करने का एक गैर-विशिष्ट, निःशुल्क अधिकार प्रदान करते हैं।
          </p>
          <p>
            <strong>पोर्टल सामग्री:</strong> पोर्टल का डिज़ाइन, लेआउट, सॉफ्टवेयर कोड, लोगो, ब्रांडिंग और आधिकारिक पाठ्य सामग्री {LEGAL_ENTITY_NAME} के सर्वाधिकार में सुरक्षित है।
          </p>
        </div>
      </LegalSection>

      {/* 6. Public Memories */}
      <LegalSection id="public-view" number="6" title="सार्वजनिक स्मृतियाँ (Public Memories)">
        <p>
          स्मृति प्रकाशित करते समय यह स्वीकार किया जाता है कि वह तस्वीर व संस्मरण सार्वजनिक मेमोरी गैलरी में प्रदर्शित होगी। कोई भी आगंतुक इसे देख सकता है तथा दिए गए शेयर बटनों (जैसे व्हाट्सएप अथवा लिंक शेयर) के माध्यम से अन्य भक्तों के साथ साझा कर सकता है।
        </p>
      </LegalSection>

      {/* 7. Content Moderation */}
      <LegalSection id="moderation" number="7" title="सामग्री मॉडरेशन एवं रिपोर्ट (Content Moderation & Reporting)">
        <p>
          अभिलेखागार की शुचिता एवं मर्यादा सुनिश्चित करने हेतु पूजा समिति एवं व्यवस्थापक किसी भी अपलोड की गई सामग्री की समीक्षा कर सकते हैं। समिति को निम्नलिखित पूर्ण अधिकार प्राप्त हैं:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>नियमों का उल्लंघन करने वाली किसी भी तस्वीर को छिपाने (Hide) अथवा स्थायी रूप से हटाने (Delete) का अधिकार।</li>
          <li>उपयोगकर्ताओं द्वारा दर्ज की गई रिपोर्टों की समीक्षा कर उचित कार्यवाही करने का अधिकार।</li>
          <li>उल्लंघनकारी उपयोगकर्ताओं के अपलोड अधिकार सीमित अथवा निलंबित करने का अधिकार।</li>
        </ul>
      </LegalSection>

      {/* 8. Prohibited Activities */}
      <LegalSection id="prohibited" number="8" title="प्रतिबंधित गतिविधियां (Prohibited Activities)">
        <p>पोर्टल के उपयोगकर्ताओं को निम्नलिखित कार्यों में संलग्न होने की अनुमति नहीं है:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>सर्वर, डेटाबेस अथवा प्रमाणीकरण प्रणाली पर किसी प्रकार का साइबर हमला या अनधिकृत प्रवेश का प्रयास करना।</li>
          <li>स्वचालित बॉट्स, स्क्रैपर्स अथवा स्क्रिप्ट्स द्वारा डेटा संकलन करना।</li>
          <li>पोर्टल के सामान्य संचालन में किसी भी प्रकार का व्यवधान उत्पन्न करना।</li>
        </ul>
      </LegalSection>

      {/* 9. Service Availability */}
      <LegalSection id="availability" number="9" title="सेवा की निरंतरता (Service Availability)">
        <p>
          हम पोर्टल को सुचारू रूप से संचालित रखने का हर संभव प्रयास करते हैं। तथापि, तकनीकी रखरखाव, सर्वर अपडेट अथवा अप्रत्याशित तकनीकी समस्याओं के कारण वेबसाइट अस्थायी रूप से अनुपलब्ध हो सकती है। इसके लिए समिति किसी भी प्रकार के हर्जाने हेतु उत्तरदायी नहीं होगी।
        </p>
      </LegalSection>

      {/* 10. Third-Party Services */}
      <LegalSection id="third-party" number="10" title="तृतीय-पक्ष सेवाएं (Third-Party Services)">
        <p>
          पोर्टल की होस्टिंग, डेटाबेस अवसंरचना और इमेज स्टोरेज हेतु मानक क्लाउड प्रदाताओं की सेवाएं ली जाती हैं। उन सेवाओं के अपने स्वतंत्र नियम एवं सुरक्षा नीतियां लागू हो सकती हैं।
        </p>
      </LegalSection>

      {/* 11. Changes to Terms */}
      <LegalSection id="modifications" number="11" title="शर्तों में परिवर्तन (Changes to Terms)">
        <p>
          समिति आवश्यकतानुसार इन नियमों एवं शर्तों को अद्यतित करने का अधिकार सुरक्षित रखती है। संशोधित शर्तें इस पृष्ठ पर प्रकाशित होते ही प्रभावी मानी जाएंगी।
        </p>
      </LegalSection>

      {/* 12. Contact Us */}
      <LegalSection id="contact" number="12" title="संपर्क सूत्र (Contact Us)">
        <p>
          यदि इन नियमों एवं शर्तों से संबंधित आपका कोई प्रश्न, आपत्ति अथवा सुझाव है, तो कृपया समिति से संपर्क करें:
        </p>
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 space-y-1.5 text-xs font-devanagari-body">
          <p className="font-bold text-dark-950">{LEGAL_ENTITY_NAME}</p>
          <p>
            ईमेल:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-maroon-800 underline font-mono">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            ऑनलाइन संपर्क फॉर्म:{' '}
            <Link to="/contact" className="text-maroon-800 underline font-semibold">
              यहाँ संदेश भेजें →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};
