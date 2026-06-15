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
        
        const includeResponses = req.query.include_responses === 'true';
        let reponses = [];

        if (includeResponses) {
            const Reponse = require('../models/Reponse');
            reponses = await Reponse.find({ participantId: req.params.id })
                .sort({ timestamp: 1 }).lean();
        }

        // Si aucun événement ni réponse n'est trouvé, renvoyer une erreur 404
        if (events.length === 0 && (!includeResponses || reponses.length === 0)) {
            return res.status(404).json({ erreur: "Participant non trouvé." });
        }

        if (includeResponses) {
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
// 📊 RÉSUMÉ pour le dashboard admin (Fusion Evenement + Reponse)
// =========================================================
router.get('/resume', adminLimiter, async (req, res) => {
    try {
        // 1. Aggréger les données de la collection Evenement
        const eventSummary = await Evenement.aggregate([
            {
                $group: {
                    _id: "$participantId",
                    nbEvenements: { $sum: 1 },
                    debut: { $min: "$timestamp" },
                    nbPages: { $sum: { $cond: [{ $eq: ["$type", "navigation"] }, 1, 0] } },
                    nbClics: { $sum: { $cond: [{ $eq: ["$type", "clic"] }, 1, 0] } }
                }
            }
        ]);

        // 2. Récupérer les informations de consentement de la collection Reponse
        const Reponse = require('../models/Reponse');
        const consents = await Reponse.find(
            { type: { $in: ['consent', 'deception_consent'] } },
            { participantId: 1, type: 1, data: 1, timestamp: 1 }
        ).lean();

        // Récupérer tous les participants de la collection Reponse
        const allRepParticipants = await Reponse.aggregate([
            {
                $group: {
                    _id: "$participantId",
                    debut: { $min: "$timestamp" }
                }
            }
        ]);

        // Structurer la map des consentements par participant
        const consentMap = {};
        consents.forEach(r => {
            const pid = r.participantId;
            if (!pid) return;
            if (!consentMap[pid]) {
                consentMap[pid] = { c1: "Non spécifié", c2: "Non spécifié" };
            }
            if (r.type === 'consent') {
                consentMap[pid].c1 = (r.data && r.data.consent) ? "✅ Accepté" : "❌ Refusé";
            }
            if (r.type === 'deception_consent') {
                consentMap[pid].c2 = (r.data && r.data.decision === 'maintain') ? "✅ Maintenu" : "🚨 RETIRÉ";
            }
        });

        // Fusionner les données de tous les participants uniques
        const participantMap = {};

        // Ajout des participants de la collection Evenement
        eventSummary.forEach(item => {
            const pid = item._id;
            if (pid) {
                participantMap[pid] = {
                    _id: { participant: pid },
                    nbEvenements: item.nbEvenements,
                    debut: item.debut,
                    nbPages: item.nbPages,
                    nbClics: item.nbClics,
                    c1: "Non spécifié",
                    c2: "Non spécifié"
                };
            }
        });

        // Ajout/Mise à jour avec les participants uniquement présents dans la collection Reponse
        allRepParticipants.forEach(item => {
            const pid = item._id;
            if (pid) {
                if (!participantMap[pid]) {
                    participantMap[pid] = {
                        _id: { participant: pid },
                        nbEvenements: 0,
                        debut: item.debut,
                        nbPages: 0,
                        nbClics: 0,
                        c1: "Non spécifié",
                        c2: "Non spécifié"
                    };
                } else if (!participantMap[pid].debut || new Date(item.debut) < new Date(participantMap[pid].debut)) {
                    participantMap[pid].debut = item.debut;
                }
            }
        });

        // Attacher les états de consentement (C1 et C2) à la carte globale
        Object.keys(consentMap).forEach(pid => {
            if (participantMap[pid]) {
                participantMap[pid].c1 = consentMap[pid].c1;
                participantMap[pid].c2 = consentMap[pid].c2;
            }
        });

        // Convertir en tableau trié du plus récent au plus ancien
        const mergedSummary = Object.values(participantMap).sort((a, b) => {
            const dateA = a.debut ? new Date(a.debut) : new Date(0);
            const dateB = b.debut ? new Date(b.debut) : new Date(0);
            return dateB - dateA;
        });

        res.json({
            totalParticipants: mergedSummary.length,
            sessions: mergedSummary
        });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});


module.exports = router;
