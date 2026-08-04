// services/questionBankService.js
const path = require('path');
const XLSX = require('xlsx');
const QuestionAllocation = require('../models/QuestionAllocation');

const EASY = new Set([1, 4, 9, 10, 12, 13, 14, 15]);
const MEDIUM = new Set([2, 3, 5, 6, 7, 8, 11]);
const HARD = new Set([16, 17, 18, 19, 20]);

const DRAW_CONFIG = {
    facile: 2,
    moyen: 2,
    difficile: 1
};

let cache = {
    fr: null,
    en: null
};

function getExcelPath(language) {
    if (language === 'en') {
        return process.env.QUESTION_BANK_EN || path.join(__dirname, '..', 'data', 'questions_en.xlsx');
    }
    return process.env.QUESTION_BANK_FR || path.join(__dirname, '..', 'data', 'questions_fr.xlsx');
}

function classifyDifficulty(number) {
    if (EASY.has(number)) return 'facile';
    if (MEDIUM.has(number)) return 'moyen';
    if (HARD.has(number)) return 'difficile';
    throw new Error(`Numéro de question non classé : ${number}`);
}

function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function loadQuestionBank(language, forceReload = false) {
    const lang = language === 'en' ? 'en' : 'fr';

    if (cache[lang] && !forceReload) {
        return cache[lang];
    }

    const filePath = getExcelPath(lang);
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ''
    });

    const questions = [];

    // Ligne 6 Excel => index JS 5.
    // Si la ligne 6 est une ligne d'en-tête, elle sera ignorée car B ne sera pas numérique.
    for (let r = 5; r < rows.length; r++) {
        const row = rows[r];

        const rawNumber = row[1]; // Colonne B
        const rawQuestion = row[2]; // Colonne C
        const rawMemory = row[4]; // Colonne E

        const number = parseInt(String(rawNumber).trim(), 10);

        if (!Number.isInteger(number) || number < 1 || number > 20) {
            continue;
        }

        const questionText = String(rawQuestion || '').trim();
        const memoryText = String(rawMemory || '').trim();

        if (!questionText) {
            throw new Error(`Question vide pour le numéro ${number} dans ${filePath}`);
        }

        if (!memoryText) {
            throw new Error(`Question de mémorisation vide pour le numéro ${number} dans ${filePath}`);
        }

        const difficulty = classifyDifficulty(number);

        questions.push({
            id: `q${number}`,
            number,
            difficulty,
            text: {
                [lang]: questionText
            },
            memoryQuestion: {
                id: `m_q${number}`,
                sourceQuestionId: `q${number}`,
                number,
                text: {
                    [lang]: memoryText
                }
            }
        });
    }

    if (questions.length !== 20) {
        throw new Error(`La banque ${lang} doit contenir 20 questions valides. Questions trouvées : ${questions.length}`);
    }

    questions.sort((a, b) => a.number - b.number);
    cache[lang] = questions;

    return questions;
}

async function getUsageMap(language) {
    const rows = await QuestionAllocation.aggregate([
        { $match: { language } },
        { $unwind: '$questions' },
        {
            $group: {
                _id: '$questions.id',
                assignedCount: { $sum: 1 },
                completedCount: {
                    $sum: {
                        $cond: ['$questions.completed', 1, 0]
                    }
                }
            }
        }
    ]);

    const map = new Map();

    rows.forEach(row => {
        map.set(row._id, {
            assignedCount: row.assignedCount || 0,
            completedCount: row.completedCount || 0
        });
    });

    return map;
}

function selectBalanced(candidates, usageMap, count) {
    const enriched = candidates.map(q => {
        const usage = usageMap.get(q.id) || { assignedCount: 0, completedCount: 0 };
        return {
            question: q,
            assignedCount: usage.assignedCount,
            completedCount: usage.completedCount,
            random: Math.random()
        };
    });

    // Priorité :
    // 1. questions les moins complétées ;
    // 2. questions les moins assignées ;
    // 3. hasard pour départager.
    enriched.sort((a, b) => {
        if (a.completedCount !== b.completedCount) {
            return a.completedCount - b.completedCount;
        }
        if (a.assignedCount !== b.assignedCount) {
            return a.assignedCount - b.assignedCount;
        }
        return a.random - b.random;
    });

    return enriched.slice(0, count).map(x => x.question);
}

function formatDrawForClient(language, selectedQuestions) {
    const researchQuestions = selectedQuestions.map(q => ({
        id: q.id,
        number: q.number,
        difficulty: q.difficulty,
        text: q.text
    }));

    const memoryQuestions = selectedQuestions.map(q => ({
        id: q.memoryQuestion.id,
        sourceQuestionId: q.id,
        number: q.number,
        text: q.memoryQuestion.text
    }));

    return {
        language,
        researchQuestions,
        memoryQuestions
    };
}

async function drawBalancedQuestions({ participantId, language }) {
    const lang = language === 'en' ? 'en' : 'fr';

    const existing = await QuestionAllocation.findOne({ participantId }).lean();
    const bank = loadQuestionBank(lang);

    if (existing) {
        const byId = new Map(bank.map(q => [q.id, q]));
        const selectedExisting = existing.questions
            .map(q => byId.get(q.id))
            .filter(Boolean);

        if (selectedExisting.length === 5) {
            return formatDrawForClient(existing.language, selectedExisting);
        }
    }

    const usageMap = await getUsageMap(lang);

    const selected = [];

    Object.entries(DRAW_CONFIG).forEach(([difficulty, count]) => {
        const candidates = bank.filter(q => q.difficulty === difficulty);
        selected.push(...selectBalanced(candidates, usageMap, count));
    });

    const randomized = shuffle(selected);

    await QuestionAllocation.findOneAndUpdate(
        { participantId },
        {
            participantId,
            language: lang,
            questions: randomized.map(q => ({
                id: q.id,
                number: q.number,
                difficulty: q.difficulty,
                completed: false,
                completedAt: null
            }))
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    return formatDrawForClient(lang, randomized);
}

async function markResearchQuestionCompleted({ participantId, questionId }) {
    if (!participantId || !questionId) return;

    await QuestionAllocation.updateOne(
        {
            participantId,
            'questions.id': questionId
        },
        {
            $set: {
                'questions.$.completed': true,
                'questions.$.completedAt': new Date()
            }
        }
    );
}

module.exports = {
    loadQuestionBank,
    drawBalancedQuestions,
    markResearchQuestionCompleted
};
