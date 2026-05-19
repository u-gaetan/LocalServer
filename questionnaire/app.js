(function () {
    'use strict';

    const API_BASE = window.location.origin + '/api/questionnaire';

    // =========================================================
    // STATE
    // =========================================================
    let state = {
        phase: 'language',
        participantId: null,
        language: null,
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

    // =========================================================
    // INIT & ROUTING
    // =========================================================
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

    // =========================================================
    // PROGRESS BAR
    // =========================================================
    function updateProgress() {
        var totalResearch = state.researchQuestions.length || 3;
        var totalMemory = state.memoryQuestions.length || 6;
        var hiddenPhases = ['language', 'consent', 'demographics', 'instructions'];
        // total steps = research*2 + 1(internet_skills) + 1(memory_intro) + memory + 1(deception) + 1(end)
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

    // =========================================================
    // TIMERS (Research = 10m/12m, Memory = 1m)
    // =========================================================
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

                // Popup à 10 min (600s)
                if (elapsedSeconds === 600 && !popup10MinShown) {
                    popup10MinShown = true;
                    alert("⚠️ Cela fait 10 minutes que vous êtes sur cette question. Veuillez finaliser votre réponse et passer à la suite.");
                }
                // Popup à 12 min (720s) -> Force le passage
                if (elapsedSeconds >= 720) {
                    clearInterval(timerInterval);
                    alert("⏱️ Temps écoulé (12 minutes). Vous allez être redirigé vers l'auto-évaluation.");
                    forceSubmitResearch();
                }
            } 
            else if (currentTimerPhase === 'memory') {
                if (elapsedSeconds < 45) timerEl.className = 'timer green';
                else timerEl.className = 'timer red blink';

                // Popup à 1 min (60s) -> Force le passage
                if (elapsedSeconds >= 60) {
                    clearInterval(timerInterval);
                    alert("⏱️ Temps écoulé (1 minute). Passage à la question suivante.");
                    forceSubmitMemory();
                }
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
        var m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        var s = String(elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
    }

    // =========================================================
    // 1. LANGUAGE
    // =========================================================
    function renderLanguage() {
        app.innerHTML =
            '<h1 style="text-align:center;">Preferred Language / Langue préférentielle</h1>' +
            '<div class="form-group" style="max-width:400px; margin:30px auto;">' +
            '<select id="languageSelect" required>' +
            '<option value="">-- Sélectionnez / Select --</option>' +
            '<option value="french">Français / French</option>' +
            '<option value="english" disabled>English (coming soon)</option>' +
            '</select>' +
            '</div>' +
            '<div style="text-align:center;"><button class="btn btn-primary" id="btnLanguage" disabled>Continuer / Continue</button></div>';

        var select = document.getElementById('languageSelect');
        var btn = document.getElementById('btnLanguage');
        select.addEventListener('change', function () { btn.disabled = !select.value; });
        btn.addEventListener('click', function () {
            state.language = select.value;
            goTo('consent');
        });
    }

    // =========================================================
    // 2. CONSENTEMENT
    // =========================================================
    function renderConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">Formulaire de consentement</h1>' +
            '<div class="consent-box">' +
            '<p>Cette recherche est réalisée par le Laboratoire LEILAH (Université Laval).</p>' +
            '<p>La recherche vise à mieux comprendre la façon dont les individus interagissent avec des technologies de recherche documentaire sur le web.</p>' +
            '<p>Nous vous demanderons de répondre à des questions à développement long sur différents sujets. Vous devrez utiliser des moteurs de recherche classiques (ex: Google). <strong>L\'utilisation d\'IA (ChatGPT, Gemini) est strictement interdite.</strong></p>' +
            '<p>Après chaque question, vous ferez une auto-évaluation de votre expérience. Vos données de navigation seront enregistrées anonymement par l\'extension Chrome.</p>' +
            '</div>' +
            '<div class="consent-checks"><label class="consent-label"><input type="checkbox" id="consent1"><span>J\'ai lu et compris les informations et j\'accepte de participer. Je confirme avoir 18 ans ou plus.</span></label></div>' +
            '<button class="btn btn-primary" id="btnConsent" disabled>J\'accepte</button>' +
            '<p style="text-align:center;margin-top:12px;"><a href="#" id="btnRefuse" style="color:#94a3b8;">Je refuse</a></p>';

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
            app.innerHTML = '<div style="text-align:center;padding:60px 0;"><h1>Merci</h1><p>Vous avez refusé de participer. Vous pouvez fermer cette page.</p></div>';
        });
    }

    // =========================================================
    // 3. DEMOGRAPHICS
    // =========================================================
    function renderDemographics() {
        app.innerHTML =
            '<h2>Informations personnelles</h2>' +
            '<p style="color:#64748b; font-size:0.9em; margin-bottom:20px;">' +
            '<strong>Pourquoi demandons-nous votre courriel ?</strong><br>' +
            'Votre adresse courriel est uniquement requise pour vous contacter concernant votre méthode de compensation financière, ' +
            'ainsi que pour nous permettre de retrouver et supprimer vos données si vous décidez de retirer votre consentement plus tard. ' +
            'Elle sera conservée de manière sécurisée et dissociée de vos données de navigation.' +
            '</p>' +

            '<div class="form-group">' +
            '<label>Adresse courriel</label><input type="email" id="email" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Âge</label><input type="number" id="age" min="18" max="99" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Niveau de maîtrise du français</label>' +
            '<select id="lang_prof" required>' +
            '<option value="">-- Sélectionnez --</option><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="expert">Expert</option><option value="natif">Langue maternelle (Natif)</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Niveau d\'études</label>' +
            '<select id="niveau" required>' +
            '<option value="">-- Sélectionnez --</option><option value="secondaire">Secondaire</option><option value="cegep">Cégep / DEC</option><option value="baccalaureat">Baccalauréat</option><option value="maitrise">Maîtrise</option><option value="doctorat">Doctorat</option><option value="autre">Autre</option>' +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Comment souhaitez-vous recevoir votre compensation ?</label>' +
            '<select id="payment" required>' +
            '<option value="">-- Sélectionnez --</option><option value="interac">Virement Interac (courriel ci-dessus)</option><option value="pickup">Venir chercher à l\'Université Laval</option><option value="cheque">Chèque par la poste</option>' +
            '</select>' +
            '</div>' +
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

    // =========================================================
    // 4. INSTRUCTIONS
    // =========================================================
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

    // =========================================================
    // 5. RESEARCH QUESTION
    // =========================================================
    function countWords(str) {
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

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

        textarea.addEventListener('input', function () {
            var count = countWords(textarea.value);
            wc.textContent = "Mots : " + count + " / 75-100";
            if (count < 75) { wc.className = "word-counter red"; btn.disabled = true; }
            else if (count > 100) { wc.className = "word-counter red"; btn.disabled = false; } // On permet de valider même si >100, ou on bloque ? On laisse passer selon la consigne "visual cue, no hard blocking" pour le max.
            else { wc.className = "word-counter green"; btn.disabled = false; }
        });

        btn.addEventListener('click', function () {
            processSubmitResearch(q, textarea.value);
        });

        startTimer('research');
        // Trigger event input manually to setup initial count
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

    // =========================================================
    // 6. SELF ASSESSMENT (Connaissances, Confiance, NASA-TLX)
    // TOUT EST À 0 PAR DÉFAUT
    // =========================================================
    function renderSelfAssessment() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];

        app.innerHTML =
            '<h2>Auto-évaluation</h2>' +
            '<p>Concernant la question : <em>' + q.text + '</em></p>' +

            '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>1. Niveau de connaissance de base</h3>' +
            '<div class="slider-group">' +
            '<label>J’estime ma connaissance initiale par rapport au sujet de la question au niveau suivant :</label>' +
            '<div class="slider-container"><input type="range" id="k_base" class="slider" min="0" max="100" value="0"><div class="slider-value" id="vk_base">0</div></div>' +
            '<div class="slider-labels"><span>0 (Nulle)</span><span>100 (Excellente)</span></div>' +
            '</div>' +

            '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>2. Confiance envers la réponse et les sources</h3>' +
            '<table class="likert-table">' +
            '<tr><th>Énoncé</th><th>1<br>(Fortement en désaccord)</th><th>2</th><th>3</th><th>4</th><th>5<br>(Fortement en accord)</th></tr>' +
            '<tr><td>J’ai confiance en la réponse que j’ai offerte.</td><td><input type="radio" name="conf1" value="1"></td><td><input type="radio" name="conf1" value="2"></td><td><input type="radio" name="conf1" value="3"></td><td><input type="radio" name="conf1" value="4"></td><td><input type="radio" name="conf1" value="5"></td></tr>' +
            '<tr><td>J’ai utilisé des informations issues de sources numériques pour répondre.</td><td><input type="radio" name="conf2" value="1"></td><td><input type="radio" name="conf2" value="2"></td><td><input type="radio" name="conf2" value="3"></td><td><input type="radio" name="conf2" value="4"></td><td><input type="radio" name="conf2" value="5"></td></tr>' +
            '<tr><td>J’ai confiance en la source numérique que j’ai utilisée.</td><td><input type="radio" name="conf3" value="1"></td><td><input type="radio" name="conf3" value="2"></td><td><input type="radio" name="conf3" value="3"></td><td><input type="radio" name="conf3" value="4"></td><td><input type="radio" name="conf3" value="5"></td></tr>' +
            '</table>' +

            '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>3. NASA-TLX (Charge de travail)</h3>' +
            '<div class="nasa-tlx-grid">' +
            createSliderHtml("tlx_mental", "Exigence Mentale", "Opérations mentales requises (penser, chercher...)") +
            createSliderHtml("tlx_phys", "Exigence Physique", "Opérations physiques requises (cliquer, scroller...)") +
            createSliderHtml("tlx_temp", "Exigence Temporelle", "Pression temporelle ressentie") +
            createSliderHtml("tlx_effort", "Effort", "Difficulté d'accomplir la tâche avec votre niveau de performance") +
            createSliderHtml("tlx_perf", "Performance", "Réussite attribuée à l'atteinte des buts") +
            createSliderHtml("tlx_frust", "Frustration", "Sentiment d'irritabilité, stress ou découragement") +
            '</div>' +

            '<button class="btn btn-primary" id="btnSubmitScale" style="margin-top:30px;">Valider l\'évaluation</button><div id="evalErr" style="color:red; display:none; margin-top:10px;">Veuillez répondre à toutes les questions à choix multiples.</div>';

        // Connect sliders
        bindSlider('k_base');
        ['tlx_mental', 'tlx_phys', 'tlx_temp', 'tlx_effort', 'tlx_perf', 'tlx_frust'].forEach(bindSlider);

        document.getElementById('btnSubmitScale').addEventListener('click', async function () {
            var c1 = document.querySelector('input[name="conf1"]:checked');
            var c2 = document.querySelector('input[name="conf2"]:checked');
            var c3 = document.querySelector('input[name="conf3"]:checked');

            if (!c1 || !c2 || !c3) {
                document.getElementById('evalErr').style.display = 'block';
                return;
            }

            var payload = {
                knowledgeBase: parseInt(document.getElementById('k_base').value),
                confidenceAnswer: parseInt(c1.value),
                confidenceUsedDigital: parseInt(c2.value),
                confidenceSource: parseInt(c3.value),
                nasaTlx: {
                    mental: parseInt(document.getElementById('tlx_mental').value),
                    physical: parseInt(document.getElementById('tlx_phys').value),
                    temporal: parseInt(document.getElementById('tlx_temp').value),
                    effort: parseInt(document.getElementById('tlx_effort').value),
                    performance: parseInt(document.getElementById('tlx_perf').value),
                    frustration: parseInt(document.getElementById('tlx_frust').value)
                }
            };

            await sendToServer('self_assessment', q.id, null, payload);

            state.currentResearchIndex++;
            if (state.currentResearchIndex < state.researchQuestions.length) goTo('research_question');
            else goTo('internet_skills');
        });
    }

    function createSliderHtml(id, title, desc) {
        return '<div class="slider-group" style="margin:0;"><label style="margin-bottom:4px;"><strong>' + title + '</strong></label><div style="font-size:0.8em; color:#64748b; margin-bottom:10px; line-height:1.2;">' + desc + '</div><div class="slider-container"><input type="range" id="' + id + '" class="slider" min="0" max="100" value="0"><div class="slider-value" id="v' + id + '">0</div></div><div class="slider-labels"><span>0 (Faible)</span><span>100 (Forte)</span></div></div>';
    }

    function bindSlider(id) {
        var s = document.getElementById(id);
        var v = document.getElementById('v' + id);
        if(s && v) s.addEventListener('input', function () { v.textContent = s.value; });
    }

    // =========================================================
    // 7. INTERNET SKILLS (van Deursen)
    // =========================================================
    const INTERNET_SKILLS_ITEMS = [
        "Je sais comment télécharger des fichiers.",
        "Je sais comment télécharger/sauvegarder des photos trouvées en ligne.",
        "Je sais comment utiliser les raccourcis clavier (p. ex. CTRL-C, CTRL-S).",
        "Je sais comment ouvrir un nouvel onglet sur mon fureteur internet.",
        "Je sais comment mettre un signet à un site internet.",
        "Je sais où cliquer pour aller sur une page internet différente.",
        "J’ai de la difficulté à trouver les meilleurs mots-clés pour la recherche en ligne.",
        "J’ai de la difficulté à trouver un site internet que j’ai déjà visité.",
        "Je me fatigue rapidement lorsque je cherche de l’information sur internet.",
        "Parfois, je me surprends à naviguer sans réellement savoir comment je m’y suis rendu.",
        "Je suis parfois confus.e de la façon dont les sites internet sont conçus.",
        "Je devrais suivre un cours sur la façon de rechercher de l’information sur internet.",
        "Parfois, je trouve qu’il est difficile de vérifier des informations trouvées en ligne.",
        "Je sais quelles informations je devrais partager et lesquelles je ne devrais pas partager en ligne.",
        "Je sais quand partager et quand ne pas partager d’informations en ligne.",
        "Je m’assure que mes commentaires et comportements en ligne sont appropriés à la situation.",
        "Je sais comment changer les personnes avec qui je partage de l’information en ligne.",
        "Je sais comment enlever des gens de mes listes d’ami.e.s.",
        "Je sais comment créer du nouveau contenu à partir d’images, de musique ou de vidéos trouvés sur le web.",
        "Je sais comment effectuer des changements mineurs au contenu que d’autres ont produit.",
        "Je sais comment concevoir un site web.",
        "Je suis à l'aise avec les différents types de licence qui s’appliquent au contenu en ligne.",
        "Je serais confiant.e de mettre en ligne une vidéo que j’ai créée.",
        "Je sais comment installer une application sur un appareil mobile.",
        "Je sais comment télécharger une application sur mon appareil mobile.",
        "Je sais comment suivre les coûts d’usage des applications mobiles."
    ];

    function renderInternetSkills() {
        var html = '<h2>Évaluation de vos compétences Internet</h2>';
        html += '<p>Pour chaque énoncé, indiquez à quel point il vous correspond (1 = Ne me correspond pas du tout, 5 = Me correspond beaucoup).</p>';
        html += '<table class="likert-table"><tr><th>Énoncé</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
        
        INTERNET_SKILLS_ITEMS.forEach(function(item, i) {
            html += '<tr><td style="font-size:0.9em;">' + item + '</td>';
            for(var v=1; v<=5; v++) html += '<td><input type="radio" name="iskill_' + i + '" value="' + v + '"></td>';
            html += '</tr>';
        });
        
        html += '</table><button class="btn btn-primary" id="btnSubmitSkills">Suivant</button><div id="skillsErr" style="color:red; display:none; margin-top:10px;">Veuillez répondre à tous les énoncés.</div>';
        app.innerHTML = html;

        document.getElementById('btnSubmitSkills').addEventListener('click', async function() {
            var answers = {};
            var allAnswered = true;
            for(var i=0; i<INTERNET_SKILLS_ITEMS.length; i++) {
                var checked = document.querySelector('input[name="iskill_' + i + '"]:checked');
                if(!checked) { allAnswered = false; break; }
                answers['item_' + (i+1)] = parseInt(checked.value);
            }

            if(!allAnswered) {
                document.getElementById('skillsErr').style.display = 'block';
                return;
            }

            await sendToServer('questionnaire_event', null, null, { event: "internet_skills", answers: answers });
            goTo('memory_intro');
        });
    }

    // =========================================================
    // 8. MEMORY INTRO
    // =========================================================
    function renderMemoryIntro() {
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

    // =========================================================
    // 9. MEMORY QUESTION (Texte ouvert, 1 minute strict)
    // =========================================================
    function renderMemoryQuestion() {
        var idx = state.currentMemoryIndex;
        var mq = state.memoryQuestions[idx];

        app.innerHTML =
            '<h2>Mémoire ' + (idx + 1) + ' / ' + state.memoryQuestions.length + '</h2>' +
            '<div class="question-box"><p>' + mq.text + '</p></div>' +
            '<textarea id="memAnswerText" placeholder="Votre réponse de mémoire..." style="min-height:100px;"></textarea>' +
            '<button class="btn btn-primary" id="btnSubmitMemory">Valider</button>';

        document.getElementById('btnSubmitMemory').addEventListener('click', function () {
            var text = document.getElementById('memAnswerText').value.trim();
            processSubmitMemory(mq, text);
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
        
        var payload = {
            sourceQuestionId: memoryQ.sourceQuestionId,
            answerText: text,
            timeSpentSeconds: timeSpent,
            forcedTimeout: timeSpent >= 60
        };

        await sendToServer('memory_answer', memoryQ.id, null, payload);

        state.currentMemoryIndex++;
        if (state.currentMemoryIndex < state.memoryQuestions.length) goTo('memory_question');
        else goTo('deception_consent');
    }

    // =========================================================
    // 10. DECEPTION CONSENT (TEXTE DU PDF INTÉGRÉ)
    // =========================================================
    function renderDeceptionConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">Debriefing & Consentement post-expérimental</h1>' +
            '<div class="consent-box" style="font-size:0.95em;">' +
            '<p>Au cours de l’expérience, vous avez eu à répondre à des questions à développement long à partir de recherches Web que vous avez effectuées. À la fin de l’expérience, vous avez eu à répondre à des questions de mémorisation en lien avec les sujets abordés. L’objectif de l’étude vous a donc été dissimulé.</p>' +
            '<p>Le but caché de l’étude était en fait de voir si votre stratégie de recherche documentaire affecterait votre performance de mémorisation à ce test de mémoire surprise. La raison de cette dissimulation était que nous voulions nous assurer que vous n’utilisiez pas de stratégie de rétention particulière afin de pouvoir évaluer les effets de votre recherche web. Cette connaissance aurait pu modifier vos comportements et réactions face à la tâche.</p>' +
            '<p>Vous connaissez maintenant le but réel de la présente étude. Sachez qu’à la lumière de cette nouvelle information, vous pouvez encore vous retirer de l’étude et ce, sans préjudice. Le cas échéant, vos données seront détruites et ne seront donc pas utilisées. Nous détruirons également tous les autres documents vous liant à la présente étude, notamment le formulaire de consentement que vous avez signé plus tôt.</p>' +
            '<p style="font-size:0.8em; color:#64748b; margin-top:20px;">Ce projet a été approuvé par le Comité d’éthique de la recherche de l’Université Laval : No d’approbation 2025-460 A-1 / 04-05-2026.</p>' +
            '</div>' +

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

    // =========================================================
    // 11. END
    // =========================================================
    function renderEnd() {
        app.innerHTML =
            '<div class="end-screen">' +
            '<h1>Merci pour votre participation !</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">Vos réponses ont été enregistrées avec succès.</p>' +
            '<div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px;">' +
            '<h3 style="margin:0 0 12px; font-size:16px; color:#dc2626;">Dernière étape : désinstaller l\'extension</h3>' +
            '<p style="font-size:14px; color:#475569;">Faites un clic droit sur l\'icône de l\'extension (en haut à droite de Chrome) et sélectionnez <strong>"Supprimer de Chrome"</strong>.</p>' +
            '</div></div>';

        window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
        localStorage.removeItem('questionnaire_progress');
        sendToServer('questionnaire_event', null, null, { event: 'questionnaire_completed' });
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    }

    // =========================================================
    // API
    // =========================================================
    async function sendToServer(type, questionId, difficulty, data) {
        var payload = {
            participantId: state.participantId,
            type: type,
            questionId: questionId,
            difficulty: difficulty,
            data: data,
            timestamp: new Date().toISOString()
        };
        try {
            await fetch(API_BASE + '/reponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            var fallback = JSON.parse(localStorage.getItem('questionnaire_fallback') || '[]');
            fallback.push(payload);
            localStorage.setItem('questionnaire_fallback', JSON.stringify(fallback));
        }
    }

    init();
})();