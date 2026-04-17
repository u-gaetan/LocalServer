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
    'media',
    // Générés par le questionnaire via content script
    'questionnaire_event',
    'study_marker'
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

    // --- 3. Vérifier le premier élément pour sessionId / participantId ---
    const { sessionId, participantId } = data[0];

    if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
            erreur: 'sessionId manquant ou invalide dans le premier événement.'
        });
    }
    if (!participantId || typeof participantId !== 'string') {
        return res.status(400).json({
            erreur: 'participantId manquant ou invalide dans le premier événement.'
        });
    }

    // --- 4. Format du sessionId et participantId ---
    if (!SESSION_ID_PATTERN.test(sessionId)) {
        return res.status(400).json({
            erreur: `Format de sessionId invalide : "${sessionId}".`
        });
    }
    if (!PARTICIPANT_ID_PATTERN.test(participantId)) {
        return res.status(400).json({
            erreur: `Format de participantId invalide : "${participantId}".`
        });
    }

    // --- 5. Filtrer les événements (au lieu de tout rejeter) ---
    const validEvents = [];
    const warnings = [];

    for (let i = 0; i < data.length; i++) {
        const event = data[i];
        let isValid = true;
        const eventWarnings = [];

        // 5a. Cohérence sessionId / participantId
        if (event.sessionId !== sessionId || event.participantId !== participantId) {
            eventWarnings.push(`[${i}] IDs incohérents — ignoré`);
            isValid = false;
        }

        // 5b. Type d'événement
        if (!event.type || typeof event.type !== 'string') {
            eventWarnings.push(`[${i}] type manquant — ignoré`);
            isValid = false;
        } else if (!ALLOWED_EVENT_TYPES.has(event.type)) {
            // Type inconnu → on le garde quand même (pour ne pas perdre de données)
            // mais on log un warning pour investigation
            eventWarnings.push(`[${i}] type inconnu : "${event.type}" — conservé avec warning`);
            // On ne met PAS isValid = false → l'événement est gardé
        }

        // 5c. Timestamp
        if (!event.timestamp || isNaN(Date.parse(event.timestamp))) {
            eventWarnings.push(`[${i}] timestamp invalide : "${event.timestamp}" — ignoré`);
            isValid = false;
        }

        // 5d. URL (si présente, tronquer si trop longue plutôt que rejeter)
        if (event.url && typeof event.url === 'string' && event.url.length > MAX_URL_LENGTH) {
            event.url = event.url.substring(0, MAX_URL_LENGTH) + '...[tronqué]';
            eventWarnings.push(`[${i}] url tronquée (dépassait ${MAX_URL_LENGTH} chars)`);
        }

        // 5e. visitId
        if (event.visitId && (typeof event.visitId !== 'string' || event.visitId.length > MAX_STRING_FIELD_LENGTH)) {
            eventWarnings.push(`[${i}] visitId invalide — ignoré`);
            isValid = false;
        }

        if (isValid) {
            validEvents.push(event);
        }

        if (eventWarnings.length > 0) {
            warnings.push(...eventWarnings);
        }
    }

    // Log les warnings côté serveur (toujours utile pour debug)
    if (warnings.length > 0) {
        console.warn(`⚠️  Validation collecte | Session: ${sessionId} | ${warnings.length} warnings:`);
        warnings.slice(0, 20).forEach(w => console.warn(`   ${w}`));
        if (warnings.length > 20) {
            console.warn(`   ... et ${warnings.length - 20} autres warnings`);
        }
    }

    // Si AUCUN événement valide → là on rejette
    if (validEvents.length === 0) {
        return res.status(400).json({
            erreur: 'Aucun événement valide dans le lot.',
            totalReceived: data.length,
            warnings: warnings.slice(0, 10)
        });
    }

    // --- 6. Remplacer le body par les événements filtrés ---
    req.body = validEvents;
    req.validatedSessionId = sessionId;
    req.validatedParticipantId = participantId;
    req.validationWarnings = warnings;
    req.originalCount = data.length;

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
