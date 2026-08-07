// routes/questionnaire.js
const express = require('express');
const router = express.Router();
const Reponse = require('../models/Reponse');
const auth = require('../middlewares/auth');
const { adminLimiter, getCleanIp } = require('../middlewares/rateLimit');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/keyVault');

const {
    drawBalancedQuestions,
    markResearchQuestionCompleted
} = require('../services/questionBankService');

const {
    sendCompletionEmail
} = require('../services/emailService');

const participantLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp,
    validate: { trustProxy: false, ip: false },
    message: { erreur: "Trop de requêtes. Patientez." }
});

const PARTICIPANT_ID_RE = /^P-[a-z0-9]{7,10}-[a-z0-9]{4}$/;

const ALLOWED_TYPES = new Set([
    'consent', 'deception_consent',
    'demographics', 'research_answer', 'self_assessment',
    'memory_answer', 'questionnaire_event', 'internet_skills'
]);

function getTokenParticipantId(req) {
    return (
        req.user?.participantId ||
        req.participant?.participantId ||
        req.auth?.participantId ||
        req.participantId ||
        null
    );
}

function participantMatchesToken(req, participantId) {
    const tokenParticipantId = getTokenParticipantId(req);

    // Si le middleware auth ne publie pas l'id sur req, on ne bloque pas.
    // Le JWT reste tout de même vérifié par auth.
    if (!tokenParticipantId) return true;

    return tokenParticipantId === participantId;
}

function normalizeLanguage(language) {
    return language === 'en' ? 'en' : 'fr';
}

// Génération et signature d'une session participant vierge
router.post('/init-session', participantLimiter, async (req, res) => {
    try {
        const secrets = getSecrets();

        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 6);
        const participantId = `P-${timestamp}-${random}`;

        const token = jwt.sign(
            { participantId, role: 'participant' },
            secrets.jwtSecret,
            { expiresIn: '12h' }
        );

        res.json({ participantId, token });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// Route pour distribuer un JWT temporaire au participant
router.post('/token', participantLimiter, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            return res.status(400).json({ erreur: 'Format du participantId invalide.' });
        }

        const secrets = getSecrets();

        const token = jwt.sign(
            { participantId, role: 'participant' },
            secrets.jwtSecret,
            { expiresIn: '12h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// Nouveau : tirage équilibré depuis les fichiers Excel
router.post('/draw-questions', participantLimiter, auth, async (req, res) => {
    try {
        const { participantId, language } = req.body;

        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            return res.status(400).json({ erreur: 'participantId invalide.' });
        }

        if (!participantMatchesToken(req, participantId)) {
            return res.status(403).json({ erreur: 'Participant non autorisé pour ce jeton.' });
        }

        const lang = normalizeLanguage(language);

        const draw = await drawBalancedQuestions({
            participantId,
            language: lang
        });

        res.json(draw);
    } catch (err) {
        console.error('[draw-questions]', err);
        res.status(500).json({
            erreur: 'Erreur lors du tirage des questions.',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
    }
});

// Soumission d'une réponse
router.post('/reponse', participantLimiter, auth, async (req, res) => {
    try {
        const { participantId, type, questionId, difficulty, data, timestamp } = req.body;

        console.log('[reponse reçue]', {
            participantId,
            type,
            event: data && data.event,
            language: data && data.language
        });


        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            return res.status(400).json({ erreur: 'participantId invalide.' });
        }

        if (!participantMatchesToken(req, participantId)) {
            return res.status(403).json({ erreur: 'Participant non autorisé pour ce jeton.' });
        }

        if (!type || !ALLOWED_TYPES.has(type)) {
            return res.status(400).json({ erreur: `type invalide : "${type}"` });
        }

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ erreur: 'data doit être un objet.' });
        }

        if (!timestamp || isNaN(Date.parse(timestamp))) {
            return res.status(400).json({ erreur: 'timestamp invalide.' });
        }

        const isCompletionEvent =
            type === 'questionnaire_event' &&
            data &&
            data.event === 'questionnaire_completed';

        let alreadyHadCompletionEvent = false;

        if (isCompletionEvent) {
            const existingCompletion = await Reponse.findOne({
                participantId,
                type: 'questionnaire_event',
                'data.event': 'questionnaire_completed'
            }).lean();

            alreadyHadCompletionEvent = Boolean(existingCompletion);
        }

        const filter = { participantId, type };
        if (questionId) filter.questionId = questionId;

        const reponse = await Reponse.findOneAndUpdate(
            filter,
            { participantId, type, questionId, difficulty, data, timestamp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (type === 'research_answer' && questionId) {
            await markResearchQuestionCompleted({
                participantId,
                questionId
            });
        }

        // Extrait modifié dans routes/questionnaire.js au niveau de la route router.post('/reponse')

        if (isCompletionEvent && !alreadyHadCompletionEvent) {
            console.log('[completion] Événement de fin détecté, récupération démographie et envoi email...', {
                participantId,
                language: data.language
            });

            // Récupération des données démographiques (email + mode de paiement + timezone)
            const demoReponse = await Reponse.findOne({
                participantId,
                type: 'demographics'
            }).lean();

            const demographics = demoReponse ? demoReponse.data : {};

            sendCompletionEmail({
                participantId,
                language: data.language,
                demographics
            }).then(() => {
                console.log('[completion-email] Email envoyé avec succès.');
            }).catch(err => {
                console.error('[completion-email] Erreur:', err);
            });
        }


        res.status(200).json({
            message: 'Réponse enregistrée.',
            id: reponse._id
        });

    } catch (err) {
        console.error('[reponse]', err);

        if (err.code === 11000) {
            return res.status(200).json({ message: 'Réponse déjà enregistrée.' });
        }

        res.status(500).json({ erreur: "Erreur serveur." });
    }
});

// Routes d'administration
router.get('/resultats', auth, adminLimiter, async (req, res) => {
    try {
        const summary = await Reponse.aggregate([
            {
                $group: {
                    _id: { participant: "$participantId" },
                    nbReponses: { $sum: 1 },
                    types: { $addToSet: "$type" },
                    debut: { $min: "$timestamp" }
                }
            },
            { $sort: { debut: -1 } }
        ]);

        res.json({ total: summary.length, resultats: summary });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

router.get('/resultats/:participantId', auth, adminLimiter, async (req, res) => {
    try {
        const pid = req.params.participantId;

        if (!PARTICIPANT_ID_RE.test(pid)) {
            return res.status(400).json({ erreur: 'participantId invalide.' });
        }

        const reponses = await Reponse.find({ participantId: pid }).sort({ timestamp: 1 }).lean();

        res.json({ participantId: pid, count: reponses.length, reponses });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

router.get('/export/all', auth, adminLimiter, async (req, res) => {
    try {
        const reponses = await Reponse.find({}).sort({ participantId: 1, timestamp: 1 }).lean();
        res.json(reponses);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

module.exports = router;
