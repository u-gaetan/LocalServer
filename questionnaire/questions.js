// questionnaire/questions.js

const QUESTION_BANK = {

    facile: [
        {
            id: "F1",
            text: "Quelle est la capitale de l'Australie ? Décrivez brièvement cette ville et expliquez pourquoi elle a été choisie comme capitale.",
            memoryQuestions: [
                {
                    id: "F1_M1",
                    text: "Quelle est la population approximative de la capitale australienne ?",
                    options: ["~100 000", "~450 000", "~2 millions", "~5 millions"],
                    correct: 1
                },
                {
                    id: "F1_M2",
                    text: "Quel lac artificiel se trouve au centre de la capitale australienne ?",
                    options: ["Lac Victoria", "Lac Murray", "Lac Burley Griffin", "Lac Canberra"],
                    correct: 2
                }
            ]
        },
        {
            id: "F2",
            text: "Quel organe du corps humain est responsable de la production d'insuline ? Expliquez brièvement le rôle de l'insuline dans l'organisme.",
            memoryQuestions: [
                {
                    id: "F2_M1",
                    text: "Comment s'appellent les cellules spécifiques qui produisent l'insuline ?",
                    options: ["Cellules alpha", "Cellules bêta", "Cellules gamma", "Cellules delta"],
                    correct: 1
                },
                {
                    id: "F2_M2",
                    text: "Quel type de diabète est causé par une destruction auto-immune de ces cellules ?",
                    options: ["Type 1", "Type 2", "Gestationnel", "Insipide"],
                    correct: 0
                }
            ]
        },
        {
            id: "F3",
            text: "En quelle année le premier être humain a-t-il marché sur la Lune ? Nommez cet astronaute et décrivez brièvement la mission.",
            memoryQuestions: [
                {
                    id: "F3_M1",
                    text: "Quel était le nom de la mission spatiale qui a permis le premier alunissage ?",
                    options: ["Apollo 10", "Apollo 11", "Gemini 12", "Mercury 7"],
                    correct: 1
                },
                {
                    id: "F3_M2",
                    text: "Combien d'astronautes se trouvaient à bord du vaisseau lors de cette mission ?",
                    options: ["1", "2", "3", "4"],
                    correct: 2
                }
            ]
        }
    ],

    moyen: [
        {
            id: "M1",
            text: "Expliquez le phénomène de l'effet de serre et décrivez son lien avec le réchauffement climatique actuel. Quels en sont les principaux gaz responsables ?",
            memoryQuestions: [
                {
                    id: "M1_M1",
                    text: "Après la vapeur d'eau, quel est le gaz à effet de serre le plus abondant dans l'atmosphère ?",
                    options: ["Méthane (CH₄)", "Dioxyde de carbone (CO₂)", "Protoxyde d'azote (N₂O)", "Ozone (O₃)"],
                    correct: 1
                },
                {
                    id: "M1_M2",
                    text: "Quel accord international de 2015 vise à limiter le réchauffement climatique ?",
                    options: ["Protocole de Kyoto", "Accord de Paris", "Sommet de Copenhague", "Protocole de Montréal"],
                    correct: 1
                }
            ]
        },
        {
            id: "M2",
            text: "Comment fonctionne la technologie blockchain utilisée par les cryptomonnaies ? Décrivez le principe de fonctionnement et les mécanismes de sécurité.",
            memoryQuestions: [
                {
                    id: "M2_M1",
                    text: "Quel mécanisme de consensus le réseau Bitcoin utilise-t-il pour valider les transactions ?",
                    options: ["Proof of Stake", "Proof of Work", "Proof of Authority", "Delegated Proof of Stake"],
                    correct: 1
                },
                {
                    id: "M2_M2",
                    text: "Sous quel pseudonyme le créateur du Bitcoin est-il connu ?",
                    options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Gavin Andresen"],
                    correct: 1
                }
            ]
        },
        {
            id: "M3",
            text: "Décrivez les causes principales de la Première Guerre mondiale. Quels facteurs politiques, économiques et militaires ont mené à ce conflit ?",
            memoryQuestions: [
                {
                    id: "M3_M1",
                    text: "Quel événement est considéré comme le déclencheur immédiat de la Première Guerre mondiale ?",
                    options: [
                        "L'invasion de la Belgique",
                        "L'assassinat de l'archiduc François-Ferdinand",
                        "Le naufrage du Lusitania",
                        "La mobilisation russe"
                    ],
                    correct: 1
                },
                {
                    id: "M3_M2",
                    text: "Quels pays formaient la Triple-Entente avant le début de la guerre ?",
                    options: [
                        "Allemagne, Autriche-Hongrie, Italie",
                        "France, Russie, Royaume-Uni",
                        "France, Allemagne, Russie",
                        "Royaume-Uni, États-Unis, France"
                    ],
                    correct: 1
                }
            ]
        }
    ],

    difficile: [
        {
            id: "D1",
            text: "Expliquez le rôle de l'hippocampe dans la consolidation de la mémoire à long terme. Décrivez les différents types de mémoire impliqués et les mécanismes neurologiques en jeu.",
            memoryQuestions: [
                {
                    id: "D1_M1",
                    text: "Quel patient célèbre a permis de comprendre le rôle de l'hippocampe dans la mémoire ?",
                    options: ["Phineas Gage", "Patient H.M. (Henry Molaison)", "Patient Tan", "Little Albert"],
                    correct: 1
                },
                {
                    id: "D1_M2",
                    text: "Quel type de mémoire est principalement affecté par une lésion de l'hippocampe ?",
                    options: ["Mémoire procédurale", "Mémoire déclarative (épisodique)", "Mémoire sensorielle", "Mémoire implicite"],
                    correct: 1
                }
            ]
        },
        {
            id: "D2",
            text: "Décrivez la théorie de la relativité restreinte d'Einstein. Quelles sont ses deux postulats fondamentaux et quelles conséquences contre-intuitives en découlent ?",
            memoryQuestions: [
                {
                    id: "D2_M1",
                    text: "Quelle équation célèbre est directement issue de la relativité restreinte ?",
                    options: ["F = ma", "E = mc²", "PV = nRT", "ΔS ≥ 0"],
                    correct: 1
                },
                {
                    id: "D2_M2",
                    text: "Quel phénomène prédit que le temps s'écoule plus lentement pour un objet se déplaçant à grande vitesse ?",
                    options: ["Contraction des longueurs", "Effet photoélectrique", "Dilatation du temps", "Décalage vers le rouge"],
                    correct: 2
                }
            ]
        },
        {
            id: "D3",
            text: "Expliquez le fonctionnement du système CRISPR-Cas9 en génie génétique. Comment cette technologie permet-elle de modifier l'ADN de manière ciblée ?",
            memoryQuestions: [
                {
                    id: "D3_M1",
                    text: "Quel type de molécule guide le complexe CRISPR-Cas9 vers la séquence d'ADN cible ?",
                    options: ["ADN complémentaire", "ARN guide (sgRNA)", "Protéine chaperon", "ARN messager"],
                    correct: 1
                },
                {
                    id: "D3_M2",
                    text: "Dans quel type d'organisme le système CRISPR a-t-il été initialement découvert ?",
                    options: ["Souris", "Cellules humaines", "Bactéries", "Levures"],
                    correct: 2
                }
            ]
        }
    ]
};

// Configuration du tirage
const DRAW_CONFIG = {
    questionsPerDifficulty: 2,  // 2 faciles + 2 moyennes + 2 difficiles = 6 questions
};

/**
 * Tire aléatoirement les questions de recherche (équilibré par difficulté)
 * et collecte les questions de mémoire liées.
 */
function drawQuestions() {
    const n = DRAW_CONFIG.questionsPerDifficulty;

    const selected = [
        ...shuffleArray([...QUESTION_BANK.facile]).slice(0, n),
        ...shuffleArray([...QUESTION_BANK.moyen]).slice(0, n),
        ...shuffleArray([...QUESTION_BANK.difficile]).slice(0, n),
    ];

    // Mélanger l'ordre de présentation des questions de recherche
    const shuffledQuestions = shuffleArray(selected);

    // Collecter et mélanger les questions de mémoire correspondantes
    const memoryQuestions = [];
    for (const q of shuffledQuestions) {
        for (const mq of q.memoryQuestions) {
            memoryQuestions.push({
                ...mq,
                sourceQuestionId: q.id,
                sourceDifficulty: getDifficulty(q.id)
            });
        }
    }

    return {
        researchQuestions: shuffledQuestions.map(q => ({
            id: q.id,
            text: q.text,
            difficulty: getDifficulty(q.id)
        })),
        memoryQuestions: shuffleArray(memoryQuestions)
    };
}

function getDifficulty(questionId) {
    const prefix = questionId.charAt(0);
    if (prefix === 'F') return 'facile';
    if (prefix === 'M') return 'moyen';
    if (prefix === 'D') return 'difficile';
    return 'inconnu';
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
