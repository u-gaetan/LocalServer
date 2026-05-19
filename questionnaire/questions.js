// questionnaire/questions.js

const QUESTION_BANK = {
    facile: [
        {
            id: "F1",
            slug: "Q-capitale-australie",
            text: "Quelle est la capitale de l'Australie ? Décrivez brièvement cette ville et expliquez pourquoi elle a été choisie comme capitale.",
            memoryQuestions: [
                { id: "F1_M1", slug: "Qmemory_1-capitale-australie", text: "Quelle est la population approximative de la capitale australienne ?" },
                { id: "F1_M2", slug: "Qmemory_2-capitale-australie", text: "Quel lac artificiel se trouve au centre de la capitale australienne ?" }
            ]
        },
        {
            id: "F2",
            slug: "Q-insuline",
            text: "Quel organe du corps humain est responsable de la production d'insuline ? Expliquez brièvement le rôle de l'insuline dans l'organisme.",
            memoryQuestions: [
                { id: "F2_M1", slug: "Qmemory_1-insuline", text: "Comment s'appellent les cellules spécifiques qui produisent l'insuline ?" },
                { id: "F2_M2", slug: "Qmemory_2-insuline", text: "Quel type de diabète est causé par une destruction auto-immune de ces cellules ?" }
            ]
        },
        {
            id: "F3",
            slug: "Q-premier-homme-lune",
            text: "En quelle année le premier être humain a-t-il marché sur la Lune ? Nommez cet astronaute et décrivez brièvement la mission.",
            memoryQuestions: [
                { id: "F3_M1", slug: "Qmemory_1-premier-homme-lune", text: "Quel était le nom de la mission spatiale qui a permis le premier alunissage ?" },
                { id: "F3_M2", slug: "Qmemory_2-premier-homme-lune", text: "Combien d'astronautes se trouvaient à bord du vaisseau lors de cette mission ?" }
            ]
        }
    ],
    moyen: [
        {
            id: "M1",
            slug: "Q-effet-de-serre",
            text: "Expliquez le phénomène de l'effet de serre et décrivez son lien avec le réchauffement climatique actuel. Quels en sont les principaux gaz responsables ?",
            memoryQuestions: [
                { id: "M1_M1", slug: "Qmemory_1-effet-de-serre", text: "Après la vapeur d'eau, quel est le gaz à effet de serre le plus abondant dans l'atmosphère ?" },
                { id: "M1_M2", slug: "Qmemory_2-effet-de-serre", text: "Quel accord international de 2015 vise à limiter le réchauffement climatique ?" }
            ]
        },
        {
            id: "M2",
            slug: "Q-blockchain-cryptomonnaies",
            text: "Comment fonctionne la technologie blockchain utilisée par les cryptomonnaies ? Décrivez le principe de fonctionnement et les mécanismes de sécurité.",
            memoryQuestions: [
                { id: "M2_M1", slug: "Qmemory_1-blockchain-cryptomonnaies", text: "Quel mécanisme de consensus le réseau Bitcoin utilise-t-il pour valider les transactions ?" },
                { id: "M2_M2", slug: "Qmemory_2-blockchain-cryptomonnaies", text: "Sous quel pseudonyme le créateur du Bitcoin est-il connu ?" }
            ]
        },
        {
            id: "M3",
            slug: "Q-causes-premiere-guerre-mondiale",
            text: "Décrivez les causes principales de la Première Guerre mondiale. Quels facteurs politiques, économiques et militaires ont mené à ce conflit ?",
            memoryQuestions: [
                { id: "M3_M1", slug: "Qmemory_1-causes-premiere-guerre-mondiale", text: "Quel événement est considéré comme le déclencheur immédiat de la Première Guerre mondiale ?" },
                { id: "M3_M2", slug: "Qmemory_2-causes-premiere-guerre-mondiale", text: "Quels pays formaient la Triple-Entente avant le début de la guerre ?" }
            ]
        }
    ],
    difficile: [
        {
            id: "D1",
            slug: "Q-hippocampe-memoire",
            text: "Expliquez le rôle de l'hippocampe dans la consolidation de la mémoire à long terme. Décrivez les différents types de mémoire impliqués et les mécanismes neurologiques en jeu.",
            memoryQuestions: [
                { id: "D1_M1", slug: "Qmemory_1-hippocampe-memoire", text: "Quel patient célèbre a permis de comprendre le rôle de l'hippocampe dans la mémoire ?" },
                { id: "D1_M2", slug: "Qmemory_2-hippocampe-memoire", text: "Quel type de mémoire est principalement affecté par une lésion de l'hippocampe ?" }
            ]
        },
        {
            id: "D2",
            slug: "Q-relativite-restreinte",
            text: "Décrivez la théorie de la relativité restreinte d'Einstein. Quelles sont ses deux postulats fondamentaux et quelles conséquences contre-intuitives en découlent ?",
            memoryQuestions: [
                { id: "D2_M1", slug: "Qmemory_1-relativite-restreinte", text: "Quelle équation célèbre est directement issue de la relativité restreinte ?" },
                { id: "D2_M2", slug: "Qmemory_2-relativite-restreinte", text: "Quel phénomène prédit que le temps s'écoule plus lentement pour un objet se déplaçant à grande vitesse ?" }
            ]
        },
        {
            id: "D3",
            slug: "Q-crispr-cas9",
            text: "Expliquez le fonctionnement du système CRISPR-Cas9 en génie génétique. Comment cette technologie permet-elle de modifier l'ADN de manière ciblée ?",
            memoryQuestions: [
                { id: "D3_M1", slug: "Qmemory_1-crispr-cas9", text: "Quel type de molécule guide le complexe CRISPR-Cas9 vers la séquence d'ADN cible ?" },
                { id: "D3_M2", slug: "Qmemory_2-crispr-cas9", text: "Dans quel type d'organisme le système CRISPR a-t-il été initialement découvert ?" }
            ]
        }
    ]
};

// =========================================================
// CONFIGURATION DU TIRAGE
// =========================================================
const DRAW_CONFIG = {
    facile: 1,
    moyen: 1,
    difficile: 1
};

function drawQuestions() {
    var selected = [];
    var faciles = shuffleArray(QUESTION_BANK.facile.slice()).slice(0, DRAW_CONFIG.facile);
    var moyens = shuffleArray(QUESTION_BANK.moyen.slice()).slice(0, DRAW_CONFIG.moyen);
    var difficiles = shuffleArray(QUESTION_BANK.difficile.slice()).slice(0, DRAW_CONFIG.difficile);

    selected = selected.concat(faciles, moyens, difficiles);
    var shuffledQuestions = shuffleArray(selected);

    var memoryQuestions = [];
    shuffledQuestions.forEach(function (q) {
        q.memoryQuestions.forEach(function (mq) {
            memoryQuestions.push({
                id: mq.id,
                slug: mq.slug,
                text: mq.text,
                sourceQuestionId: q.id,
                sourceDifficulty: getDifficulty(q.id)
            });
        });
    });

    return {
        researchQuestions: shuffledQuestions.map(function (q) {
            return {
                id: q.id,
                slug: q.slug,
                text: q.text,
                difficulty: getDifficulty(q.id)
            };
        }),
        memoryQuestions: shuffleArray(memoryQuestions)
    };
}

function getDifficulty(questionId) {
    var prefix = questionId.charAt(0);
    if (prefix === 'F') return 'facile';
    if (prefix === 'M') return 'moyen';
    if (prefix === 'D') return 'difficile';
    return 'inconnu';
}

function shuffleArray(array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}