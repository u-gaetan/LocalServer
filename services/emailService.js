// services/emailService.js
const nodemailer = require('nodemailer');

let transporter = null;

function getRecipients() {
    return String(process.env.COMPLETION_EMAIL_TO || '')
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);
}

function isEmailEnabled() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_FROM &&
        getRecipients().length > 0
    );
}

function getTransporter() {
    if (transporter) return transporter;

    if (!isEmailEnabled()) return null;

    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

    const config = {
        host: process.env.SMTP_HOST,
        port,
        secure
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        config.auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        };
    }

    transporter = nodemailer.createTransport(config);
    return transporter;
}

async function sendCompletionEmail({ participantId, language }) {
    const mailer = getTransporter();

    if (!mailer) {
        console.log('[emailService] Courriel de complétion non envoyé : configuration SMTP absente.');
        return;
    }

    const recipients = getRecipients();

    await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients,
        subject: `[Questionnaire] Complétion participant ${participantId}`,
        text:
`Un participant a complété le questionnaire.

Participant : ${participantId}
Langue : ${language || 'non précisée'}
Date UTC : ${new Date().toISOString()}`
    });
}

module.exports = {
    sendCompletionEmail
};
