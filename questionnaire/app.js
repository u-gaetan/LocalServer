(function () {
    'use strict';

    const API_BASE = window.location.origin + '/api/questionnaire';

    let state = {
        phase: 'language',
        participantId: null,
        language: 'fr', // Par défaut sur FR pour l'instant
        consentGiven: false,
        deceptionConsentGiven: false,
        demographics: null,
        researchQuestions: [],
        memoryQuestions: [],
        currentResearchIndex: 0,
        currentMemoryIndex: 0,
        answers: [],
        selfAssessments: [],
        internetSkills: null,
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
    let popup10MinShown = false;
    let currentTimerPhase = null;

    // Fonction de traduction
    // Fonction de traduction sécurisée
    function t(key) {
        if (!state.language) return ""; // Évite le crash au tout 1er lancement
        if (!i18n || !i18n[state.language]) return key;
        return i18n[state.language][key] || key;
    }

    function init() {
        const params = new URLSearchParams(window.location.search);
        state.participantId = params.get('pid');

        if (!state.participantId) {
            app.innerHTML = '<div style="text-align:center; padding:60px 0;"><h1>Accès invalide</h1><p>Veuillez démarrer l\'étude depuis l\'extension Chrome.</p></div>';
            return;
        }

        const saved = localStorage.getItem('questionnaire_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.participantId === state.participantId) {
                    state = parsed;
                    renderPhase();
                    return;
                }
            } catch (e) {}
        }

        renderPhase();
        updateUrl();
    }

    function saveProgress() {
        localStorage.setItem('questionnaire_progress', JSON.stringify(state));
    }

    function renderPhase() {
        hideTimer();
        switch (state.phase) {
            case 'language':          renderLanguage(); break;
            case 'consent':           renderConsent(); break;
            case 'demographics':      renderDemographics(); break;
            case 'instructions':      renderInstructions(); break;
            case 'research_question': renderResearchQuestion(); break;
            case 'self_assessment':   renderSelfAssessment(); break;
            case 'internet_skills':   renderInternetSkills(); break;
            case 'memory_intro':      renderMemoryIntro(); break;
            case 'memory_question':   renderMemoryQuestion(); break;
            case 'deception_consent': renderDeceptionConsent(); break;
            case 'end':               renderEnd(); break;
        }
        updateProgress();
    }

    function getSlugForPhase(phase) {
        switch (phase) {
            case 'language': return 'langue';
            case 'consent': return 'consentement';
            case 'demographics': return 'informations';
            case 'instructions': return 'instructions';
            case 'research_question': return 'question-' + state.currentResearchIndex;
            case 'self_assessment': return 'eval-' + state.currentResearchIndex;
            case 'internet_skills': return 'competences-internet';
            case 'memory_intro': return 'memory-intro';
            case 'memory_question': return 'memory-' + state.currentMemoryIndex;
            case 'deception_consent': return 'consentement-post-etude';
            case 'end': return 'fin';
            default: return phase;
        }
    }

    function updateUrl() {
        var slug = getSlugForPhase(state.phase);
        var url = '/questionnaire/' + slug + '?pid=' + encodeURIComponent(state.participantId);
        history.replaceState({ phase: state.phase }, '', url);
    }

    function goTo(phase) {
        state.phase = phase;
        saveProgress();
        updateUrl();
        renderPhase();
        window.scrollTo(0, 0);
    }

    function updateProgress() {
        var totalResearch = state.researchQuestions.length || 3;
        var totalMemory = state.memoryQuestions.length || 6;
        var hiddenPhases = ['language', 'consent', 'demographics', 'instructions'];
        var total = (totalResearch * 2) + 1 + 1 + totalMemory + 1 + 1;
        var current = 0;

        if (hiddenPhases.indexOf(state.phase) !== -1) {
            progressBar.classList.add('hidden');
            return;
        }
        progressBar.classList.remove('hidden');

        if (state.phase === 'research_question') current = (state.currentResearchIndex * 2);
        else if (state.phase === 'self_assessment') current = (state.currentResearchIndex * 2) + 1;
        else if (state.phase === 'internet_skills') current = (totalResearch * 2);
        else if (state.phase === 'memory_intro') current = (totalResearch * 2) + 1;
        else if (state.phase === 'memory_question') current = (totalResearch * 2) + 2 + state.currentMemoryIndex;
        else if (state.phase === 'deception_consent') current = total - 1;
        else if (state.phase === 'end') current = total;

        var pct = Math.round((current / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
    }

    function startTimer(phaseType) {
        elapsedSeconds = 0;
        popup10MinShown = false;
        currentTimerPhase = phaseType;
        state.questionStartTime = Date.now();
        timerEl.classList.remove('hidden');
        timerEl.className = 'timer green';
        updateTimerDisplay();

        timerInterval = setInterval(function () {
            elapsedSeconds = Math.floor((Date.now() - state.questionStartTime) / 1000);
            updateTimerDisplay();

            if (currentTimerPhase === 'research') {
                if (elapsedSeconds < 480) timerEl.className = 'timer green';
                else if (elapsedSeconds < 600) timerEl.className = 'timer orange';
                else timerEl.className = 'timer red blink';

                if (elapsedSeconds === 600 && !popup10MinShown) {
                    popup10MinShown = true;
                    alert("⚠️ Cela fait 10 minutes que vous êtes sur cette question. Veuillez finaliser votre réponse et passer à la suite.");
                }
                if (elapsedSeconds >= 720) {
                    clearInterval(timerInterval);
                    alert("⏱️ Temps écoulé (12 minutes). Vous allez être redirigé vers l'auto-évaluation.");
                    forceSubmitResearch();
                }
            } 
            else if (currentTimerPhase === 'memory') {
                if (elapsedSeconds < 45) timerEl.className = 'timer green';
                else timerEl.className = 'timer red blink';

                if (elapsedSeconds >= 60) {
                    clearInterval(timerInterval);
                    alert("⏱️ Temps écoulé (1 minute). Passage à la question suivante.");
                    forceSubmitMemory();
                }
            }
        }, 1000);
    }

    function stopTimer() { clearInterval(timerInterval); timerInterval = null; return elapsedSeconds; }
    function hideTimer() { clearInterval(timerInterval); timerEl.classList.add('hidden'); }
    function updateTimerDisplay() {
        var m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        var s = String(elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
    }
    function countWords(str) { return str.trim().split(/\s+/).filter(w => w.length > 0).length; }

    function getNavCount() {
        return new Promise(resolve => {
            const handler = (e) => {
                if (e.data && e.data.type === 'NAV_COUNT_RESULT') {
                    window.removeEventListener('message', handler);
                    resolve(e.data.count);
                }
            };
            window.addEventListener('message', handler);
            window.postMessage({ type: 'GET_NAV_COUNT' }, '*');
        });
    }


    // === 1. LANGUAGE ===
    function renderLanguage() {
        app.innerHTML =
            '<h1 style="text-align:center;">Preferred Language / Langue préférentielle</h1>' +
            '<div class="form-group" style="max-width:400px; margin:30px auto;">' +
            '<select id="languageSelect" required><option value="">-- Sélectionnez / Select --</option><option value="fr">Français / French</option></select>' +
            '</div>' +
            '<div style="text-align:center;"><button class="btn btn-primary" id="btnLanguage" disabled>Continuer / Continue</button></div>';

        var select = document.getElementById('languageSelect');
        var btn = document.getElementById('btnLanguage');
        select.addEventListener('change', function () { btn.disabled = !select.value; });
        btn.addEventListener('click', function () { 
            state.language = select.value; // On assigne la langue ici !
            saveProgress(); // On sauvegarde l'état
            goTo('consent'); 
        });
    }

    // === 2. CONSENTEMENT ===
    function renderConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">' + t('consentement_titre') + '</h1>' +
            '<p style="text-align:center;color:#64748b;">' + t('consentement_intro') + '</p>' +
            '<div class="consent-box">' + t('consentement_texte') + '</div>' +
            '<div class="consent-checks"><label class="consent-label"><input type="checkbox" id="consent1"><span>J\'ai lu et compris les informations ci-dessus et je souhaite participer à l\'étude. Je confirme être âgé(e) de 18 ans ou plus.</span></label></div>' +
            '<button class="btn btn-primary" id="btnConsent" disabled>J\'accepte et je souhaite participer</button>' +
            '<p style="text-align:center;margin-top:12px;"><a href="#" id="btnRefuse" style="color:#94a3b8;font-size:13px;">Je ne souhaite pas participer</a></p>';

        var cb = document.getElementById('consent1');
        var btn = document.getElementById('btnConsent');
        cb.addEventListener('change', function () { btn.disabled = !cb.checked; });

        btn.addEventListener('click', function () {
            state.consentGiven = true;
            sendToServer('consent', null, null, { consent: true, questionLabel: "Consentement Initial" });
            window.postMessage({ type: 'START_TRACKING', participantId: state.participantId }, '*');
            goTo('demographics');
        });

        document.getElementById('btnRefuse').addEventListener('click', function (e) {
            e.preventDefault();
            sendToServer('consent', null, null, { consent: false, questionLabel: "Consentement Initial" });
            app.innerHTML = '<div style="text-align:center;padding:60px 0;"><h1>Merci</h1><p>Nous comprenons votre décision. Vous pouvez fermer cette page.</p></div>';
        });
    }

    // === 3. DEMOGRAPHICS ===
    function renderDemographics() {
        app.innerHTML =
            '<h2>Informations personnelles</h2>' +
            '<p style="color:#64748b; font-size:0.9em; margin-bottom:20px;">Votre adresse courriel est uniquement requise pour vous contacter concernant votre méthode de compensation financière, ainsi que pour nous permettre de retrouver et supprimer vos données si vous décidez de retirer votre consentement plus tard. Elle sera conservée de manière sécurisée et dissociée de vos données de navigation.</p>' +
            '<div class="form-group"><label>Adresse courriel</label><input type="email" id="email" required></div>' +
            '<div class="form-group"><label>Âge</label><input type="number" id="age" min="18" max="99" required></div>' +
            '<div class="form-group"><label>Niveau de maîtrise du français</label><select id="lang_prof" required><option value="">-- Sélectionnez --</option><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="expert">Expert</option><option value="natif">Langue maternelle (Natif)</option></select></div>' +
            '<div class="form-group"><label>Niveau d\'études</label><select id="niveau" required><option value="">-- Sélectionnez --</option><option value="secondaire">Secondaire</option><option value="cegep">Cégep / DEC</option><option value="baccalaureat">Baccalauréat</option><option value="maitrise">Maîtrise</option><option value="doctorat">Doctorat</option><option value="autre">Autre</option></select></div>' +
            '<div class="form-group"><label>Comment souhaitez-vous recevoir votre compensation ?</label><select id="payment" required><option value="">-- Sélectionnez --</option><option value="interac">Virement Interac (courriel ci-dessus)</option><option value="pickup">Venir chercher à l\'Université Laval</option><option value="cheque">Chèque par la poste</option></select></div>' +
            '<button class="btn btn-primary" id="btnDemo">Suivant</button><div id="demoErr" style="color:red; display:none;"></div>';

        document.getElementById('btnDemo').addEventListener('click', async function () {
            var email = document.getElementById('email').value.trim();
            var age = document.getElementById('age').value;
            var lang = document.getElementById('lang_prof').value;
            var niveau = document.getElementById('niveau').value;
            var payment = document.getElementById('payment').value;

            if (!email || !age || !lang || !niveau || !payment) {
                document.getElementById('demoErr').textContent = "Remplissez tous les champs.";
                document.getElementById('demoErr').style.display = 'block';
                return;
            }

            state.demographics = { email, age: parseInt(age), langue: lang, niveau_etudes: niveau, paiement: payment };
            await sendToServer('demographics', null, null, state.demographics);

            var drawn = drawQuestions();
            state.researchQuestions = drawn.researchQuestions;
            state.memoryQuestions = drawn.memoryQuestions;
            goTo('instructions');
        });
    }

    // === 4. INSTRUCTIONS ===
    function renderInstructions() {
        app.innerHTML =
            '<h2>Instructions</h2>' +
            '<p>Vous allez répondre à <strong>' + state.researchQuestions.length + ' questions de recherche</strong>.</p>' +
            '<ul class="instructions-list">' +
            '<li><strong>Naviguez librement</strong> dans d\'autres onglets (Google, Wikipédia, etc.).</li>' +
            '<li><strong style="color:#dc2626;">Règles strictes :</strong> La navigation privée est interdite. L\'usage d\'Intelligences Artificielles (ChatGPT, Gemini, Claude, etc.) est <strong>strictement interdit</strong>.</li>' +
            '<li>Votre réponse doit faire <strong>entre 75 et 100 mots</strong> (un compteur vous aidera).</li>' +
            '<li>Un chronomètre est actif. Essayez de répondre en moins de 10 minutes. Après 12 minutes, la page passera automatiquement à la suite.</li>' +
            '</ul>' +
            '<button class="btn btn-success" id="btnStartQuestions">Commencer</button>';

        document.getElementById('btnStartQuestions').addEventListener('click', function () {
            state.currentResearchIndex = 0;
            goTo('research_question');
        });
    }

    // === 5. RESEARCH ===
    function renderResearchQuestion() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];

        app.innerHTML =
            '<h2>Question ' + (idx + 1) + ' / ' + state.researchQuestions.length + '</h2>' +
            '<div class="question-box"><p>' + q.text + '</p></div>' +
            '<p style="color:#64748b;">Cherchez la réponse sur Internet puis rédigez-la ici (75 à 100 mots).</p>' +
            '<textarea id="answerText" placeholder="Rédigez votre réponse ici..."></textarea>' +
            '<div id="wordCount" class="word-counter red">Mots : 0 / 75-100</div>' +
            '<button class="btn btn-primary" id="btnSubmitAnswer" disabled>Valider ma réponse</button>';

        var textarea = document.getElementById('answerText');
        var btn = document.getElementById('btnSubmitAnswer');
        var wc = document.getElementById('wordCount');

        var existing = state.answers[idx];
        if (existing) textarea.value = existing.data.answer;

        getNavCount().then(c => initialNavCount = c);

        textarea.addEventListener('input', function () {
            var count = countWords(textarea.value);
            wc.textContent = "Mots : " + count + " / 75-100";
            if (count < 75) { wc.className = "word-counter red"; btn.disabled = true; }
            else if (75 <= count && count <= 100) { wc.className = "word-counter green"; btn.disabled = false; }
            else { wc.className = "word-counter orange"; btn.disabled = false; }
        });

        btn.addEventListener('click', function () {
            let currentNavCount = await getNavCount();
            if (currentNavCount === initialNavCount && !existing) {
                alert("⚠️ Aucune recherche détectée ! Vous devez faire vos recherches sur Chrome (et non en navigation privée) avant de valider votre réponse.");
                return; // Bloque la soumission
            } 
            processSubmitResearch(q, textarea.value); });
        startTimer('research');
        textarea.dispatchEvent(new Event('input'));
    }

    function forceSubmitResearch() {
        var q = state.researchQuestions[state.currentResearchIndex];
        var text = document.getElementById('answerText').value || "[Temps écoulé]";
        processSubmitResearch(q, text);
    }

    async function processSubmitResearch(question, text) {
        var timeSpent = stopTimer();
        var wordCount = countWords(text);
        var data = { answer: text, wordCount: wordCount, timeSpentSeconds: timeSpent, forcedTimeout: timeSpent >= 720 };
        state.answers[state.currentResearchIndex] = { questionId: question.id, data: data };
        await sendToServer('research_answer', question.id, null, data);
        goTo('self_assessment');
    }

    // === 6. SELF ASSESSMENT ===
    function renderSelfAssessment() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];

        var html = '<h2>Évaluation</h2><p>Concernant la question : <em>' + q.text + '</em></p>';

        // 1. Connaissance
        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_connaissance_titre') + '</h3>' +
            '<div class="slider-group"><label>' + t('q_connaissance_item') + '</label>' +
            '<div class="slider-container"><input type="range" id="k_base" class="slider" min="0" max="100" value="0"><div class="slider-value" id="vk_base">0</div></div>' +
            '<div class="slider-labels"><span>0</span><span>100</span></div></div>';

        // 2. Confiance
        var confItems = t('q_confiance_items');
        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_confiance_titre') + '</h3>' +
            '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_confiance_legende') + '</p>' +
            '<table class="likert-table"><tr><th>Énoncé</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
        confItems.forEach(function(item, i) {
            html += '<tr><td>' + item + '</td>';
            for(var v=1; v<=5; v++) html += '<td><input type="radio" name="conf' + (i+1) + '" value="' + v + '"></td>';
            html += '</tr>';
        });
        html += '</table>';

        // 3. NASA-TLX
        var nasaItems = t('q_nasa_items');
        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_nasa_titre') + '</h3>' +
            '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_nasa_legende') + '</p>';
        nasaItems.forEach(function(item) {
            html += '<div class="slider-group"><label style="margin-bottom:4px;"><strong>' + item.titre + ' :</strong> ' + item.desc + '</label>' +
                '<div class="slider-container"><input type="range" id="' + item.id + '" class="slider" min="1" max="100" value="1"><div class="slider-value" id="v' + item.id + '">1</div></div>' +
                '<div class="slider-labels"><span>1</span><span>100</span></div></div>';
        });

        html += '<button class="btn btn-primary" id="btnSubmitScale" style="margin-top:30px;">Valider l\'évaluation</button><div id="evalErr" style="color:red; display:none; margin-top:10px;">Veuillez répondre à toutes les questions du tableau.</div>';
        app.innerHTML = html;

        bindSlider('k_base');
        nasaItems.forEach(function(item) { bindSlider(item.id); });

        document.getElementById('btnSubmitScale').addEventListener('click', async function () {
            var c1 = document.querySelector('input[name="conf1"]:checked');
            var c2 = document.querySelector('input[name="conf2"]:checked');
            var c3 = document.querySelector('input[name="conf3"]:checked');

            if (!c1 || !c2 || !c3) { document.getElementById('evalErr').style.display = 'block'; return; }

            var payload = {
                knowledgeBase: parseInt(document.getElementById('k_base').value),
                confidenceAnswer: parseInt(c1.value),
                confidenceUsedDigital: parseInt(c2.value),
                confidenceSource: parseInt(c3.value)
            };
            nasaItems.forEach(function(item) { payload[item.id] = parseInt(document.getElementById(item.id).value); });

            await sendToServer('self_assessment', q.id, null, payload);

            state.currentResearchIndex++;
            if (state.currentResearchIndex < state.researchQuestions.length) goTo('research_question');
            else goTo('internet_skills');
        });
    }

    function bindSlider(id) {
        var s = document.getElementById(id);
        var v = document.getElementById('v' + id);
        if(s && v) s.addEventListener('input', function () { v.textContent = s.value; });
    }

    // === 7. INTERNET SKILLS ===
    function renderInternetSkills() {
        var skills = t('q_internet_items');
        var html = '<h2>' + t('q_internet_titre') + '</h2>';
        html += '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_internet_legende') + '</p>';
        html += '<table class="likert-table"><tr><th>Énoncé</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
        
        skills.forEach(function(item, i) {
            html += '<tr><td>' + item + '</td>';
            for(var v=1; v<=5; v++) html += '<td><input type="radio" name="iskill_' + i + '" value="' + v + '"></td>';
            html += '</tr>';
        });
        
        html += '</table><button class="btn btn-primary" id="btnSubmitSkills">Suivant</button><div id="skillsErr" style="color:red; display:none; margin-top:10px;">Veuillez répondre à tous les énoncés.</div>';
        app.innerHTML = html;

        document.getElementById('btnSubmitSkills').addEventListener('click', async function() {
            var answers = {};
            var allAnswered = true;
            for(var i=0; i<skills.length; i++) {
                var checked = document.querySelector('input[name="iskill_' + i + '"]:checked');
                if(!checked) { allAnswered = false; break; }
                answers['item_' + (i+1)] = parseInt(checked.value);
            }

            if(!allAnswered) { document.getElementById('skillsErr').style.display = 'block'; return; }

            await sendToServer('questionnaire_event', null, null, { event: "internet_skills", answers: answers });
            goTo('memory_intro');
        });
    }

    // === 8. MEMORY INTRO ===
    function renderMemoryIntro() {
        window.postMessage({ type: 'SET_PHASE', phase: 'memory' }, '*'); // <--- ON BLOQUE
        app.innerHTML =
            '<div style="text-align:center;">' +
            '<h1>Test de mémoire (Surprise !)</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">Vous allez maintenant répondre à <strong>' + state.memoryQuestions.length + ' questions courtes</strong> portant sur les informations que vous avez consultées.</p>' +
            '<p style="color:#dc2626;"><strong>RÈGLE STRICTE :</strong> Vous devez répondre <strong>de mémoire</strong>. Vous n\'avez pas le droit de chercher la réponse sur Internet.</p>' +
            '<p>Vous avez <strong>1 minute par question</strong> maximum.</p>' +
            '<button class="btn btn-primary" id="btnStartMemory">Commencer le test</button>' +
            '</div>';

        document.getElementById('btnStartMemory').addEventListener('click', function () {
            state.currentMemoryIndex = 0;
            goTo('memory_question');
        });
    }

    // === 9. MEMORY ===
    function renderMemoryQuestion() {
        var idx = state.currentMemoryIndex;
        var mq = state.memoryQuestions[idx];

        app.innerHTML =
            '<h2>Mémoire ' + (idx + 1) + ' / ' + state.memoryQuestions.length + '</h2>' +
            '<div class="question-box"><p>' + mq.text + '</p></div>' +
            '<textarea id="memAnswerText" placeholder="Votre réponse de mémoire..." style="min-height:100px;"></textarea>' +
            '<button class="btn btn-primary" id="btnSubmitMemory">Valider</button>';

        document.getElementById('btnSubmitMemory').addEventListener('click', function () {
            processSubmitMemory(mq, document.getElementById('memAnswerText').value.trim());
        });

        startTimer('memory');
    }

    function forceSubmitMemory() {
        var mq = state.memoryQuestions[state.currentMemoryIndex];
        var text = document.getElementById('memAnswerText').value || "[Temps écoulé]";
        processSubmitMemory(mq, text);
    }

    async function processSubmitMemory(memoryQ, text) {
        var timeSpent = stopTimer();
        var payload = { sourceQuestionId: memoryQ.sourceQuestionId, answerText: text, timeSpentSeconds: timeSpent, forcedTimeout: timeSpent >= 60 };
        await sendToServer('memory_answer', memoryQ.id, null, payload);

        state.currentMemoryIndex++;
        if (state.currentMemoryIndex < state.memoryQuestions.length) goTo('memory_question');
        else goTo('deception_consent');
    }

    // === 10. DECEPTION ===
    function renderDeceptionConsent() {
        window.postMessage({ type: 'SET_PHASE', phase: 'research' }, '*');
        app.innerHTML =
            '<h1 style="text-align:center;">' + t('debriefing_titre') + '</h1>' +
            '<div class="consent-box" style="font-size:0.95em;">' + t('debriefing_texte') + '</div>' +
            '<div class="consent-checks">' +
            '<label class="consent-label"><input type="radio" name="deceptionChoice" value="maintain"><span>Je souhaite <strong>maintenir</strong> ma participation à l\'étude.</span></label>' +
            '<label class="consent-label"><input type="radio" name="deceptionChoice" value="withdraw"><span>Je souhaite <strong>mettre fin</strong> à ma participation à l\'étude. (Mes données seront détruites)</span></label>' +
            '</div>' +
            '<button class="btn btn-primary" id="btnDeceptionConsent" disabled>Confirmer mon choix</button>';

        var radios = document.querySelectorAll('input[name="deceptionChoice"]');
        var btn = document.getElementById('btnDeceptionConsent');

        radios.forEach(function (r) { r.addEventListener('change', function () { btn.disabled = false; }); });

        btn.addEventListener('click', function () {
            var selected = document.querySelector('input[name="deceptionChoice"]:checked').value;
            if (selected === 'maintain') {
                sendToServer('deception_consent', null, null, { consent: true, decision: 'maintain', questionLabel: "Consentement Post-Expérimental (Maintenu)" });
                goTo('end');
            } else {
                sendToServer('deception_consent', null, null, { consent: false, decision: 'withdraw', questionLabel: "Consentement Post-Expérimental (Retiré)" });
                app.innerHTML = '<div style="text-align:center;padding:60px 0;"><h1>Merci</h1><p>Nous comprenons votre décision. Vos données seront détruites.</p><p style="color:#64748b; margin-top:16px;">Vous pouvez désinstaller l\'extension Chrome.</p></div>';
                localStorage.removeItem('questionnaire_progress');
                window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
            }
        });
    }

    // === 11. END ===
    function renderEnd() {
        app.innerHTML =
            '<div class="end-screen">' +
            '<h1>Merci pour votre participation !</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">Vos réponses ont été enregistrées avec succès.</p>' +
            t('fin_texte') +
            '</div>';

        window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
        localStorage.removeItem('questionnaire_progress');
        sendToServer('questionnaire_event', null, null, { event: 'questionnaire_completed' });
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    }

    // === API ===
    async function sendToServer(type, questionId, difficulty, data) {
        var payload = { participantId: state.participantId, type: type, questionId: questionId, difficulty: difficulty, data: data, timestamp: new Date().toISOString() };
        try {
            await fetch(API_BASE + '/reponse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } catch (err) {
            var fallback = JSON.parse(localStorage.getItem('questionnaire_fallback') || '[]');
            fallback.push(payload);
            localStorage.setItem('questionnaire_fallback', JSON.stringify(fallback));
        }
    }

    // =========================================================
    // SÉCURITÉ : INACTIVITÉ (1h) ET DÉLAI GLOBAL (4h)
    // =========================================================
    let inactivityTimer = null;
    let globalTimer = null;

    function triggerStudyTimeout(reason) {
        let msg = reason === 'inactivity' 
            ? "La collecte de données s'est arrêtée suite à 1 heure d'inactivité." 
            : "La collecte de données s'est arrêtée car le délai maximum autorisé de 4 heures est écoulé.";
        
        alert("⚠️ " + msg + " Vos données sont invalidées.");
        
        // 1. On dit à l'extension de s'arrêter
        try { chrome.runtime.sendMessage({ action: "stop_tracking" }); } catch(e) {}
        
        // 2. On notifie le serveur de l'invalidation
        sendToServer('questionnaire_event', null, null, { event: 'study_invalidated', reason: reason });
        
        // 3. On bloque l'interface
        app.innerHTML = '<div style="text-align:center;padding:60px 0;"><h1 style="color:#dc2626;">Étude annulée</h1><p>' + msg + '</p></div>';
        
        // On arrête les chronomètres de l'étude s'ils tournaient
        hideTimer();
    }

    function resetInactivityTimer() {
        if (state.phase === 'end' || state.phase === 'language') return; // Ne pas agir si fini ou pas commencé
        clearTimeout(inactivityTimer);
        // 1 heure = 60 * 60 * 1000 ms
        inactivityTimer = setTimeout(() => triggerStudyTimeout('inactivity'), 3600000); 
    }

    function checkGlobalTimer() {
        if (state.phase === 'end' || !state.consentGiven) return;
        
        let start = localStorage.getItem('study_global_start');
        if (!start) {
            start = Date.now();
            localStorage.setItem('study_global_start', start);
        }
        
        let elapsed = Date.now() - parseInt(start);
        let remaining = (4 * 3600 * 1000) - elapsed; // 4 heures
        
        if (remaining <= 0) {
            triggerStudyTimeout('max_time');
        } else {
            clearTimeout(globalTimer);
            globalTimer = setTimeout(() => triggerStudyTimeout('max_time'), remaining);
        }
    }

    // Écouter l'activité du participant sur la page pour remettre le compteur 1h à zéro
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => document.addEventListener(evt, resetInactivityTimer));
    
    // Initialiser les timers au démarrage
    resetInactivityTimer();
    setInterval(checkGlobalTimer, 60000); // Vérifie le timer global toutes les minutes

    init();
})();