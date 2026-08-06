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

async function sendCompletionEmail({ participantId, language, paymentMethod }) {
    const isFr = (language === 'fr');

    const subject = isFr
        ? `[Étude Recherche] Questionnaire terminé - ${participantId}`
        : `[Research Study] Questionnaire completed - ${participantId}`;


    const dateStr = new Date().toLocaleString('fr-CA', {
        timeZone: 'America/Toronto', // Force l'heure de Québec/Montréal
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

// Exemple de rendu : "2026-08-05 11:58:14"

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">🎉 Un participant a terminé l'étude !</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Participant ID :</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #2563eb; font-weight: bold;">${participantId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Langue :</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${(language || 'fr').toUpperCase()}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9; color: #059669;">💳 Méthode de Paiement / Indemnité :</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #059669; font-weight: bold;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Date de fin :</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${dateStr}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
          Cet email a été envoyé automatiquement par le serveur de collecte de données de l'Université Laval.
        </p>
      </div>
    `;

    
    return await mailerTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.RESEARCHER_EMAIL,
        subject: subject,
        html: htmlBody
    });
}

module.exports = { sendCompletionEmail };
