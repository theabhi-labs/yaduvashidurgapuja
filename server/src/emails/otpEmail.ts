export const getOtpEmailHtml = (userName: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>पासवर्ड रीसेट OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f3ea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d1810;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3ea; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="550" cellpadding="0" cellspacing="0" style="max-width: 550px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 25px rgba(112, 12, 12, 0.1); border: 1px solid #e8dfcf;">
          
          <!-- Sacred Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #460C11 0%, #700c0c 50%, #8b1313 100%); padding: 30px 20px; color: #ffffff; border-bottom: 4px solid #d97706;">
              <img src="https://kapooripur.in/favicon.svg" width="52" height="52" alt="यदुवंशी दुर्गा पूजा" style="display: block; margin: 0 auto 10px auto; border-radius: 12px; border: 2px solid #fbbf24; background-color: #580c11; padding: 4px;" />
              <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #fde68a; font-weight: 600;">॥ श्री यदुवंशी दुर्गा पूजा कपूरिपुर ॥</p>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">पासवर्ड रीसेट हेतु OTP</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 25px; text-align: center;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #1c1917; text-align: left;">
                नमस्ते <strong>${userName}</strong> जी,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #44403c; text-align: left;">
                आपके यदुवंशी दुर्गा पूजा कपूरिपुर खाते के पासवर्ड को रीसेट करने के लिए नीचे दिया गया एकमुश्त पासवर्ड (OTP) उपयोग करें:
              </p>

              <!-- Big Bold OTP Box -->
              <div style="display: inline-block; background-color: #fdfbf7; border: 2px dashed #d97706; border-radius: 16px; padding: 18px 36px; margin: 10px 0 24px 0; box-shadow: inset 0 2px 8px rgba(217, 119, 6, 0.08);">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #700c0c;">
                  ${otp}
                </span>
              </div>

              <!-- Expiry Alert -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #92400e; text-align: center;">
                    ⏳ यह OTP केवल <strong>10 मिनट</strong> के लिए मान्य है।
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #78716c; text-align: left; line-height: 1.5;">
                ⚠️ <strong>सुरक्षा सूचना:</strong> इस OTP को किसी के साथ साझा न करें। यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; padding: 18px 25px; text-align: center; border-top: 1px solid #e8dfcf;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #78716c; font-weight: 600;">
                यदुवंशी दुर्गा पूजा समिति, कपूरिपुर
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                डिजिटल स्मृति संचय • सुरक्षा प्रणाली
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
