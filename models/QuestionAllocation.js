// models/QuestionAllocation.js
const mongoose = require('mongoose');

const QuestionAllocationSchema = new mongoose.Schema({
    participantId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    language: {
        type: String,
        enum: ['fr', 'en'],
        required: true,
        index: true
    },
    questions: [{
        id: { type: String, required: true },
        number: { type: Number, required: true },
        difficulty: {
            type: String,
            enum: ['facile', 'moyen', 'difficile'],
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: null
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('QuestionAllocation', QuestionAllocationSchema);
