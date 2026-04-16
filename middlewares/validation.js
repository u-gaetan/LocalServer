// middlewares/validation.js

// ─────────────────────────────────────────────
// Types d'événements autorisés par l'extension
// ─────────────────────────────────────────────
const ALLOWED_EVENT_TYPES = new Set([
    // Générés par background.js
    'navigation',
    'tab_closed',
    'saisie_clavier',
    // Générés par content.js
    'clic',
    'scroll',
    'page_quittee',
    'copier',
    'selection_texte',
    'frappe_clavier',
    'temps_lecture',
    'formulaire',
    'media'
    // Ajoutez ici tout nouveau type si vous en créez
]);

const MAX_EVENTS_PER_REQUEST = 5000;
const MAX_URL_LENGTH = 2048;
const MAX_STRING_FIELD_LENGTH = 500;

// ─────────────────────────────────────────────
// Formats réels générés par background.js
// ─────────────────────────────────────────────
// sessionId : "session_1713200000000_a3f8x2"
//   → session_ + timestamp décimal (13 chiffres) + _ + 6 chars base36
const SESSION_ID_PATTERN = /^session_\d{12,15}_[a-z0-9]{6}$/;

// participantId : "P-mnruh94h-e2md"
//   → P- + timestamp base36 (7-10 chars) + - + 4 chars base36
const PARTICIPANT_ID_PATTERN = /^P-[a-z0-9]{7,10}-[a-z0-9]{4}$/;


/**
 * Middleware de validation pour POST /api/collecte
 * Vérifie la structure, les types, la cohérence et les limites des données.
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
            erreur: `Trop d'événements (${data.length}). Maximum autorisé : ${MAX_EVENTS_PER_REQUEST}.`
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
            erreur: `Format de sessionId invalide : "${sessionId}". Attendu : session_<timestamp>_<6chars>.`
        });
    }

    if (!PARTICIPANT_ID_PATTERN.test(participantId)) {
        return res.status(400).json({
            erreur: `Format de participantId invalide : "${participantId}". Attendu : P-<base36>-<4chars>.`
        });
    }

    // --- 5. Valider chaque événement ---
    const errors = [];

    for (let i = 0; i < data.length; i++) {
        const event = data[i];

        // 5a. Cohérence sessionId / participantId
        if (event.sessionId !== sessionId) {
            errors.push(`[${i}] sessionId incohérent ("${event.sessionId}" ≠ "${sessionId}")`);
            continue;
        }
        if (event.participantId !== participantId) {
            errors.push(`[${i}] participantId incohérent`);
            continue;
        }

        // 5b. Type d'événement
        if (!event.type || !ALLOWED_EVENT_TYPES.has(event.type)) {
            errors.push(`[${i}] type invalide ou manquant : "${event.type}"`);
        }

        // 5c. Timestamp
        if (!event.timestamp || isNaN(Date.parse(event.timestamp))) {
            errors.push(`[${i}] timestamp invalide : "${event.timestamp}"`);
        }

        // 5d. URL (si présente)
        if (event.url && (typeof event.url !== 'string' || event.url.length > MAX_URL_LENGTH)) {
            errors.push(`[${i}] url trop longue ou invalide`);
        }

        // 5e. visitId (si présent, doit être une string raisonnable)
        if (event.visitId && (typeof event.visitId !== 'string' || event.visitId.length > MAX_STRING_FIELD_LENGTH)) {
            errors.push(`[${i}] visitId invalide`);
        }

        // Arrêter tôt si trop d'erreurs
        if (errors.length >= 10) {
            errors.push(`... et potentiellement d'autres erreurs (arrêt après 10).`);
            break;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            erreur: 'Données invalides.',
            details: errors
        });
    }

    // --- 6. Attacher les IDs au req pour usage dans la route ---
    req.validatedSessionId = sessionId;
    req.validatedParticipantId = participantId;

    next();
}

/**
 * Validation basique des paramètres :id dans les routes GET
 * Empêche les injections NoSQL type { "$gt": "" }
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
