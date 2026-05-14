const mongoose = require('mongoose');

const EvenementSchema = new mongoose.Schema({
    participantId:  { type: String, required: true, index: true },
    type:           { type: String, required: true },
    visitId:        String,
    url:            String,
    timestamp:      String,
    tabId:          Number,
    parentUrl:      String,
    transitionType: String,
    source:         String,
    maxScroll:      Number,
    temps_passe_ms: Number,
    x: Number,
    y: Number,
    texte: String,
    timestamp_reception: { type: Date, default: Date.now }
}, {
    strict: false,
    collection: 'evenements'
});

// Index plus spécifique pour éviter les faux positifs ET les vrais doublons
EvenementSchema.index(
    { participantId: 1, timestamp: 1, type: 1, visitId: 1, tabId: 1 },
    { unique: true }
);

module.exports = mongoose.model('Evenement', EvenementSchema);
