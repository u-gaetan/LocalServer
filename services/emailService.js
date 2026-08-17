// services/emailService.js
const { EmailClient } = require('@azure/communication-email');

let emailClient = null;

function getEmailClient() {
    if (emailClient) return emailClient;

    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    if (!connectionString) return null;

    emailClient = new EmailClient(connectionString);
    return emailClient;
}

function getRecipients() {
    return String(process.env.COMPLETION_EMAIL_TO || '')
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)
        .map(address => ({ address }));
}

async function sendCompletionEmail({ participantId, language, demographics }) {
    console.log('[emailService] Tentative envoi email via Azure Communication Services...', {
        participantId,
        language,
        recipients: process.env.COMPLETION_EMAIL_TO
    });

    const client = getEmailClient();
    const recipientsList = getRecipients();
    const senderAddress = process.env.AZURE_SENDER_EMAIL;

    if (!client || recipientsList.length === 0 || !senderAddress) {
        console.log('[emailService] Email non envoyé : configuration Azure Communication Services absente.');
        return;
    }

    const emailParticipant = demographics?.email || 'Non renseigné';
    const paiementChoisi = demographics?.paiement || 'Non renseigné';
    const timezone = demographics?.timezone || 'Non spécifié';

    const emailMessage = {
        senderAddress: senderAddress,
        content: {
            subject: `[Questionnaire] Complétion participant ${participantId}`,
            plainText:
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
        },
        recipients: {
            to: recipientsList
        }
    };

    try {
        const poller = await client.beginSend(emailMessage);
        const response = await poller.pollUntilDone();

        console.log('[emailService] Email Azure envoyé avec succès !', {
            id: response.id,
            status: response.status
        });
    } catch (err) {
        console.error('[emailService] Erreur lors de l\'envoi Azure:', err);
    }
}

module.exports = {
    sendCompletionEmail
};