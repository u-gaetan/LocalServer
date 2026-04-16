// routes/collecte.js
const express = require('express');
const router = express.Router();
const Evenement = require('../models/Evenement');
const auth = require('../middlewares/auth');
const { collecteLimiter, adminLimiter } = require('../middlewares/rateLimit');
const { validateCollecteData, validateParamId } = require('../middlewares/validation');

// 🔒 Toutes les routes passent par auth (API key OU JWT)
router.use(auth);


// =========================================================
// 🟢 POST /api/collecte
// Pipeline : rateLimit → validation → handler
// =========================================================
router.post('/', collecteLimiter, validateCollecteData, async (req, res) => {
    try {
        const data = req.body;
        const sessionId = req.validatedSessionId;
        const participantId = req.validatedParticipantId;

        // --- Insertion avec déduplication par MongoDB ---
        let insertedCount = 0;
        let duplicateCount = 0;

        try {
            const result = await Evenement.insertMany(data, { ordered: false });
            insertedCount = result.length;
        } catch (err) {
            if (err.code === 11000 || (err.writeErrors && err.insertedDocs)) {
                // BulkWriteError — doublons rejetés, nouveaux insérés
                insertedCount = err.insertedDocs ? err.insertedDocs.length : 0;

                if (err.result && typeof err.result.insertedCount === 'number') {
                    insertedCount = err.result.insertedCount;
                }

                duplicateCount = data.length - insertedCount;
                console.log(`♻️  ${duplicateCount} doublons ignorés | Session: ${sessionId}`);
            } else {
                throw err;
            }
        }

        const totalEvents = await Evenement.countDocuments({ sessionId });

        if (insertedCount === 0) {
            console.log(`📥 Données déjà à jour | Participant: ${participantId} | Session: ${sessionId}`);
            return res.status(200).json({
                message: "Données déjà à jour.",
                sessionId,
                newEvents: 0,
                duplicatesIgnored: duplicateCount,
                totalEvents
            });
        }

        console.log(`📥 +${insertedCount} événements | Participant: ${participantId} | Session: ${sessionId}`);

        res.status(200).json({
            message: `${insertedCount} nouveaux événements ajoutés.`,
            sessionId,
            participantId,
            newEvents: insertedCount,
            duplicatesIgnored: duplicateCount,
            totalEvents
        });

    } catch (err) {
        console.error("❌ Erreur insertion :", err.message);
        res.status(500).json({ erreur: "Erreur serveur." });
        // NB: ne pas exposer err.message en production
    }
});


// =========================================================
// 🔵 GET /api/collecte/sessions
// =========================================================
router.get('/sessions', adminLimiter, async (req, res) => {
    try {
        const sessions = await Evenement.aggregate([
            {
                $group: {
                    _id: { sessionId: "$sessionId", participantId: "$participantId" },
                    nbEvenements: { $sum: 1 },
                    debut: { $min: "$timestamp" },
                    fin: { $max: "$timestamp" },
                    types: { $addToSet: "$type" }
                }
            },
            { $sort: { debut: -1 } }
        ]);
        res.json({ total_sessions: sessions.length, sessions });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


// =========================================================
// 🔵 GET /api/collecte/participant/:id
// =========================================================
router.get('/participant/:id', adminLimiter, validateParamId('id'), async (req, res) => {
    try {
        const events = await Evenement.find({
            participantId: req.params.id
        }).sort({ timestamp: 1 });
        res.json({ participantId: req.params.id, count: events.length, events });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


// =========================================================
// 📥 EXPORTS
// =========================================================
router.get('/export/all', adminLimiter, async (req, res) => {
    try {
        const events = await Evenement.find({})
            .sort({ participantId: 1, timestamp: 1 })
            .lean();
        res.json(events);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

router.get('/export/participant/:id', adminLimiter, validateParamId('id'), async (req, res) => {
    try {
        const events = await Evenement.find({ participantId: req.params.id })
            .sort({ timestamp: 1 }).lean();
        if (events.length === 0) {
            return res.status(404).json({ erreur: "Participant non trouvé." });
        }
        res.json(events);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

router.get('/export/session/:id', adminLimiter, validateParamId('id'), async (req, res) => {
    try {
        const events = await Evenement.find({ sessionId: req.params.id })
            .sort({ timestamp: 1 }).lean();
        if (events.length === 0) {
            return res.status(404).json({ erreur: "Session non trouvée." });
        }
        res.json(events);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


// =========================================================
// 📊 RÉSUMÉ pour le dashboard admin
// =========================================================
router.get('/resume', adminLimiter, async (req, res) => {
    try {
        const summary = await Evenement.aggregate([
            {
                $group: {
                    _id: {
                        participant: "$participantId",
                        session: "$sessionId"
                    },
                    nbEvenements: { $sum: 1 },
                    debut: { $min: "$timestamp" },
                    nbPages: {
                        $sum: { $cond: [{ $eq: ["$type", "navigation"] }, 1, 0] }
                    },
                    nbClics: {
                        $sum: { $cond: [{ $eq: ["$type", "clic"] }, 1, 0] }
                    }
                }
            },
            { $sort: { debut: -1 } }
        ]);

        const participants = [...new Set(summary.map(s => s._id.participant))];

        res.json({
            totalParticipants: participants.length,
            totalSessions: summary.length,
            sessions: summary
        });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


module.exports = router;
