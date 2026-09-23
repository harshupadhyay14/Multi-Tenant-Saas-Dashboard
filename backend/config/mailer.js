const nodemailer = require("nodemailer");

// Inline replacement for the SQS -> worker -> SNS invite pipeline (see
// infra/aws-integration/ for the original version). Sends the invite email
// directly from the request. If SMTP env vars aren't set (e.g. running the
// demo without email configured), it just logs the invite instead of
// throwing, so the app still works end-to-end.
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const sendInviteEmail = async ({ email, orgName, role, invitedBy }) => {
  const subject = `You've been invited to join ${orgName} on SaaSBoard`;
  const text =
    `${invitedBy} invited you to join ${orgName} as ${role}.\n\n` +
    `Log in at ${process.env.CLIENT_URL || "http://localhost:3000"} to accept.`;

  if (!transporter) {
    console.log(`✉️  [invite email - SMTP not configured, logging only] to=${email} subject="${subject}"`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
};

module.exports = { sendInviteEmail };
