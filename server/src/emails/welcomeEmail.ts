import { ENV } from '../config/env';

export const getWelcomeEmailHtml = (userName: string): string => {
  const websiteUrl = ENV.CLIENT_URL || 'https://yaduvashidurgapujakapooripur.online';

  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>यदुवंशी दुर्गा पूजा कपूरिपुर में आपका स्वागत है</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f3ea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3ea; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 25px rgba(112, 12, 12, 0.1); border: 1px solid #e8dfcf;">
          
          <!-- Sacred Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #460C11 0%, #700c0c 50%, #8b1313 100%); padding: 35px 20px; color: #ffffff; border-bottom: 4px solid #d97706;">
              <div style="font-size: 32px; margin-bottom: 8px;">🪔</div>
              <p style="margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #fde68a; font-weight: 600;">॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</p>
              <h1 style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #ffffff;">डिजिटल स्मृति संचय में स्वागत है</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1c1917;">
                सादर प्रणाम, <strong>${userName}</strong> जी,
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #44403c;">
                माँ जगदम्बा की असीम कृपा से आपका पंजीकरण <strong>यदुवंशी दुर्गा पूजा कपूरिपुर डिजिटल अभिलेखागार</strong> में सफलतापूर्वक हो गया है।
              </p>

              <!-- Devotional Highlight Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdfbf7; border-left: 4px solid #d97706; border-radius: 8px; margin-bottom: 25px; border-top: 1px solid #f3ece0; border-right: 1px solid #f3ece0; border-bottom: 1px solid #f3ece0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; font-style: italic; color: #78350f; line-height: 1.6;">
                      "यादें, लोकप्रियता नहीं — कपूरिपुर की दुर्गा पूजा की पावन स्मृतियों, महाआरती और सांस्कृतिक धरोहर को संजोने का पवित्र मंच।"
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #44403c;">
                अब आप अपनी पुरानी और नई दुर्गा पूजा की तस्वीरें व संस्मरण साझा कर सकते हैं, तथा ग्राम परिवार की अनमोल स्मृतियों को देख सकते हैं।
              </p>

              <!-- Call to action button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="${websiteUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #700c0c 0%, #991b1b 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px; border: 1px solid #d97706; box-shadow: 0 4px 15px rgba(112, 12, 12, 0.25);">
                      स्मृति संचय देखें →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #78716c; text-align: center;">
                जय माँ दुर्गे! माँ दुर्गा आपके परिवार पर सदा सुख, शांति और समृद्धि बनाए रखें।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; padding: 20px 30px; text-align: center; border-top: 1px solid #e8dfcf;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #78716c; font-weight: 600;">
                यदुवंशी दुर्गा पूजा समिति, कपूरिपुर
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                यह एक स्वचालित ईमेल है। कृपया इस ईमेल का उत्तर न दें।
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
