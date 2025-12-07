import nodemailer from 'nodemailer';
import AppError from '../utils/AppError';

/**
 * Service to handle Email Sending.
 */
class EmailService {

  public static async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    // 3) Actually send the email
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new AppError('Error sending email. Please try again later.', 500);
    }
  }


  public static async sendPasswordReset(to: string, resetURL: string): Promise<void> {
    const subject = 'Your Password Reset Token (Valid for 10 min)';
    const text = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\n\nIf you didn't forget your password, please ignore this email!`;
    const html = `<p>Forgot your password? Submit a PATCH request with your new password to: <a href="${resetURL}">${resetURL}</a>.</p><p>If you didn't forget your password, please ignore this email!</p>`;

    await EmailService.sendEmail(to, subject, text, html);
  }
}

export default EmailService;
