import { ENV } from '../config/env';

export interface DonationReceiptData {
  donorName: string;
  amount: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  date: string;
  message?: string;
}

export const getReceiptEmailHtml = (data: DonationReceiptData): string => {
  const websiteUrl = ENV.CLIENT_URL || 'https://kapooripur.in';

  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>पावन दान पावती रसीद — यदुवंशी दुर्गा पूजा कपूरिपुर</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f3ea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3ea; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 25px rgba(112, 12, 12, 0.1); border: 1px solid #e8dfcf;">
          
          <!-- Sacred Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #460C11 0%, #700c0c 50%, #8b1313 100%); padding: 30px 20px; color: #ffffff; border-bottom: 4px solid #d97706;">
              <img src="https://kapooripur.in/favicon.svg" width="56" height="56" alt="यदुवंशी दुर्गा पूजा" style="display: block; margin: 0 auto 10px auto; border-radius: 12px; border: 2px solid #fbbf24; background-color: #580c11; padding: 4px;" />
              <p style="margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #fde68a; font-weight: 600;">॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</p>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">पावन दान पावती रसीद</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 25px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #1c1917;">
                सादर प्रणाम, <strong>${data.donorName}</strong> जी,
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #44403c;">
                माँ जगदम्बा के पावन उत्सव में आपके द्वारा अर्पित दान व सेवा समर्पण हमें सफलतापूर्वक प्राप्त हो गया है। समिति आपकी इस सेवा हेतु हृदय से आभारी है।
              </p>

              <!-- Receipt Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdfbf7; border: 1px solid #e8dfcf; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #f0e6d6;">
                    <span style="font-size: 12px; color: #78716c; text-transform: uppercase;">समर्पण राशि (Amount):</span>
                    <div style="font-size: 26px; font-weight: 800; color: #700c0c; margin-top: 4px;">
                      ₹${data.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; font-size: 13px; color: #44403c; border-bottom: 1px solid #f0e6d6;">
                    <div style="margin-bottom: 6px;"><strong>पेमेंट आईडी:</strong> <span style="font-family: monospace;">${data.razorpayPaymentId}</span></div>
                    <div style="margin-bottom: 6px;"><strong>ऑर्डर आईडी:</strong> <span style="font-family: monospace;">${data.razorpayOrderId}</span></div>
                    <div><strong>दिनांक:</strong> ${data.date}</div>
                  </td>
                </tr>
                ${data.message ? `
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #78350f; font-style: italic; background-color: #fffbeb;">
                    "<strong>प्रार्थना / संदेश:</strong> ${data.message}"
                  </td>
                </tr>
                ` : ''}
              </table>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #78716c; text-align: center;">
                "दानेन प्राप्यते सर्वं दानेन सुखमेधते । दानेन परमो धर्मो दानं हि परमो निधिः ॥"
              </p>

              <!-- View Live Darshan / Website button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${websiteUrl}/donations" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #700c0c 0%, #991b1b 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 10px; border: 1px solid #d97706;">
                      दानदाता सूची व लाइव दर्शन देखें →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; padding: 18px 25px; text-align: center; border-top: 1px solid #e8dfcf;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #44403c;">
                यदुवंशी दुर्गा पूजा समिति कपूरिपुर
              </p>
              <p style="margin: 0; font-size: 11px; color: #78716c;">
                कपूरिपुर, सुरियावां, भदोही, उत्तर प्रदेश | <a href="${websiteUrl}" style="color: #700c0c; text-decoration: none;">kapooripur.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
