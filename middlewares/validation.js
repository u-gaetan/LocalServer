// middlewares/validation.js

const ALLOWED_EVENT_TYPES = new Set([
    // Générés par background.js
    'navigation',
    'tab_closed',
    'saisie_clavier',
    // Générés par content.js
    'clic',
    'scroll',
    'page_quittee',
    'copie',
    'selection_texte',
    'frappe_clavier',
    'temps_lecture',
    'formulaire',
    'media'
]);

const MAX_EVENTS_PER_REQUEST = 5000;
const MAX_URL_LENGTH = 2048;
const MAX_STRING_FIELD_LENGTH = 500;
const SESSION_ID_PATTERN = /^session_\d{12,15}_[a-z0-9]{6}$/;
const PARTICIPANT_ID_PATTERN = /^P-[a-z0-9]{7,10}-[a-z0-9]{4}$/;


/**
 * Middleware de validation pour POST /api/collecte
 * Valide la structure globale, puis FILTRE les événements invalides
 * au lieu de rejeter tout le lot.
 */
function validateCollecteData(req, res, next) {
    const data = req.body;

    // --- 1. Le body doit être un tableau non vide ---
    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
            erreur: 'Le body doit être un tableau JSON non vide.'
        });
    }

    // --- 2. Limite de taille ---
    if (data.length > MAX_EVENTS_PER_REQUEST) {
        return res.status(400).json({
            erreur: `Trop d'événements (${data.length}). Maximum : ${MAX_EVENTS_PER_REQUEST}.`
        });
    }

    // --- 3. Vérifier le premier élément pour participantId ---
    const { participantId } = data[0];

    if (!participantId || typeof participantId !== 'string') {
        return res.status(400).json({ erreur: 'participantId manquant ou invalide.' });
    }
    if (!PARTICIPANT_ID_PATTERN.test(participantId)) {
        return res.status(400).json({ erreur: `Format de participantId invalide : "${participantId}".` });
    }

    const validEvents = [];
    const warnings = [];

    for (let i = 0; i < data.length; i++) {
        const event = data[i];
        let isValid = true;
        const eventWarnings = [];

        if (event.participantId !== participantId) {
            eventWarnings.push(`[${i}] ID incohérent — ignoré`);
            isValid = false;
        }

        if (!event.type || typeof event.type !== 'string') {
            eventWarnings.push(`[${i}] type manquant — ignoré`);
            isValid = false;
        } else if (!ALLOWED_EVENT_TYPES.has(event.type)) {
            eventWarnings.push(`[${i}] type inconnu : "${event.type}" — conservé`);
        }

        if (!event.timestamp || isNaN(Date.parse(event.timestamp))) {
            eventWarnings.push(`[${i}] timestamp invalide — ignoré`);
            isValid = false;
        }

        if (isValid) validEvents.push(event);
        if (eventWarnings.length > 0) warnings.push(...eventWarnings);
    }

    if (validEvents.length === 0) {
        return res.status(400).json({ erreur: 'Aucun événement valide.' });
    }

    req.body = validEvents;
    req.validatedParticipantId = participantId;
    next();
}


/**
 * Validation des paramètres :id dans les routes GET
 */
function validateParamId(paramName) {
    return (req, res, next) => {
        const value = req.params[paramName];

        if (!value || typeof value !== 'string') {
            return res.status(400).json({ erreur: `Paramètre ${paramName} manquant.` });
        }
        if (value.includes('$') || value.includes('{')) {
            return res.status(400).json({ erreur: `Paramètre ${paramName} invalide.` });
        }
        if (value.length > 200) {
            return res.status(400).json({ erreur: `Paramètre ${paramName} trop long.` });
        }

        next();
    };
}

module.exports = { validateCollecteData, validateParamId };
