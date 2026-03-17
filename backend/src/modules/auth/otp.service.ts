// OTP service for email verification
import nodemailer from 'nodemailer';

// Store OTPs in memory (in production, use Redis)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Debug: Check environment variables
console.log('📧 Email Config:', {
  user: process.env.EMAIL_USER ? '✓ Set' : '✗ Not set',
  pass: process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set',
  userValue: process.env.EMAIL_USER,
  passLength: process.env.EMAIL_PASSWORD?.length || 0
});

export class OTPService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password',
    },
  });

  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email
  static async sendOTP(email: string): Promise<void> {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { code: otp, expiresAt });

    console.log(`📧 OTP for ${email}: ${otp} (expires in 10 minutes)`);

    // Send email (skip in development if email not configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Linsta - Email Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #405DE6;">Linsta Email Verification</h2>
              <p>Your verification code is:</p>
              <h1 style="background: #f5f5f5; padding: 20px; text-align: center; letter-spacing: 5px; color: #405DE6;">
                ${otp}
              </h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`✅ OTP email sent to ${email}`);
      } catch (error) {
        console.error('❌ Failed to send email:', error);
        // Don't throw error, just log it for development
      }
    } else {
      console.log('⚠️ Email not configured. OTP logged to console only.');
    }
  }

  // Verify OTP
  static verifyOTP(email: string, code: string): boolean {
    const stored = otpStore.get(email);

    if (!stored) {
      console.log(`❌ No OTP found for ${email}`);
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      console.log(`❌ OTP expired for ${email}`);
      return false;
    }

    if (stored.code !== code) {
      console.log(`❌ Invalid OTP for ${email}. Expected: ${stored.code}, Got: ${code}`);
      return false;
    }

    // OTP is valid, remove it
    otpStore.delete(email);
    console.log(`✅ OTP verified for ${email}`);
    return true;
  }

  // Resend OTP
  static async resendOTP(email: string): Promise<void> {
    // Check if there's a recent OTP
    const stored = otpStore.get(email);
    if (stored && Date.now() < stored.expiresAt) {
      // Still valid, resend same code
      console.log(`🔄 Resending existing OTP for ${email}: ${stored.code}`);
    }
    
    // Generate and send new OTP
    await this.sendOTP(email);
  }
}
