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
        secure, // false pour le port 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false // Évite les soucis de certificats intermédiaires
        }
    };

    transporter = nodemailer.createTransport(config);
    return transporter;
}

async function sendCompletionEmail({ participantId, language, demographics }) {
    console.log('[emailService] Tentative envoi email...', {
        participantId,
        language,
        recipients: process.env.COMPLETION_EMAIL_TO
    });

    const mailer = getTransporter();

    if (!mailer) {
        console.log('[emailService] Email non envoyé : configuration SMTP absente.');
        return;
    }

    const recipients = getRecipients();
    const emailParticipant = demographics?.email || 'Non renseigné';
    const paiementChoisi = demographics?.paiement || 'Non renseigné';
    const timezone = demographics?.timezone || 'Non spécifié';

    const info = await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients,
        subject: `[Questionnaire] Complétion participant ${participantId}`,
        text:
`Un participant a complété le questionnaire.

--------------------------------------------------
INFORMATIONS DU PARTICIPANT
--------------------------------------------------
Identifiant : ${participantId}
Courriel : ${emailParticipant}
Mode de paiement souhaité : ${paiementChoisi}
Langue de l'étude : ${language || 'non précisée'}
Fuseau horaire du participant : ${timezone}
Date UTC : ${new Date().toISOString()}
--------------------------------------------------`
    });

    console.log('[emailService] Résultat envoi:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
    });
}

module.exports = {
    sendCompletionEmail
};