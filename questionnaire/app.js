// questionnaire/app.js
(function () {
    'use strict';

    // =========================================================
    // CONFIG
    // =========================================================
    const API_BASE = window.location.origin + '/api/questionnaire';

    // =========================================================
    // STATE
    // =========================================================
    let state = {
        phase: 'welcome',
        participantId: null,
        sessionId: null,
        demographics: null,
        researchQuestions: [],
        memoryQuestions: [],
        currentResearchIndex: 0,
        currentMemoryIndex: 0,
        answers: [],
        selfAssessments: [],
        memoryAnswers: [],
        questionStartTime: null,
        drawnQuestionIds: []
    };

    const app = document.getElementById('app');
    const timerEl = document.getElementById('timer');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    let timerInterval = null;
    let elapsedSeconds = 0;

    // =========================================================
    // INIT
    // =========================================================
    function init() {
        const params = new URLSearchParams(window.location.search);
        state.participantId = params.get('pid');
        state.sessionId = params.get('sid');

        if (!state.participantId || !state.sessionId) {
            app.innerHTML = `
                <div style="text-align:center; padding:60px 0;">
                    <h1>⚠️ Accès invalide</h1>
                    <p>Veuillez démarrer l'étude depuis l'extension Chrome.<br>
                    Le questionnaire s'ouvrira automatiquement.</p>
                </div>`;
            return;
        }

        // Restaurer la progression si existante
        const saved = sessionStorage.getItem('questionnaire_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.participantId === state.participantId &&
                    parsed.sessionId === state.sessionId) {
                    state = parsed;
                    renderPhase();
                    return;
                }
            } catch (e) { /* ignore */ }
        }

        renderPhase();

        const initSlug = getSlugForPhase(state.phase);
        const initUrl = '/questionnaire/' + initSlug
                    + '?pid=' + encodeURIComponent(state.participantId)
                    + '&sid=' + encodeURIComponent(state.sessionId);
        history.replaceState({
            phase: state.phase,
            currentResearchIndex: state.currentResearchIndex,
            currentMemoryIndex: state.currentMemoryIndex
        }, '', initUrl);
    }

    function saveProgress() {
        sessionStorage.setItem('questionnaire_progress', JSON.stringify(state));
    }

    // =========================================================
    // ROUTING / RENDER
    // =========================================================
    function renderPhase() {
        hideTimer();
        switch (state.phase) {
            case 'welcome':           renderWelcome(); break;
            case 'demographics':      renderDemographics(); break;
            case 'instructions':      renderInstructions(); break;
            case 'research_question': renderResearchQuestion(); break;
            case 'self_assessment':   renderSelfAssessment(); break;
            case 'memory_intro':      renderMemoryIntro(); break;
            case 'memory_question':   renderMemoryQuestion(); break;
            case 'end':               renderEnd(); break;
        }
        updateProgress();
    }

    function getSlugForPhase(phase) {
        switch (phase) {
            case 'welcome':
                return 'welcome';
            case 'demographics':
                return 'demographics';
            case 'instructions':
                return 'instructions';
            case 'research_question': {
                const q = state.researchQuestions[state.currentResearchIndex];
                return q && q.slug ? q.slug : 'question-' + state.currentResearchIndex;
            }
            case 'self_assessment': {
                const q = state.researchQuestions[state.currentResearchIndex];
                return q && q.slug ? 'eval-' + q.slug : 'eval-' + state.currentResearchIndex;
            }
            case 'memory_intro':
                return 'memory-intro';
            case 'memory_question': {
                const mq = state.memoryQuestions[state.currentMemoryIndex];
                return mq && mq.slug ? mq.slug : 'memory-' + state.currentMemoryIndex;
            }
            case 'end':
                return 'fin';
            default:
                return phase;
        }
    }

    function goTo(phase) {
        state.phase = phase;
        saveProgress();

        const slug = getSlugForPhase(phase);
        const url = '/questionnaire/' + slug
                + '?pid=' + encodeURIComponent(state.participantId)
                + '&sid=' + encodeURIComponent(state.sessionId);

        history.pushState({
            phase: phase,
            currentResearchIndex: state.currentResearchIndex,
            currentMemoryIndex: state.currentMemoryIndex
        }, '', url);

        renderPhase();
        window.scrollTo(0, 0);
    }

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.phase) {
            state.phase = e.state.phase;
            if (typeof e.state.currentResearchIndex === 'number')
                state.currentResearchIndex = e.state.currentResearchIndex;
            if (typeof e.state.currentMemoryIndex === 'number')
                state.currentMemoryIndex = e.state.currentMemoryIndex;
            saveProgress();
            renderPhase();
        }
    });

    // =========================================================
    // PROGRESS BAR
    // =========================================================
    function updateProgress() {
        const totalResearch = state.researchQuestions.length || 6;
        const totalMemory = state.memoryQuestions.length || 12;
        const phases = ['welcome', 'demographics', 'instructions'];
        let current = 0;
        let total = 3 + (totalResearch * 2) + 1 + totalMemory + 1;

        if (phases.includes(state.phase)) {
            current = phases.indexOf(state.phase);
            progressBar.classList.add('hidden');
            return;
        }

        progressBar.classList.remove('hidden');

        if (state.phase === 'research_question') {
            current = 3 + (state.currentResearchIndex * 2);
        } else if (state.phase === 'self_assessment') {
            current = 3 + (state.currentResearchIndex * 2) + 1;
        } else if (state.phase === 'memory_intro') {
            current = 3 + (totalResearch * 2);
        } else if (state.phase === 'memory_question') {
            current = 3 + (totalResearch * 2) + 1 + state.currentMemoryIndex;
        } else if (state.phase === 'end') {
            current = total;
        }

        const pct = Math.round((current / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = `${pct}%`;
    }

    // =========================================================
    // TIMER
    // =========================================================
    function startTimer() {
        elapsedSeconds = 0;
        state.questionStartTime = Date.now();
        timerEl.classList.remove('hidden');
        timerEl.className = 'timer green';
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            elapsedSeconds = Math.floor((Date.now() - state.questionStartTime) / 1000);
            updateTimerDisplay();

            if (elapsedSeconds < 180) {
                timerEl.className = 'timer green';
            } else if (elapsedSeconds < 300) {
                timerEl.className = 'timer orange';
            } else {
                timerEl.className = 'timer red';
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        return elapsedSeconds;
    }

    function hideTimer() {
        clearInterval(timerInterval);
        timerEl.classList.add('hidden');
    }

    function updateTimerDisplay() {
        const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const s = String(elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }

    // =========================================================
    // PHASES
    // =========================================================

    // --- Welcome ---
    function renderWelcome() {
        app.innerHTML = `
            <div style="text-align:center;">
                <h1>Bienvenue 👋</h1>
                <p style="font-size:1.1em; margin:20px 0;">
                    Merci de participer à cette étude. L'objectif est d'évaluer comment
                    la recherche d'information sur le web influence l'apprentissage.
                </p>
                <p>Votre participation est essentielle et toutes les données
                collectées seront <strong>anonymisées</strong>.</p>
                <p>Durée estimée : <strong>45 à 60 minutes</strong>.</p>
                <p style="margin-top:24px;">
                    <small>ID participant : <code>${state.participantId}</code></small>
                </p>
                <button class="btn btn-primary" id="btnStart">Commencer</button>
            </div>`;
        document.getElementById('btnStart').addEventListener('click', () => goTo('demographics'));
    }

    // --- Demographics ---
    function renderDemographics() {
        app.innerHTML = `
            <h2>Informations personnelles</h2>
            <p>Ces informations sont anonymisées et utilisées uniquement à des fins de recherche.</p>

            <div class="form-group">
                <label for="prenom">Prénom</label>
                <input type="text" id="prenom" placeholder="Votre prénom" required>
            </div>
            <div class="form-group">
                <label for="nom">Nom</label>
                <input type="text" id="nom" placeholder="Votre nom" required>
            </div>
            <div class="form-group">
                <label for="age">Âge</label>
                <input type="number" id="age" min="18" max="99" placeholder="Ex: 25" required>
            </div>
            <div class="form-group">
                <label for="sexe">Sexe</label>
                <select id="sexe" required>
                    <option value="">— Sélectionnez —</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                    <option value="prefere_ne_pas_repondre">Préfère ne pas répondre</option>
                </select>
            </div>
            <div class="form-group">
                <label for="niveau_etudes">Niveau d'études</label>
                <select id="niveau_etudes" required>
                    <option value="">— Sélectionnez —</option>
                    <option value="secondaire">Secondaire (lycée)</option>
                    <option value="cegep">Cégep / DEC</option>
                    <option value="baccalaureat">Baccalauréat universitaire</option>
                    <option value="maitrise">Maîtrise</option>
                    <option value="doctorat">Doctorat</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            <button class="btn btn-primary" id="btnDemographics">Suivant →</button>
            <div id="demoError" style="color:#dc2626; margin-top:10px; display:none;"></div>`;

        document.getElementById('btnDemographics').addEventListener('click', submitDemographics);
    }

    async function submitDemographics() {
        const prenom = document.getElementById('prenom').value.trim();
        const nom = document.getElementById('nom').value.trim();
        const age = document.getElementById('age').value;
        const sexe = document.getElementById('sexe').value;
        const niveau = document.getElementById('niveau_etudes').value;
        const errEl = document.getElementById('demoError');

        if (!prenom || !nom || !age || !sexe || !niveau) {
            errEl.textContent = "Veuillez remplir tous les champs.";
            errEl.style.display = 'block';
            return;
        }

        state.demographics = { prenom, nom, age: parseInt(age), sexe, niveau_etudes: niveau };

        await sendToServer('demographics', null, null, state.demographics);

        // Tirer les questions maintenant
        const drawn = drawQuestions();
        state.researchQuestions = drawn.researchQuestions;
        state.memoryQuestions = drawn.memoryQuestions;
        state.drawnQuestionIds = drawn.researchQuestions.map(q => q.id);

        goTo('instructions');
    }

    // --- Instructions ---
    function renderInstructions() {
        app.innerHTML = `
            <h2>Instructions</h2>
            <p>Vous allez répondre à <strong>${state.researchQuestions.length} questions de recherche</strong>.</p>
            <p>Pour chaque question :</p>
            <ol class="instructions-list">
                <li>📖 Lisez attentivement la question affichée.</li>
                <li>🌐 <strong>Naviguez librement sur Internet</strong> dans d'autres onglets pour trouver la réponse.</li>
                <li>✍️ Revenez sur cet onglet et rédigez votre réponse.</li>
                <li>📊 Évaluez vos connaissances initiales sur le sujet.</li>
            </ol>
            <p>Un <strong>chronomètre</strong> sera affiché en haut à droite. Il changera de couleur
            selon le temps écoulé (vert → orange → rouge).</p>
            <p>Après les questions de recherche, vous passerez un court <strong>test de mémoire</strong>
            portant sur les informations que vous avez consultées.</p>
            <p style="margin-top:20px;"><strong>Répondez le plus rapidement et précisément possible.</strong></p>
            <button class="btn btn-success" id="btnStartQuestions">Commencer les questions →</button>`;

        document.getElementById('btnStartQuestions').addEventListener('click', () => {
            state.currentResearchIndex = 0;
            goTo('research_question');
        });
    }

    // --- Research Question ---
    function renderResearchQuestion() {
        const idx = state.currentResearchIndex;
        const q = state.researchQuestions[idx];
        const total = state.researchQuestions.length;

        app.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2>Question ${idx + 1} / ${total}</h2>
                <span class="difficulty-badge diff-${q.difficulty}">${q.difficulty}</span>
            </div>

            <div class="question-box">
                <p>${q.text}</p>
            </div>

            <p style="color:#64748b; font-size:0.9em; margin-bottom:12px;">
                🌐 Vous pouvez ouvrir d'autres onglets pour chercher la réponse sur Internet.
            </p>

            <textarea id="answerText" placeholder="Rédigez votre réponse ici..."></textarea>

            <button class="btn btn-primary" id="btnSubmitAnswer" disabled>Valider ma réponse →</button>
            <div class="status-saving" id="savingStatus"></div>`;

        const textarea = document.getElementById('answerText');
        const btn = document.getElementById('btnSubmitAnswer');

        // Restaurer une réponse en cours si elle existe
        const existingAnswer = state.answers.find(a => a.questionId === q.id);
        if (existingAnswer) {
            textarea.value = existingAnswer.data.answer;
        }

        textarea.addEventListener('input', () => {
            btn.disabled = textarea.value.trim().length < 10;
        });

        btn.addEventListener('click', () => submitResearchAnswer(q));

        startTimer();
    }

    async function submitResearchAnswer(question) {
        const answerText = document.getElementById('answerText').value.trim();
        const timeSpent = stopTimer();

        const answerData = {
            answer: answerText,
            timeSpentSeconds: timeSpent,
            questionIndex: state.currentResearchIndex
        };

        // Sauvegarder localement
        state.answers[state.currentResearchIndex] = {
            questionId: question.id,
            difficulty: question.difficulty,
            data: answerData
        };

        document.getElementById('savingStatus').textContent = "💾 Sauvegarde en cours...";

        await sendToServer('research_answer', question.id, question.difficulty, answerData);

        goTo('self_assessment');
    }

    // --- Self Assessment ---
    function renderSelfAssessment() {
        const idx = state.currentResearchIndex;
        const q = state.researchQuestions[idx];

        let likertHTML = '<div class="likert-scale">';
        for (let i = 1; i <= 7; i++) {
            likertHTML += `
                <div class="likert-option">
                    <input type="radio" name="likert" id="likert_${i}" value="${i}">
                    <label for="likert_${i}">${i}</label>
                </div>`;
        }
        likertHTML += '</div>';

        app.innerHTML = `
            <h2>Auto-évaluation</h2>
            <p>Concernant la question que vous venez de traiter :</p>
            <div class="question-box">
                <p style="font-size:0.95em;">${q.text}</p>
            </div>
            <p><strong>Avant de faire votre recherche</strong>, comment évalueriez-vous
            votre niveau de connaissance sur ce sujet ?</p>
            ${likertHTML}
            <div class="likert-labels">
                <span>Aucune connaissance</span>
                <span>Expert(e)</span>
            </div>
            <button class="btn btn-primary" id="btnSubmitScale" disabled>Suivant →</button>`;

        document.querySelectorAll('input[name="likert"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('btnSubmitScale').disabled = false;
            });
        });

        document.getElementById('btnSubmitScale').addEventListener('click', () => submitSelfAssessment(q));
    }

    async function submitSelfAssessment(question) {
        const score = parseInt(document.querySelector('input[name="likert"]:checked').value);

        state.selfAssessments[state.currentResearchIndex] = {
            questionId: question.id,
            score: score
        };

        await sendToServer('self_assessment', question.id, question.difficulty, {
            score: score,
            questionIndex: state.currentResearchIndex
        });

        // Question suivante ou test de mémoire
        state.currentResearchIndex++;
        if (state.currentResearchIndex < state.researchQuestions.length) {
            goTo('research_question');
        } else {
            goTo('memory_intro');
        }
    }

    // --- Memory Intro ---
    function renderMemoryIntro() {
        app.innerHTML = `
            <div style="text-align:center;">
                <h1>🧠 Test de mémoire</h1>
                <p style="font-size:1.1em; margin:20px 0;">
                    Vous allez maintenant répondre à <strong>${state.memoryQuestions.length} questions à choix multiples</strong>
                    portant sur les informations que vous avez consultées.
                </p>
                <p>Répondez <strong>de mémoire</strong>, sans retourner sur Internet.</p>
                <p style="color:#64748b;">Il n'y a pas de chronomètre pour cette partie.</p>
                <button class="btn btn-primary" id="btnStartMemory">Commencer le test →</button>
            </div>`;

        document.getElementById('btnStartMemory').addEventListener('click', () => {
            state.currentMemoryIndex = 0;
            goTo('memory_question');
        });
    }

    // --- Memory Question ---
    function renderMemoryQuestion() {
        const idx = state.currentMemoryIndex;
        const mq = state.memoryQuestions[idx];
        const total = state.memoryQuestions.length;

        let optionsHTML = '<ul class="mcq-options">';
        mq.options.forEach((opt, i) => {
            optionsHTML += `
                <li>
                    <label>
                        <input type="radio" name="mcq" value="${i}">
                        <span>${opt}</span>
                    </label>
                </li>`;
        });
        optionsHTML += '</ul>';

        app.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Mémoire ${idx + 1} / ${total}</h2>
                <span class="difficulty-badge diff-${mq.sourceDifficulty}">
                    Liée à : ${mq.sourceQuestionId}
                </span>
            </div>
            <div class="question-box" style="margin-top:16px;">
                <p>${mq.text}</p>
            </div>
            ${optionsHTML}
            <button class="btn btn-primary" id="btnSubmitMemory" disabled>Suivant →</button>`;

        document.querySelectorAll('input[name="mcq"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('btnSubmitMemory').disabled = false;
            });
        });

        document.getElementById('btnSubmitMemory').addEventListener('click', () => submitMemoryAnswer(mq));
    }

    async function submitMemoryAnswer(memoryQ) {
        const selected = parseInt(document.querySelector('input[name="mcq"]:checked').value);
        const isCorrect = selected === memoryQ.correct;

        state.memoryAnswers[state.currentMemoryIndex] = {
            questionId: memoryQ.id,
            selected: selected,
            correct: memoryQ.correct,
            isCorrect: isCorrect
        };

        await sendToServer('memory_answer', memoryQ.id, memoryQ.sourceDifficulty, {
            sourceQuestionId: memoryQ.sourceQuestionId,
            selectedOption: selected,
            selectedText: memoryQ.options[selected],
            correctOption: memoryQ.correct,
            correctText: memoryQ.options[memoryQ.correct],
            isCorrect: isCorrect,
            questionIndex: state.currentMemoryIndex
        });

        state.currentMemoryIndex++;
        if (state.currentMemoryIndex < state.memoryQuestions.length) {
            goTo('memory_question');
        } else {
            goTo('end');
        }
    }

    // --- End ---
    function renderEnd() {
        // Calcul du score mémoire
        const totalMemory = state.memoryAnswers.length;
        const correctMemory = state.memoryAnswers.filter(a => a && a.isCorrect).length;

        app.innerHTML = `
            <div class="end-screen">
                <div class="checkmark">✅</div>
                <h1>Merci pour votre participation !</h1>
                <p style="font-size:1.1em; margin:20px 0;">
                    Vos réponses ont été enregistrées avec succès.
                </p>
                <p style="color:#64748b;">
                    Score mémoire : ${correctMemory} / ${totalMemory}
                </p>
                <div style="margin-top:32px; padding:20px; background:#f0f9ff; border-radius:8px;">
                    <p><strong>Pour finaliser l'étude :</strong></p>
                    <p>Cliquez sur l'icône de l'extension Chrome (🧩) puis sur
                    <strong>« Arrêter l'étude »</strong> pour envoyer toutes les données de navigation.</p>
                </div>
            </div>`;

        window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
        
        // Nettoyer la progression sauvegardée
        sessionStorage.removeItem('questionnaire_progress');

        // Envoyer un événement de fin
        sendToServer('questionnaire_event', null, null, {
            event: 'questionnaire_completed',
            totalResearchQuestions: state.researchQuestions.length,
            totalMemoryQuestions: totalMemory,
            memoryScore: correctMemory
        });

        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    }

    // =========================================================
    // API
    // =========================================================
    async function sendToServer(type, questionId, difficulty, data) {
        const payload = {
            participantId: state.participantId,
            sessionId: state.sessionId,
            type: type,
            questionId: questionId,
            difficulty: difficulty,
            data: data,
            timestamp: new Date().toISOString()
        };

        console.log(`📤 Envoi ${type} | Question: ${questionId || 'N/A'}`, payload);
        
        try {
            const resp = await fetch(`${API_BASE}/reponse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const err = await resp.json();
                console.error('❌ Erreur serveur:', err);
            } else {
                console.log(`✅ ${type} sauvegardé | Question: ${questionId || 'N/A'}`);
            }
        } catch (err) {
            console.error('❌ Erreur réseau:', err.message);
            // Sauvegarde locale en cas d'échec réseau
            const fallback = JSON.parse(sessionStorage.getItem('questionnaire_fallback') || '[]');
            fallback.push(payload);
            sessionStorage.setItem('questionnaire_fallback', JSON.stringify(fallback));
        }
    }

    // =========================================================
    // BOOT
    // =========================================================
    init();

})();
