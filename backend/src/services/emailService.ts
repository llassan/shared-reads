import { Resend } from 'resend';
import { config } from '../config/env';

const resend = new Resend(config.resend.apiKey);

export interface SendOtpEmailParams {
  email: string;
  otp: string;
  name?: string;
}

export interface SendWelcomeEmailParams {
  email: string;
  name: string;
}

export const sendOtpEmail = async ({
  email,
  otp,
  name,
}: SendOtpEmailParams): Promise<void> => {
  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: 'Verify your SharedReads account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px dashed #0ea5e9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 4px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>SharedReads</h1>
              </div>
              <div class="content">
                <p>Hi ${name || 'there'},</p>
                <p>Welcome to SharedReads! Please verify your email address using the OTP code below:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <p>Best regards,<br>The SharedReads Team</p>
              </div>
              <div class="footer">
                <p>© 2025 SharedReads. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (config.isDevelopment) {
      console.log(`✉️  OTP sent to ${email}: ${otp}`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async ({
  email,
  name,
}: SendWelcomeEmailParams): Promise<void> => {
  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: 'Welcome to SharedReads!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to SharedReads!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Your account has been successfully verified! You're now part of the SharedReads community.</p>
                <p>Here's what you can do next:</p>
                <ul>
                  <li>📚 List books you want to share with others</li>
                  <li>🔍 Search for books available in your area</li>
                  <li>🤝 Connect with fellow book lovers</li>
                </ul>
                <p>Happy reading!</p>
                <p>Best regards,<br>The SharedReads Team</p>
              </div>
              <div class="footer">
                <p>© 2025 SharedReads. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }
};
