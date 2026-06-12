// routes/questionnaire.js
const express = require('express');
const router = express.Router();
const Reponse = require('../models/Reponse');
const auth = require('../middlewares/auth');
const { adminLimiter, getCleanIp } = require('../middlewares/rateLimit');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/keyVault');

const participantLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp,                    // ← utilise ta fonction
    validate: { trustProxy: false, ip: false },  // ← empêche le crash Azure
    message: { erreur: "Trop de requêtes. Patientez." }
});


const PARTICIPANT_ID_RE = /^P-[a-z0-9]{7,10}-[a-z0-9]{4}$/;
const ALLOWED_TYPES = new Set([
    'consent', 'deception_consent',
    'demographics', 'research_answer', 'self_assessment',
    'memory_answer', 'questionnaire_event', 'internet_skills'
]);

// Génération et signature d'une session participant vierge
router.post('/init-session', participantLimiter, async (req, res) => {
    try {
        const secrets = getSecrets();
        
        // Génération du participantId : P-[timestamp Base36]-[random]
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 6);
        const participantId = `P-${timestamp}-${random}`;

        // Signature du jeton d'accès pour ce participant
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

// --- NOUVEAU : Route pour distribuer un JWT temporaire au Participant ---
router.post('/token', participantLimiter, async (req, res) => {
    try {
        const { participantId } = req.body;
        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            return res.status(400).json({ erreur: 'Format du participantId invalide.' });
        }

        const secrets = getSecrets();
        
        // Signature du jeton d'accès pour le participant
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

// --- SÉCURISÉ : Soumission d'une réponse (Requiert désormais le Jeton JWT) ---
router.post('/reponse', participantLimiter, auth, async (req, res) => {
    try {
        const { participantId, type, questionId, difficulty, data, timestamp } = req.body;

        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            return res.status(400).json({ erreur: 'participantId invalide.' });
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

        const filter = { participantId, type };
        if (questionId) filter.questionId = questionId;

        const reponse = await Reponse.findOneAndUpdate(
            filter,
            { participantId, type, questionId, difficulty, data, timestamp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: 'Réponse enregistrée.',
            id: reponse._id
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ message: 'Réponse déjà enregistrée.' });
        }
        res.status(500).json({ erreur: "Erreur serveur." });
    }
});

// --- SÉCURISÉ : Routes d'administration ---
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