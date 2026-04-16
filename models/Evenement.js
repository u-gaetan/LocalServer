const mongoose = require('mongoose');

const EvenementSchema = new mongoose.Schema({
    // ===== Identifiants =====
    sessionId:      { type: String, required: true, index: true },
    participantId:  { type: String, required: true, index: true },
    type:           { type: String, required: true },
    visitId:        String,

    // ===== Commun =====
    url:            String,
    timestamp:      String,
    tabId:          Number,

    // ===== Navigation =====
    parentUrl:      String,
    transitionType: String,
    source:         String,

    // ===== page_quittee =====
    maxScroll:      Number,
    temps_passe_ms: Number,

    // ===== Clic =====
    x: Number,
    y: Number,

    // ===== Saisie / Copie =====
    texte: String,

    // ===== Métadonnées serveur =====
    timestamp_reception: { type: Date, default: Date.now }
}, {
    strict: false,
    collection: 'evenements'
});

// Index composé pour les requêtes fréquentes
EvenementSchema.index({ participantId: 1, sessionId: 1, timestamp: 1 },
    { unique : true}
);

module.exports = mongoose.model('Evenement', EvenementSchema);
