import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends email when SMTP is configured; otherwise logs payload (dev-friendly).
 */
export async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const transport = createTransport();

  if (!transport) {
    console.log('[email:dev] SMTP not configured — message would be sent to:', to);
    console.log('[email:dev] Subject:', subject);
    console.log('[email:dev] Body:\n', text || html || '');
    return { dev: true };
  }

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text,
  });
  return { sent: true };
}
