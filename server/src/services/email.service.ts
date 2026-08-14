import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.config';
import { ApiError } from '../utils/ApiError';

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initializes and returns the Nodemailer SMTP Transporter instance.
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
        throw new ApiError(
          500,
          'Email service is misconfigured. EMAIL_USER and EMAIL_APP_PASSWORD must be provided in .env when MOCK_OTP=false.'
        );
      }

      const cleanUser = env.EMAIL_USER.trim();
      const cleanPass = env.EMAIL_APP_PASSWORD.replace(/\s+/g, ''); // Remove any spaces from Google App Password

      const isGmail = env.SMTP_HOST === 'smtp.gmail.com' || cleanUser.endsWith('@gmail.com');

      this.transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: cleanUser,
                pass: cleanPass
              },
              connectionTimeout: 8000,
              greetingTimeout: 8000,
              socketTimeout: 10000
            }
          : {
              host: env.SMTP_HOST,
              port: env.SMTP_PORT,
              secure: env.SMTP_PORT === 465,
              auth: {
                user: cleanUser,
                pass: cleanPass
              },
              connectionTimeout: 8000,
              greetingTimeout: 8000,
              socketTimeout: 10000
            }
      );
    }

    return this.transporter;
  }

  /**
   * Sends an OTP verification email to the specified recipient.
   *
   * @param to - Recipient email address
   * @param otp - 6-digit OTP string
   */
  public static async sendVerificationOtp(to: string, otp: string): Promise<void> {
    if (env.MOCK_OTP) {
      console.log(`🔑 [EMAIL_SERVICE:MOCK] Suppressed sending email to ${to}. OTP: ${otp}`);
      return;
    }

    try {
      const transporter = this.getTransporter();

      const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - Echo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">ECHO</h1>
              <p style="margin: 4px 0 0; font-size: 14px; color: #e0e7ff; opacity: 0.9;">Anonymous Nearby Interactions</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #ffffff;">Verification Code</h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #94a3b8;">
                Use the verification code below to confirm your account and sign in to Echo. This code is valid for <strong>5 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background-color: #0f172a; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace, Courier; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #818cf8; display: inline-block;">${otp}</span>
              </div>
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                If you did not request this verification code, please ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Echo Platform. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      const textFallback = `Your Echo verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`;

      const senderUser = env.EMAIL_USER ? env.EMAIL_USER.trim() : '';
      const fromHeader = (env.FROM_EMAIL && !env.FROM_EMAIL.includes('noreply@echoapp.com'))
        ? env.FROM_EMAIL
        : `Echo App <${senderUser}>`;

      const sendPromise = transporter.sendMail({
        from: fromHeader,
        to,
        subject: `Your Echo Verification Code: ${otp}`,
        text: textFallback,
        html: htmlTemplate
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP connection timed out after 8 seconds.')), 8000)
      );

      const info: any = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`📧 [EMAIL_SERVICE] Verification email successfully sent to ${to}. Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error(`❌ [EMAIL_SERVICE:WARNING] Email sending delayed or failed: ${error?.message || error}. Proceeding with generated OTP.`);
      // Do not throw 500 error so OTP entry UI proceeds smoothly
    }
  }
}
