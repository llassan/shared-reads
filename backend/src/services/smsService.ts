import twilio from 'twilio';
import { config } from '../config/env';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export interface SendOtpSmsParams {
  phone: string;
  otp: string;
}

export const sendOtpSms = async ({
  phone,
  otp,
}: SendOtpSmsParams): Promise<void> => {
  try {
    await client.messages.create({
      body: `Your SharedReads verification code is: ${otp}. Valid for 10 minutes.`,
      from: config.twilio.phoneNumber,
      to: phone,
    });

    if (config.isDevelopment) {
      console.log(`📱 SMS sent to ${phone}: ${otp}`);
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new Error('Failed to send verification SMS');
  }
};
