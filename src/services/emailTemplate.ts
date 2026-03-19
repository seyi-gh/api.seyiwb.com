interface EmailVerificationTemplateData {
  username: string;
  verificationUrl: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const buildEmailVerificationTemplate = (
  data: EmailVerificationTemplateData
): EmailTemplate => {
  const subject = 'Verify your email address';

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: Arial, sans-serif; color: #12263a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6ecf3;">
            <tr>
              <td style="padding: 24px; background: linear-gradient(135deg, #0f172a, #1e3a8a); color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; line-height: 1.3;">Confirm your email</h1>
                <p style="margin: 10px 0 0; font-size: 14px; color: #e2e8f0;">One quick step to activate your account.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.6;">Hi ${data.username},</p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">Thanks for creating your account. Click the button below to verify your email address.</p>
                <p style="margin: 0 0 24px;">
                  <a href="${data.verificationUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 8px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600;">Verify email</a>
                </p>
                <p style="margin: 0 0 10px; font-size: 13px; color: #4a5b70;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="margin: 0; font-size: 13px; word-break: break-all; color: #1d4ed8;">${data.verificationUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e6ecf3;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">If you did not request this account, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const text = [
    `Hi ${data.username},`,
    '',
    'Thanks for creating your account. Verify your email by opening this link:',
    data.verificationUrl,
    '',
    'If you did not request this account, you can ignore this email.'
  ].join('\n');

  return {
    subject,
    html,
    text
  };
};
