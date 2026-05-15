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

        // ── Pré-filtrage applicatif (robuste même sans index unique) ──
        const existingEvents = await Evenement.find(
            { sessionId, participantId },
            { timestamp: 1, type: 1, visitId: 1, tabId: 1, _id: 0 }
        ).lean();

        const existingSet = new Set(
            existingEvents.map(e =>
                `${e.timestamp}|${e.type}|${e.visitId || ''}|${e.tabId || ''}`
            )
        );

        const newData = [];
        let preFilterDuplicates = 0;

        for (const e of data) {
            const key = `${e.timestamp}|${e.type}|${e.visitId || ''}|${e.tabId || ''}`;
            if (existingSet.has(key)) {
                preFilterDuplicates++;
            } else {
                existingSet.add(key); // évite aussi les doublons intra-batch
                newData.push(e);
            }
        }

        if (newData.length === 0) {
            const totalEvents = await Evenement.countDocuments({ sessionId });
            console.log(`📥 Données déjà à jour | Participant: ${participantId} | Session: ${sessionId} | ${preFilterDuplicates} doublons ignorés`);
            return res.status(200).json({
                message: "Données déjà à jour.",
                sessionId,
                newEvents: 0,
                duplicatesIgnored: preFilterDuplicates,
                totalEvents
            });
        }

        // ── Insertion avec protection supplémentaire par l'index ──
        let insertedCount = 0;
        let duplicateCount = preFilterDuplicates;

        try {
            const result = await Evenement.insertMany(newData, { ordered: false });
            insertedCount = result.length;
        } catch (err) {
            if (err.code === 11000 || (err.writeErrors && err.insertedDocs)) {
                insertedCount = err.insertedDocs ? err.insertedDocs.length : 0;
                if (err.result && typeof err.result.insertedCount === 'number') {
                    insertedCount = err.result.insertedCount;
                }
                duplicateCount += newData.length - insertedCount;
                console.log(`♻️  ${duplicateCount} doublons ignorés (total) | Session: ${sessionId}`);
            } else {
                throw err;
            }
        }

        const totalEvents = await Evenement.countDocuments({ sessionId });

        console.log(`📥 +${insertedCount} événements | Participant: ${participantId} | Session: ${sessionId} | ${duplicateCount} doublons`);

        res.status(200).json({
            message: `${insertedCount} nouveaux événements ajoutés.`,
            sessionId,
            participantId,
            newEvents: insertedCount,
            duplicatesIgnored: duplicateCount,
            totalEvents,
            receivedCount: req.originalCount,
            filteredOut: req.originalCount - req.body.length,
            warnings: (req.validationWarnings || []).slice(0, 5)
        });

    } catch (err) {
        console.error("❌ Erreur insertion :", err.message);
        res.status(500).json({ erreur: "Erreur serveur." });
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

        if (req.query.include_responses === 'true') {
            const Reponse = require('../models/Reponse');
            const reponses = await Reponse.find({ participantId: req.params.id })
                .sort({ timestamp: 1 }).lean();
            return res.json({
                participantId: req.params.id,
                events,
                reponses
            });
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

        // ── Inclure les réponses si demandé ──
        if (req.query.include_responses === 'true') {
            const Reponse = require('../models/Reponse');
            const reponses = await Reponse.find({ sessionId: req.params.id })
                .sort({ timestamp: 1 }).lean();
            return res.json({
                sessionId: req.params.id,
                participantId: events[0].participantId,
                events,
                reponses
            });
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
                    _id: { participant: "$participantId" },
                    nbEvenements: { $sum: 1 },
                    debut: { $min: "$timestamp" },
                    nbPages: { $sum: { $cond: [{ $eq: ["$type", "navigation"] }, 1, 0] } },
                    nbClics: { $sum: { $cond: [{ $eq: ["$type", "clic"] }, 1, 0] } }
                }
            },
            { $sort: { debut: -1 } }
        ]);

        res.json({
            totalParticipants: summary.length,
            sessions: summary
        });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


module.exports = router;
