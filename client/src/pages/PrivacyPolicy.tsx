import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPageLayout, TocItem } from '../components/legal/LegalPageLayout';
import { LegalSection } from '../components/legal/LegalSection';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME } from '../utils/constants';

export const PrivacyPolicy: React.FC = () => {
  const tocItems: TocItem[] = [
    { id: 'intro', title: 'प्रस्तावना (Introduction)' },
    { id: 'collection', title: 'एकत्र की जाने वाली जानकारी (Data We Collect)' },
    { id: 'memories', title: 'अपलोड की गई स्मृतियाँ (Uploaded Memories)' },
    { id: 'usage', title: 'जानकारी का उपयोग (How We Use Information)' },
    { id: 'cookies', title: 'कुकीज़ एवं प्रमाणीकरण (Cookies & Auth)' },
    { id: 'images', title: 'चित्र प्रसंस्करण एवं गोपनीयता (Image Processing)' },
    { id: 'sharing', title: 'डेटा साझाकरण (Data Sharing)' },
    { id: 'retention', title: 'डेटा संरक्षण अवधि (Data Retention)' },
    { id: 'rights', title: 'भक्त अधिकार एवं प्रबंधन (User Rights)' },
    { id: 'security', title: 'सुरक्षा मानक (Security Practices)' },
    { id: 'children', title: 'बाल गोपनीयता (Children\'s Privacy)' },
    { id: 'changes', title: 'नीति में संशोधन (Policy Updates)' },
    { id: 'contact', title: 'संपर्क सूत्र (Contact Us)' },
  ];

  return (
    <LegalPageLayout
      badge="गोपनीयता नीति"
      titleHindi="गोपनीयता नीति (Privacy Policy)"
      titleEnglish="How we protect and manage your data on Yaduvashi Durga Puja Archive"
      description="यह गोपनीयता नीति स्पष्ट करती है कि यदुवंशी दुर्गा पूजा कपूरिपुर पोर्टल पर आपके व्यक्तिगत विवरण, तस्वीरें और संस्मरण किस प्रकार सुरक्षित, प्रबंधित एवं प्रदर्शित किए जाते हैं।"
      tocItems={tocItems}
    >
      {/* 1. Introduction */}
      <LegalSection id="intro" number="1" title="प्रस्तावना (Introduction)">
        <p>
          {LEGAL_ENTITY_NAME} ("हम", "हमारी समिति" अथवा "पोर्टल") द्वारा संचालित आधिकारिक वेबसाइट (<code>yaduvashidurgapujakapooripur.online</code>) पर आपका स्वागत है।
        </p>
        <p>
          हमारा पोर्टल एक पावन डिजिटल स्मृति संचय (Digital Memory Archive) है। हम अपने उपयोगकर्ताओं और श्रद्धालुओं की व्यक्तिगत गोपनीयता का पूर्ण सम्मान करते हैं और डेटा संरक्षण हेतु पारदर्शी नीतियां अपनाते हैं।
        </p>
      </LegalSection>

      {/* 2. Information We Collect */}
      <LegalSection id="collection" number="2" title="एकत्र की जाने वाली जानकारी (Information We Collect)">
        <p>हम केवल वही जानकारी एकत्र करते हैं जो पोर्टल के संचालन एवं स्मृति संचय हेतु आवश्यक है:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>खाता पंजीकरण जानकारी:</strong> आपका पूरा नाम, ईमेल पता एवं सुरक्षित रूप से हैश (Bcrypt) किया गया पासवर्ड।
          </li>
          <li>
            <strong>स्मृति संचय सामग्री:</strong> आपके द्वारा स्वेच्छा से अपलोड की गई तस्वीरें, उनका विवरण (Caption) एवं संबंधित पूजा वर्ष (Year)।
          </li>
          <li>
            <strong>संपर्क एवं रिपोर्ट विवरण:</strong> संपर्क फॉर्म अथवा सामग्री रिपोर्ट करते समय आपके द्वारा दिया गया संदेश एवं कारण।
          </li>
          <li>
            <strong>तकनीकी लॉग:</strong> सर्वर सुरक्षा एवं दुरुपयोग रोकथाम हेतु आईपी पता, अनुरोध समय एवं ब्राउज़र का प्रकार।
          </li>
        </ul>
      </LegalSection>

      {/* 3. Uploaded Memories */}
      <LegalSection id="memories" number="3" title="अपलोड की गई स्मृतियाँ (Uploaded Memories)">
        <p>
          यह पोर्टल एक सार्वजनिक अभिलेखागार है। जब कोई पंजीकृत भक्त अपनी तस्वीर व संस्मरण प्रकाशित करता है, तो वह तस्वीर, संस्मरण, वर्ष और अपलोडकर्ता का <strong>प्रदर्शित नाम (Display Name)</strong> वेबसाइट पर सार्वजनिक रूप से सभी आगंतुकों को दिखाई देता है।
        </p>
        <p className="p-3 bg-cream-100 rounded-xl border border-gold-400/40 text-gold-950">
          <strong>महत्वपूर्ण:</strong> आपका निजी ईमेल पता, पासवर्ड अथवा आंतरिक खाता पहचान कभी भी सार्वजनिक मेमोरी कार्ड अथवा सार्वजनिक पृष्ठों पर प्रदर्शित नहीं की जाती है।
        </p>
      </LegalSection>

      {/* 4. How We Use Information */}
      <LegalSection id="usage" number="4" title="जानकारी का उपयोग (How We Use Information)">
        <p>एकत्रित जानकारी का उपयोग केवल निम्नलिखित वैधानिक व पावन उद्देश्यों के लिए किया जाता है:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>उपयोगकर्ता खाता बनाने, लॉगिन कराने एवं प्रमाणीकरण (Authentication) हेतु।</li>
          <li>दुर्गा पूजा की स्मृतियों को वर्षवार संकलित एवं प्रदर्शित करने हेतु।</li>
          <li>पासवर्ड रीसेट एवं आवश्यक सेवा संबंधी सूचनाओं के प्रेषण हेतु।</li>
          <li>सामग्री मॉडरेशन, स्पैम रोकथाम एवं अनुचित सामग्री की समीक्षा हेतु।</li>
          <li>संपर्क फॉर्म द्वारा प्राप्त प्रश्नों के उत्तर देने हेतु।</li>
        </ul>
      </LegalSection>

      {/* 5. Cookies & Authentication */}
      <LegalSection id="cookies" number="5" title="कुकीज़ एवं प्रमाणीकरण (Cookies & Authentication)">
        <p>
          हम उपयोगकर्ता सत्र (Session) को सुरक्षित रखने हेतु केवल आवश्यक <strong>सुरक्षित HTTP-Only कुकीज़ (Secure HTTP-Only Cookies)</strong> का उपयोग करते हैं:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>कुकीज़ में सुरक्षित JSON Web Token (JWT) संग्रहीत होता है।</li>
          <li>यह कुकी जावास्क्रिप्ट द्वारा सीधे एक्सेस नहीं की जा सकती (XSS हमलों से सुरक्षा)।</li>
          <li>हम प्रमाणीकरण टोकन को कभी भी ब्राउज़र के असुरक्षित <code>localStorage</code> में नहीं रखते।</li>
          <li>हम किसी भी तृतीय-पक्ष विज्ञापन ट्रैकिंग कुकीज़ का उपयोग नहीं करते हैं।</li>
        </ul>
      </LegalSection>

      {/* 6. Image Processing & Privacy */}
      <LegalSection id="images" number="6" title="चित्र प्रसंस्करण एवं मेटाडेटा निष्कासन (Image Processing)">
        <p>
          आपकी गोपनीयता और डिवाइस सुरक्षा हेतु, हमारी प्रणाली में <strong>Sharp इमेज प्रोसेसिंग पाइपलाइन</strong> कार्यरत है:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>
            <strong>EXIF / GPS मेटाडेटा निष्कासन:</strong> अपलोड होते ही तस्वीर में से कैमरा मॉडल, स्थान (GPS Geolocation), और अन्य संवेदनशील मेटाडेटा पूर्णतः हटा दिया जाता है।
          </li>
          <li>
            <strong>WebP रूपांतरण:</strong> तीव्र लोडिंग एवं सुरक्षा हेतु तस्वीरों को अनुकूलित आधुनिक WebP प्रारूप में सहेजा जाता है।
          </li>
          <li>
            <strong>फ़ाइल प्रकार सत्यापन:</strong> केवल वैध JPG, PNG और WebP चित्र ही स्वीकार किए जाते हैं; किसी भी गैर-चित्र फ़ाइल को सर्वर पर अस्वीकृत कर दिया जाता है।
          </li>
        </ul>
      </LegalSection>

      {/* 7. Data Sharing */}
      <LegalSection id="sharing" number="7" title="डेटा साझाकरण (Data Sharing)">
        <p>
          हम आपके व्यक्तिगत डेटा अथवा ईमेल को किसी भी विज्ञापनदाता, डेटा ब्रोकर अथवा तीसरे पक्ष को न तो बेचते हैं और न ही किराए पर देते हैं। डेटा केवल वेबसाइट को होस्ट करने वाले विश्वसनीय सर्वर अवसंरचना (Hosting Infrastructure) व डेटाबेस प्रदाताओं तक ही सीमित रहता है।
        </p>
      </LegalSection>

      {/* 8. Data Retention */}
      <LegalSection id="retention" number="8" title="डेटा संरक्षण अवधि (Data Retention)">
        <p>
          स्मृति अभिलेखागार का उद्देश्य दीर्घकालिक ऐतिहासिक संरक्षण है। प्रकाशित स्मृतियाँ तब तक सुरक्षित रखी जाती हैं जब तक उपयोगकर्ता अथवा व्यवस्थापक द्वारा उन्हें हटाया नहीं जाता। यदि कोई उपयोगकर्ता अपनी स्मृति हटाता है, तो संबंधित तस्वीर एवं रिकॉर्ड को हटा दिया जाता है।
        </p>
      </LegalSection>

      {/* 9. User Rights */}
      <LegalSection id="rights" number="9" title="भक्त अधिकार एवं प्रबंधन (User Rights)">
        <p>प्रत्येक पंजीकृत उपयोगकर्ता को निम्नलिखित अधिकार प्राप्त हैं:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>'मेरी यादें' (My Memories) पृष्ठ पर जाकर अपनी साझा की गई स्मृतियों को देखने, संपादित करने या हटाने का अधिकार।</li>
          <li>किसी भी अनुचित या अनधिकृत स्मृति के विरुद्ध 'रिपोर्ट' दर्ज करने का अधिकार।</li>
          <li>समिति से संपर्क कर अपने खाते अथवा सामग्री में संशोधन का अनुरोध करने का अधिकार।</li>
        </ul>
      </LegalSection>

      {/* 10. Security Practices */}
      <LegalSection id="security" number="10" title="सुरक्षा मानक (Security Practices)">
        <p>हम उद्योग-मानक सुरक्षा उपाय लागू करते हैं:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>संपूर्ण डेटा ट्रांसमिशन HTTPS एन्क्रिप्शन के माध्यम से सुरक्षित है।</li>
          <li>पासवर्ड को क्रिप्टोग्राफ़िक साल्ट के साथ Bcrypt द्वारा हैश किया जाता है।</li>
          <li>अति-अनुरोधों (Brute-force) से बचाव हेतु Rate Limiting सक्रिय है।</li>
          <li>सुरक्षा हेडर (Helmet) एवं सख्त इनपुट सैनिटाइजेशन (Zod) लागू है।</li>
        </ul>
      </LegalSection>

      {/* 11. Children's Privacy */}
      <LegalSection id="children" number="11" title="बाल गोपनीयता (Children's Privacy)">
        <p>
          यह वेबसाइट आम पारिवारिक व भक्तिमय समुदाय हेतु बनाई गई है। हम जानबूझकर नाबालिगों से कोई अनुचित या व्यक्तिगत डेटा एकत्र नहीं करते हैं। पूजा प्रांगण की पारिवारिक तस्वीरों में बच्चों की छवियां माता-पिता अथवा अभिभावकों की सहमति से ही साझा की जानी चाहिए।
        </p>
      </LegalSection>

      {/* 12. Policy Updates */}
      <LegalSection id="changes" number="12" title="नीति में संशोधन (Policy Updates)">
        <p>
          तकनीकी अथवा संगठनात्मक सुधारों के अनुसार इस नीति में समय-समय पर संशोधन किया जा सकता है। किसी भी बदलाव की स्थिति में इस पृष्ठ पर अद्यतित तिथि के साथ सूचना प्रकाशित की जाएगी।
        </p>
      </LegalSection>

      {/* 13. Contact Us */}
      <LegalSection id="contact" number="13" title="संपर्क सूत्र (Contact Us)">
        <p>
          यदि आपके पास इस गोपनीयता नीति, अपनी तस्वीर अथवा व्यक्तिगत डेटा के संबंध में कोई प्रश्न है, तो कृपया हमसे संपर्क करें:
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
              यहाँ क्लिक करें →
            </Link>
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};
