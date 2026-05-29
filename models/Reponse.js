// models/Reponse.js
const mongoose = require('mongoose');

const ReponseSchema = new mongoose.Schema({
    participantId:  { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: [
            'consent',              
            'deception_consent',
            'demographics',
            'research_answer',
            'self_assessment',
            'memory_answer',
            'questionnaire_event',
            'internet_skills'
        ]
    },
    questionId:     { type: String, default: null },
    difficulty:     { type: String, default: null },
    data:           { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp:      { type: String, required: true }
}, {
    timestamps: true  // ajoute createdAt / updatedAt automatiquement
});

// Index pour éviter les doublons (même participant, même question, même type)
ReponseSchema.index(
    { participantId: 1, type: 1, questionId: 1 },
    { unique: true, partialFilterExpression: { questionId: { $ne: null } } }
);

module.exports = mongoose.model('Reponse', ReponseSchema);
