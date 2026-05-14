// routes/questionnaire.js
const express = require('express');
const router = express.Router();
const Reponse = require('../models/Reponse');
const auth = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimit');
const rateLimit = require('express-rate-limit');

// Rate limiter pour les participants (POST)
const participantLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { erreur: "Trop de requêtes. Patientez." }
});

// ⚠️  PAS de router.use(auth) ici !
// L'auth est appliquée individuellement sur les routes admin GET.

const PARTICIPANT_ID_RE = /^P-[a-z0-9]{7,10}-[a-z0-9]{4}$/;
const SESSION_ID_RE = /^session_\d{12,15}_[a-z0-9]{6}$/;
const ALLOWED_TYPES = new Set([
    'consent', 'deception_consent',
    'demographics', 'research_answer', 'self_assessment',
    'memory_answer', 'questionnaire_event'
]);


// =========================================================
// 🟢 POST /api/questionnaire/reponse — PARTICIPANT (pas d'auth)
// =========================================================
router.post('/reponse', participantLimiter, async (req, res) => {
    try {
        const { participantId, type, questionId, difficulty, data, timestamp } = req.body;

        // --- Validation ---
        if (!participantId || !PARTICIPANT_ID_RE.test(participantId)) {
            console.warn('⚠️  Rejet questionnaire: participantId invalide:', participantId);
            return res.status(400).json({ erreur: 'participantId invalide.' });
        }
        if (!type || !ALLOWED_TYPES.has(type)) {
            console.warn('⚠️  Rejet questionnaire: type invalide:', type);
            return res.status(400).json({ erreur: `type invalide : "${type}"` });
        }
        if (!data || typeof data !== 'object') {
            console.warn('⚠️  Rejet questionnaire: data invalide');
            return res.status(400).json({ erreur: 'data doit être un objet.' });
        }
        if (!timestamp || isNaN(Date.parse(timestamp))) {
            console.warn('⚠️  Rejet questionnaire: timestamp invalide:', timestamp);
            return res.status(400).json({ erreur: 'timestamp invalide.' });
        }

        // --- Insertion (upsert pour éviter les doublons) ---
        const filter = { participantId, type };
        if (questionId) filter.questionId = questionId;

        const reponse = await Reponse.findOneAndUpdate(
            filter,
            { participantId, type, questionId, difficulty, data, timestamp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`📝 Réponse ${type} | Participant: ${participantId} | Question: ${questionId || 'N/A'} | ID: ${reponse._id}`);

        res.status(200).json({
            message: 'Réponse enregistrée.',
            id: reponse._id
        });

    } catch (err) {
        if (err.code === 11000) {
            console.log(`♻️  Doublon questionnaire ignoré | ${req.body.type} | ${req.body.questionId}`);
            return res.status(200).json({ message: 'Réponse déjà enregistrée.' });
        }
        console.error("❌ Erreur questionnaire :", err.message);
        res.status(500).json({ erreur: "Erreur serveur." });
    }
});


// =========================================================
// 🔵 GET /api/questionnaire/resultats — ADMIN (auth requise)
// =========================================================
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


// =========================================================
// 📥 EXPORT — ADMIN (auth requise)
// =========================================================
router.get('/export/all', auth, adminLimiter, async (req, res) => {
    try {
        const reponses = await Reponse.find({}).sort({ participantId: 1, timestamp: 1 }).lean();
        res.json(reponses);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


module.exports = router;
