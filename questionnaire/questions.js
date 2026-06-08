// questionnaire/questions.js

const QUESTION_BANK = {
    facile: [
        {
            id: "F1",
            slug: "Q-capitale-australie",
            text: {
                fr: "Quelle est la capitale de l'Australie ? Décrivez brièvement cette ville et expliquez pourquoi elle a été choisie comme capitale.",
                en: "What is the capital of Australia? Briefly describe this city and explain why it was chosen as the capital."
            },
            memoryQuestions: [
                { 
                    id: "F1_M1", 
                    slug: "Qmemory_1-capitale-australie", 
                    text: {
                        fr: "Quelle est la population approximative de la capitale australienne ?",
                        en: "What is the approximate population of the Australian capital?"
                    }
                },
                { 
                    id: "F1_M2", 
                    slug: "Qmemory_2-capitale-australie", 
                    text: {
                        fr: "Quel lac artificiel se trouve au centre de la capitale australienne ?",
                        en: "What artificial lake is located in the center of the Australian capital?"
                    }
                }
            ]
        },
        {
            id: "F2",
            slug: "Q-insuline",
            text: {
                fr: "Quel organe du corps humain est responsable de la production d'insuline ? Expliquez brièvement le rôle de l'insuline dans l'organisme.",
                en: "Which organ in the human body is responsible for producing insulin? Briefly explain the role of insulin in the body."
            },
            memoryQuestions: [
                { 
                    id: "F2_M1", 
                    slug: "Qmemory_1-insuline", 
                    text: {
                        fr: "Comment s'appellent les cellules spécifiques qui produisent l'insuline ?",
                        en: "What are the specific cells that produce insulin called?"
                    }
                },
                { 
                    id: "F2_M2", 
                    slug: "Qmemory_2-insuline", 
                    text: {
                        fr: "Quel type de diabète est causé par une destruction auto-immune de ces cellules ?",
                        en: "What type of diabetes is caused by an autoimmune destruction of these cells?"
                    }
                }
            ]
        },
        {
            id: "F3",
            slug: "Q-premier-homme-lune",
            text: {
                fr: "En quelle année le premier être humain a-t-il marché sur la Lune ? Nommez cet astronaute et décrivez brièvement la mission.",
                en: "In what year did the first human walk on the Moon? Name this astronaut and briefly describe the mission."
            },
            memoryQuestions: [
                { 
                    id: "F3_M1", 
                    slug: "Qmemory_1-premier-homme-lune", 
                    text: {
                        fr: "Quel était le nom de la mission spatiale qui a permis le premier alunissage ?",
                        en: "What was the name of the space mission that enabled the first moon landing?"
                    }
                },
                { 
                    id: "F3_M2", 
                    slug: "Qmemory_2-premier-homme-lune", 
                    text: {
                        fr: "Combien d'astronautes se trouvaient à bord du vaisseau lors de cette mission ?",
                        en: "How many astronauts were on board the spacecraft during this mission?"
                    }
                }
            ]
        }
    ],
    moyen: [
        {
            id: "M1",
            slug: "Q-effet-de-serre",
            text: {
                fr: "Expliquez le phénomène de l'effet de serre et décrivez son lien avec le réchauffement climatique actuel. Quels en sont les principaux gaz responsables ?",
                en: "Explain the greenhouse effect phenomenon and describe its link to current global warming. What are the main gases responsible for it?"
            },
            memoryQuestions: [
                { 
                    id: "M1_M1", 
                    slug: "Qmemory_1-effet-de-serre", 
                    text: {
                        fr: "Après la vapeur d'eau, quel est le gaz à effet de serre le plus abondant dans l'atmosphère ?",
                        en: "After water vapor, what is the most abundant greenhouse gas in the atmosphere?"
                    }
                },
                { 
                    id: "M1_M2", 
                    slug: "Qmemory_2-effet-de-serre", 
                    text: {
                        fr: "Quel accord international de 2015 vise à limiter le réchauffement climatique ?",
                        en: "Which 2015 international agreement aims to limit global warming?"
                    }
                }
            ]
        },
        {
            id: "M2",
            slug: "Q-blockchain-cryptomonnaies",
            text: {
                fr: "Comment fonctionne la technologie blockchain utilisée par les cryptomonnaies ? Décrivez le principe de fonctionnement et les mécanismes de sécurité.",
                en: "How does the blockchain technology used by cryptocurrencies work? Describe the operating principle and security mechanisms."
            },
            memoryQuestions: [
                { 
                    id: "M2_M1", 
                    slug: "Qmemory_1-blockchain-cryptomonnaies", 
                    text: {
                        fr: "Quel mécanisme de consensus le réseau Bitcoin utilise-t-il pour valider les transactions ?",
                        en: "What consensus mechanism does the Bitcoin network use to validate transactions?"
                    }
                },
                { 
                    id: "M2_M2", 
                    slug: "Qmemory_2-blockchain-cryptomonnaies", 
                    text: {
                        fr: "Sous quel pseudonyme le créateur du Bitcoin est-il connu ?",
                        en: "Under what pseudonym is the creator of Bitcoin known?"
                    }
                }
            ]
        },
        {
            id: "M3",
            slug: "Q-causes-premiere-guerre-mondiale",
            text: {
                fr: "Décrivez les causes principales de la Première Guerre mondiale. Quels facteurs politiques, économiques et militaires ont mené à ce conflit ?",
                en: "Describe the primary causes of the First World War. What political, economic, and military factors led to this conflict?"
            },
            memoryQuestions: [
                { 
                    id: "M3_M1", 
                    slug: "Qmemory_1-causes-premiere-guerre-mondiale", 
                    text: {
                        fr: "Quel événement est considéré comme le déclencheur immédiat de la Première Guerre mondiale ?",
                        en: "What event is considered the immediate trigger of the First World War?"
                    }
                },
                { 
                    id: "M3_M2", 
                    slug: "Qmemory_2-causes-premiere-guerre-mondiale", 
                    text: {
                        fr: "Quels pays formaient la Triple-Entente avant le début de la guerre ?",
                        en: "Which countries formed the Triple Entente before the war began?"
                    }
                }
            ]
        }
    ],
    difficile: [
        {
            id: "D1",
            slug: "Q-hippocampe-memoire",
            text: {
                fr: "Expliquez le rôle de l'hippocampe dans la consolidation de la mémoire à long terme. Décrivez les différents types de mémoire impliqués et les mécanismes neurologiques en jeu.",
                en: "Explain the role of the hippocampus in the consolidation of long-term memory. Describe the different types of memory involved and the neurological mechanisms at play."
            },
            memoryQuestions: [
                { 
                    id: "D1_M1", 
                    slug: "Qmemory_1-hippocampe-memoire", 
                    text: {
                        fr: "Quel patient célèbre a permis de comprendre le rôle de l'hippocampe dans la mémoire ?",
                        en: "Which famous patient helped scientists understand the role of the hippocampus in memory?"
                    }
                },
                { 
                    id: "D1_M2", 
                    slug: "Qmemory_2-hippocampe-memoire", 
                    text: {
                        fr: "Quel type de mémoire est principalement affecté par une lésion de l'hippocampe ?",
                        en: "What type of memory is primarily affected by damage to the hippocampus?"
                    }
                }
            ]
        },
        {
            id: "D2",
            slug: "Q-relativite-restreinte",
            text: {
                fr: "Décrivez la théorie de la relativité restreinte d'Einstein. Quelles sont ses deux postulats fondamentaux et quelles conséquences contre-intuitives en découlent ?",
                en: "Describe Einstein's theory of special relativity. What are its two fundamental postulates and what counter-intuitive consequences follow from them?"
            },
            memoryQuestions: [
                { 
                    id: "D2_M1", 
                    slug: "Qmemory_1-relativite-restreinte", 
                    text: {
                        fr: "Quelle équation célèbre est directement issue de la relativité restreinte ?",
                        en: "Which famous equation is directly derived from special relativity?"
                    }
                },
                { 
                    id: "D2_M2", 
                    slug: "Qmemory_2-relativite-restreinte", 
                    text: {
                        fr: "Quel phénomène prédit que le temps s'écoule plus lentement pour un objet se déplaçant à grande vitesse ?",
                        en: "What phenomenon predicts that time passes more slowly for an object moving at high speed?"
                    }
                }
            ]
        },
        {
            id: "D3",
            slug: "Q-crispr-cas9",
            text: {
                fr: "Expliquez le fonctionnement du système CRISPR-Cas9 en génie génétique. Comment cette technologie permet-elle de modifier l'ADN de manière ciblée ?",
                en: "Explain the mechanism of the CRISPR-Cas9 system in genetic engineering. How does this technology allow for targeted DNA editing?"
            },
            memoryQuestions: [
                { 
                    id: "D3_M1", 
                    slug: "Qmemory_1-crispr-cas9", 
                    text: {
                        fr: "Quel type de molécule guide le complexe CRISPR-Cas9 vers la séquence d'ADN cible ?",
                        en: "What type of molecule guides the CRISPR-Cas9 complex to the target DNA sequence?"
                    }
                },
                { 
                    id: "D3_M2", 
                    slug: "Qmemory_2-crispr-cas9", 
                    text: {
                        fr: "Dans quel type d'organisme le système CRISPR a-t-il été initialement découvert ?",
                        en: "In what type of organism was the CRISPR system originally discovered?"
                    }
                }
            ]
        }
    ]
};

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
                text: mq.text, // bilingual object { fr: "...", en: "..." }
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
                text: q.text, // bilingual object { fr: "...", en: "..." }
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