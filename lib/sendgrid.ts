import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) throw new Error('[GnosIQ] SENDGRID_API_KEY is not set');
sgMail.setApiKey(apiKey);

interface ConfirmationParams {
  email: string;
  name: string;
}

export async function sendWaitlistConfirmation({ email, name }: ConfirmationParams): Promise<void> {
  const firstName = name.split(' ')[0] || 'there';

  await sgMail.send({
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'carlos@gnosiq.ai',
      name: 'Carlos @ GnosIQ',
    },
    subject: "You're on the GnosIQ waitlist 🧠",
    text: `Hey ${firstName},\n\nYou're officially on the GnosIQ waitlist.\n\nGnosIQ is the first API that turns human potential into computable capital.\n\nWe'll reach out personally when early access opens.\n\n— Carlos\nFounder, GnosIQ\ngnosiq.ai`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="background:#0D0B1E;color:#FFFFFF;font-family:Inter,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto;"><p style="color:#8B5CF6;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;">GNOSIQ</p><h1 style="font-size:24px;font-weight:700;margin-bottom:16px;">You're on the waitlist, ${firstName}.</h1><p style="color:#A1A1AA;line-height:1.7;margin-bottom:24px;">GnosIQ is the first API that turns human potential into computable capital.<br>Deep cognitive assessment. Affordable. Programmatic. 30 minutes.</p><p style="color:#A1A1AA;line-height:1.7;margin-bottom:32px;">We'll reach out personally when early access opens.</p><hr style="border:none;border-top:1px solid #1F1B3A;margin-bottom:32px;"><p style="color:#6B7280;font-size:13px;">Carlos Gomes · Founder, GnosIQ<br><a href="https://gnosiq.ai" style="color:#8B5CF6;">gnosiq.ai</a></p></body></html>`,
  });
}
