export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  sendMail(message: MailMessage): Promise<void>;
}

/**
 * Development stub: logs the email to the server console instead of sending it.
 * Swap this implementation for a real SMTP/provider-backed one (e.g. nodemailer)
 * by implementing the same EmailService interface and exporting it as `emailService`.
 */
export class ConsoleEmailService implements EmailService {
  async sendMail(message: MailMessage): Promise<void> {
    console.log(
      [
        '──────── ✉️  Email (dev stub) ────────',
        `To:      ${message.to}`,
        `Subject: ${message.subject}`,
        '',
        message.text,
        '──────────────────────────────────────',
      ].join('\n'),
    );
  }
}

export const emailService: EmailService = new ConsoleEmailService();

/**
 * Sends the welcome email containing the generated login credentials to a newly
 * created system user (manager/agent).
 */
export async function sendNewUserCredentials(to: string, password: string): Promise<void> {
  await emailService.sendMail({
    to,
    subject: 'Your Lahmanison account is ready',
    text: [
      'An account has been created for you.',
      '',
      `Email:    ${to}`,
      `Password: ${password}`,
      '',
      'Please sign in and change your password.',
    ].join('\n'),
  });
}
