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

        if (!state.participantId ) {
            app.innerHTML =
                '<div style="text-align:center; padding:60px 0;">' +
                '<h1>Accès invalide</h1>' +
                '<p>Veuillez démarrer l\'étude depuis l\'extension Chrome.<br>' +
                'Le questionnaire s\'ouvrira automatiquement.</p>' +
                '</div>';
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
            } catch (e) { /* ignore */ }
        }

        renderPhase();

        const initSlug = getSlugForPhase(state.phase);
        const initUrl = '/questionnaire/' + initSlug
            + '?pid=' + encodeURIComponent(state.participantId);
        history.replaceState({
            phase: state.phase,
            currentResearchIndex: state.currentResearchIndex,
            currentMemoryIndex: state.currentMemoryIndex
        }, '', initUrl);
    }

    function saveProgress() {
        localStorage.setItem('questionnaire_progress', JSON.stringify(state));
    }

    // =========================================================
    // ROUTING
    // =========================================================
    function renderPhase() {
        hideTimer();
        switch (state.phase) {
            case 'language':          renderLanguage(); break;
            case 'consent':           renderConsent(); break;
            case 'demographics':      renderDemographics(); break;
            case 'instructions':      renderInstructions(); break;
            case 'research_question': renderResearchQuestion(); break;
            case 'self_assessment':   renderSelfAssessment(); break;
            case 'memory_intro':      renderMemoryIntro(); break;
            case 'memory_question':   renderMemoryQuestion(); break;
            case 'deception_consent': renderDeceptionConsent(); break;
            case 'end':               renderEnd(); break;
        }
        updateProgress();
    }

    function getSlugForPhase(phase) {
        switch (phase) {
            case 'language':        return 'langue';
            case 'consent':         return 'consentement';
            case 'demographics':    return 'informations';
            case 'instructions':    return 'instructions';
            case 'research_question': {
                var q = state.researchQuestions[state.currentResearchIndex];
                return q && q.slug ? q.slug : 'question-' + state.currentResearchIndex;
            }
            case 'self_assessment': {
                var q2 = state.researchQuestions[state.currentResearchIndex];
                return q2 && q2.slug ? 'eval-' + q2.slug : 'eval-' + state.currentResearchIndex;
            }
            case 'memory_intro':      return 'memory-intro';
            case 'memory_question': {
                var mq = state.memoryQuestions[state.currentMemoryIndex];
                return mq && mq.slug ? mq.slug : 'memory-' + state.currentMemoryIndex;
            }
            case 'deception_consent': return 'consentement-post-etude';
            case 'end':               return 'fin';
            default:                  return phase;
        }
    }

    function goTo(phase) {
        state.phase = phase;
        saveProgress();

        var slug = getSlugForPhase(phase);
        var url = '/questionnaire/' + slug
            + '?pid=' + encodeURIComponent(state.participantId);

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
        var totalResearch = state.researchQuestions.length || 3;
        var totalMemory = state.memoryQuestions.length || 6;
        var hiddenPhases = ['language', 'consent', 'demographics', 'instructions'];
        var current = 0;
        // Total visible steps: research*2 + memory_intro + memory + deception_consent + end
        var total = (totalResearch * 2) + 1 + totalMemory + 1 + 1;

        if (hiddenPhases.indexOf(state.phase) !== -1) {
            progressBar.classList.add('hidden');
            return;
        }

        progressBar.classList.remove('hidden');

        if (state.phase === 'research_question') {
            current = (state.currentResearchIndex * 2);
        } else if (state.phase === 'self_assessment') {
            current = (state.currentResearchIndex * 2) + 1;
        } else if (state.phase === 'memory_intro') {
            current = (totalResearch * 2);
        } else if (state.phase === 'memory_question') {
            current = (totalResearch * 2) + 1 + state.currentMemoryIndex;
        } else if (state.phase === 'deception_consent') {
            current = (totalResearch * 2) + 1 + totalMemory;
        } else if (state.phase === 'end') {
            current = total;
        }

        var pct = Math.round((current / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
    }

    // =========================================================
    // TIMER (10 min soft limit)
    // =========================================================
    function startTimer() {
        elapsedSeconds = 0;
        state.questionStartTime = Date.now();
        timerEl.classList.remove('hidden');
        timerEl.className = 'timer green';
        updateTimerDisplay();

        timerInterval = setInterval(function () {
            elapsedSeconds = Math.floor((Date.now() - state.questionStartTime) / 1000);
            updateTimerDisplay();

            if (elapsedSeconds < 300) {
                timerEl.className = 'timer green';
            } else if (elapsedSeconds < 480) {
                timerEl.className = 'timer orange';
            } else if (elapsedSeconds < 600) {
                timerEl.className = 'timer red';
            } else {
                timerEl.className = 'timer red blink';
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
    // 1. LANGUAGE SELECTION
    // =========================================================
    function renderLanguage() {
        app.innerHTML =
            '<h1 style="text-align:center;">Preferred Language / Langue préférentielle</h1>' +
            '<p style="text-align:center; color:#64748b;">Please select your preferred language for this study.<br>' +
            'Veuillez sélectionner votre langue préférentielle pour cette étude.</p>' +

            '<div class="form-group" style="max-width:400px; margin:30px auto;">' +
            '<select id="languageSelect" required>' +
            '<option value="">-- Sélectionnez / Select --</option>' +
            '<option value="french">Français / French</option>' +
            '<option value="english" disabled>English / Anglais (coming soon)</option>' +
            '</select>' +
            '</div>' +

            '<div style="text-align:center;">' +
            '<button class="btn btn-primary" id="btnLanguage" disabled>Continuer / Continue</button>' +
            '</div>';

        var select = document.getElementById('languageSelect');
        var btn = document.getElementById('btnLanguage');

        select.addEventListener('change', function () {
            btn.disabled = !select.value;
        });

        btn.addEventListener('click', function () {
            state.language = select.value;
            sendToServer('language_selection', null, null, {
                language: state.language,
                timestamp: new Date().toISOString()
            });
            goTo('consent');
        });
    }

    // =========================================================
    // 2. CONSENT (initial - sert de presentation, SANS mention memoire)
    // =========================================================
    function renderConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">Formulaire de consentement</h1>' +
            '<p style="text-align:center;color:#64748b;">Veuillez lire attentivement les informations suivantes avant de participer à l\'étude.</p>' +

            '<div class="consent-box">' +

            '<h3>Présentation du chercheur</h3>' +
            '<p>Cette recherche est réalisée dans le cadre d\'une subvention du Conseil de recherche en sciences ' +
            'naturelles et en génie, dirigée par Alexandre Marois, professeur adjoint à l\'École de psychologie de ' +
            'l\'Université Laval et directeur du Laboratoire d\'études interdisciplinaires sur les limites et ' +
            'l\'augmentation humaines (LEILAH).</p>' +

            '<h3>Introduction</h3>' +
            '<p>Avant d\'accepter de participer à cette étude, veuillez prendre le temps de lire et de comprendre ' +
            'les renseignements qui suivent. Ce document vous explique le but de cette recherche, ses procédures, ' +
            'avantages et inconvénients. Si vous avez des questions sur la recherche ou sur les implications de votre ' +
            'participation, veuillez communiquer avec le laboratoire par courriel au ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Nature de l\'étude</h3>' +
            '<p>La recherche vise à mieux comprendre la façon dont les individus interagissent avec des technologies ' +
            'de l\'information pour la recherche documentaire, plus spécifiquement des technologies web.</p>' +

            '<h3>Déroulement de la participation</h3>' +
            '<p>Une fois cette fiche de consentement lue, vous serez amené(e) à remplir une fiche sur laquelle vous ' +
            'devez préciser quelques-unes de vos caractéristiques sociodémographiques. Nous vous demanderons ensuite ' +
            'd\'effectuer une tâche de recherche documentaire. Pour ce faire, nous vous inviterons à répondre à des ' +
            'questions à développement long sur différents sujets de culture générale.</p>' +
            '<p>Afin de vous soutenir dans votre tâche, vous serez encouragé(e) à utiliser des moteurs de recherche ' +
            'classiques (p. ex. Google). Nous vous demandons de <strong>ne pas utiliser d\'outil d\'intelligence ' +
            'artificielle</strong> (p. ex. Gemini, ChatGPT ou Copilot) pour réaliser la tâche. Votre navigation sera ' +
            'enregistrée tout au long de l\'étude et, conséquemment, l\'équipe de recherche devra invalider vos données ' +
            'si vous utilisez ces outils.</p>' +
            '<p>Après chacune des questions à développement long, quelques questions vous seront posées quant aux ' +
            'processus que vous avez mis en branle lors de la recherche d\'information que vous avez effectuée. ' +
            'À la fin, vous aurez également à remplir deux autres questionnaires par rapport à votre expérience.</p>' +
            '<p>Vos questionnaires ne seront considérés comme complets que si vous consentez à participer à la ' +
            'recherche en sélectionnant l\'option correspondante.</p>' +

            '<h3>Avantages et inconvénients</h3>' +
            '<p>Un avantage à cette étude est que vous contribuerez aux avancements des connaissances liées à ' +
            'l\'usage des technologies de l\'information afin de soutenir la performance humaine. Ce projet permettra ' +
            'de mettre en lumière les processus mis en branle lors de la recherche documentaire. L\'étude permettra ' +
            'aussi de valider et de produire des normes de réponse pour les différentes questions auxquelles vous ' +
            'répondrez.</p>' +
            '<p>Un inconvénient à ce projet est l\'induction d\'une certaine fatigue cognitive. Vous aurez en effet ' +
            'à effectuer un effort mental modéré pendant environ 60 min. Le temps consacré au projet peut également ' +
            'représenter un inconvénient. Vous aurez la possibilité de prendre une pause à tout moment si la fatigue ' +
            'que vous ressentez devient trop difficile mais vous devrez tout de même terminer l\'étude en une seule ' +
            'période.</p>' +

            '<h3>Participation volontaire et droit de retrait</h3>' +
            '<p>Vous êtes libre de participer ou non à cette étude. Le simple retour du questionnaire rempli sera ' +
            'considéré comme l\'expression implicite de votre consentement à participer au projet. Si vous désirez ' +
            'vous retirer de l\'étude une fois le questionnaire soumis, veuillez communiquer avec le laboratoire par ' +
            'courriel au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Nous pourrons retirer vos ' +
            'résultats sans préjudice, en gardant votre compensation et sans avoir à justifier votre décision.</p>' +

            '<h3>Confidentialité et gestion des données</h3>' +
            '<p>Les données recueillies pendant cette étude sont entièrement confidentielles et ne pourront en aucun ' +
            'cas mener à votre identification. Votre confidentialité sera assurée par l\'attribution d\'un code ' +
            'numérique qui ne figure pas au présent formulaire à toutes les données de recherche collectées. ' +
            'Les données ne seront accessibles qu\'aux membres de l\'équipe de recherche, chacun d\'eux ayant signé ' +
            'un engagement à la confidentialité.</p>' +
            '<p>Les données seront conservées par l\'équipe de recherche pour utilisation ultérieure sous forme codée ' +
            'de manière irréversible dans une base de données anonyme, c\'est-à-dire à la suite de la destruction du ' +
            'matériel de recherche (liste de nom des personnes participantes et tout document permettant de les ' +
            'identifier), jusqu\'au plus tard en <strong>décembre 2035</strong>. Les résultats de la recherche, qui ' +
            'pourront être diffusés sous forme d\'article scientifique, de rapport de recherche, de présentation à un ' +
            'congrès scientifique et/ou d\'une thèse doctorale, ne permettront pas d\'identifier les personnes ' +
            'participantes.</p>' +

            '<h3>Renseignements supplémentaires</h3>' +
            '<p>Si vous avez des questions sur la recherche ou sur les implications de votre participation, veuillez ' +
            'communiquer avec le laboratoire par courriel au ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Plaintes ou critiques</h3>' +
            '<p>Toute plainte ou critique sur cette étude pourra être adressée au Bureau de l\'Ombudsman de ' +
            'l\'Université Laval :</p>' +
            '<p style="font-size:0.9em; color:#64748b; line-height:1.8;">' +
            'Pavillon Alphonse-Desjardins, bureau 3320<br>' +
            '2325, rue de l\'Université<br>' +
            'Université Laval<br>' +
            'Québec (Québec) G1V 0A6<br>' +
            'Renseignements - Secrétariat : 1 418 656-3081<br>' +
            'Ligne sans frais : 1 866 323-2271<br>' +
            'Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>' +

            '</div>' +


            '<div class="consent-checks">' +
            '<label class="consent-label">' +
            '<input type="checkbox" id="consent1">' +
            '<span>J\'ai lu et compris les informations ci-dessus et je souhaite participer à l\'étude. ' +
            'Je confirme être âgé(e) de 18 ans ou plus.</span>' +
            '</label>' +
            '</div>' +


            '<button class="btn btn-primary" id="btnConsent" disabled>J\'accepte et je souhaite participer</button>' +
            '<p style="text-align:center;margin-top:12px;">' +
            '<a href="#" id="btnRefuse" style="color:#94a3b8;font-size:13px;">Je ne souhaite pas participer</a></p>';

        var checkboxes = document.querySelectorAll('.consent-checks input[type="checkbox"]');
        var btnConsent = document.getElementById('btnConsent');

        function updateConsentBtn() {
            var allChecked = true;
            checkboxes.forEach(function (cb) {
                if (!cb.checked) allChecked = false;
            });
            btnConsent.disabled = !allChecked;
        }

        checkboxes.forEach(function (cb) {
            cb.addEventListener('change', updateConsentBtn);
        });

        btnConsent.addEventListener('click', function () {
            state.consentGiven = true;
            sendToServer('consent', 'CONSENT_1', null, {
                consent: true,
                questionLabel: "Consentement Initial",
                timestamp: new Date().toISOString()
            });

            window.postMessage({ type: 'START_TRACKING', participantId: state.participantId}, '*');

            goTo('demographics');
        });

        document.getElementById('btnRefuse').addEventListener('click', function (e) {
            e.preventDefault();

            sendToServer('consent', 'CONSENT_1', null, {
                consent: false,
                questionLabel: "Consentement Initial",
                timestamp: new Date().toISOString()
            });

            app.innerHTML =
                '<div style="text-align:center;padding:60px 0;">' +
                '<h1>Merci</h1>' +
                '<p>Nous comprenons votre décision. Vous pouvez fermer cette page.</p>' +
                '<p style="color:#94a3b8;margin-top:20px;">Si vous changez d\'avis, vous pouvez ' +
                'relancer l\'étude depuis l\'extension Chrome.</p>' +
                '</div>';
        });
    }

    // =========================================================
    // 3. DEMOGRAPHICS (email, age, niveau d'etudes)
    // =========================================================
    function renderDemographics() {
        app.innerHTML =
            '<h2>Informations personnelles</h2>' +
            '<p>Ces informations sont anonymisées et utilisées uniquement à des fins de recherche.</p>' +

            '<div class="form-group">' +
            '<label for="email">Adresse courriel (celle utilisée pour l\'inscription à l\'étude)</label>' +
            '<input type="email" id="email" placeholder="votre.email@exemple.com" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="age">Âge</label>' +
            '<input type="number" id="age" min="18" max="99" placeholder="Ex: 25" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="niveau_etudes">Niveau d\'études</label>' +
            '<select id="niveau_etudes" required>' +
            '<option value="">-- Sélectionnez --</option>' +
            '<option value="secondaire">Secondaire (lycée)</option>' +
            '<option value="cegep">Cégep / DEC</option>' +
            '<option value="baccalaureat">Baccalauréat universitaire</option>' +
            '<option value="maitrise">Maîtrise</option>' +
            '<option value="doctorat">Doctorat</option>' +
            '<option value="autre">Autre</option>' +
            '</select>' +
            '</div>' +

            '<button class="btn btn-primary" id="btnDemographics">Suivant</button>' +
            '<div id="demoError" style="color:#dc2626; margin-top:10px; display:none;"></div>';

        document.getElementById('btnDemographics').addEventListener('click', submitDemographics);
    }

    async function submitDemographics() {
        var email = document.getElementById('email').value.trim();
        var age = document.getElementById('age').value;
        var niveau = document.getElementById('niveau_etudes').value;
        var errEl = document.getElementById('demoError');

        if (!email || !age || !niveau) {
            errEl.textContent = 'Veuillez remplir tous les champs.';
            errEl.style.display = 'block';
            return;
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errEl.textContent = 'Veuillez entrer une adresse courriel valide.';
            errEl.style.display = 'block';
            return;
        }

        state.demographics = {
            email: email,
            age: parseInt(age),
            niveau_etudes: niveau
        };

        await sendToServer('demographics', null, null, state.demographics);

        var drawn = drawQuestions();
        state.researchQuestions = drawn.researchQuestions;
        state.memoryQuestions = drawn.memoryQuestions;
        state.drawnQuestionIds = drawn.researchQuestions.map(function (q) { return q.id; });

        goTo('instructions');
    }

    // =========================================================
    // 4. INSTRUCTIONS (SANS mention du test de memoire)
    // =========================================================
    function renderInstructions() {
        app.innerHTML =
            '<h2>Instructions</h2>' +
            '<p>Vous allez répondre à <strong>' + state.researchQuestions.length + ' questions de recherche</strong>.</p>' +
            '<p>Pour chaque question :</p>' +
            '<ol class="instructions-list">' +
            '<li>Lisez attentivement la question affichée.</li>' +
            '<li><strong>Naviguez librement sur Internet</strong> dans d\'autres onglets pour trouver la réponse.</li>' +
            '<li>Revenez sur cet onglet et rédigez votre réponse.</li>' +
            '<li>Évaluez vos connaissances et votre effort.</li>' +
            '</ol>' +
            '<p>Un <strong>chronomètre</strong> sera affiché en haut à droite. ' +
            'Essayez de répondre en <strong>moins de 10 minutes</strong> par question.</p>' +
            '<p style="margin-top:20px;"><strong>Répondez le plus précisément possible.</strong></p>' +
            '<button class="btn btn-success" id="btnStartQuestions">Commencer les questions</button>';

        document.getElementById('btnStartQuestions').addEventListener('click', function () {
            state.currentResearchIndex = 0;
            goTo('research_question');
        });
    }

    // =========================================================
    // 5. RESEARCH QUESTION
    // =========================================================
    function renderResearchQuestion() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];
        var total = state.researchQuestions.length;

        app.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
            '<h2>Question ' + (idx + 1) + ' / ' + total + '</h2>' +
            '</div>' +

            '<div class="question-box">' +
            '<p>' + q.text + '</p>' +
            '</div>' +

            '<p style="color:#64748b; font-size:0.9em; margin-bottom:12px;">' +
            'Vous pouvez ouvrir d\'autres onglets pour chercher la réponse sur Internet.' +
            '</p>' +

            '<textarea id="answerText" placeholder="Rédigez votre réponse ici..."></textarea>' +

            '<button class="btn btn-primary" id="btnSubmitAnswer" disabled>Valider ma réponse</button>' +
            '<div class="status-saving" id="savingStatus"></div>';

        var textarea = document.getElementById('answerText');
        var btn = document.getElementById('btnSubmitAnswer');

        var existingAnswer = state.answers[state.currentResearchIndex];
        if (existingAnswer && existingAnswer.data) {
            textarea.value = existingAnswer.data.answer;
        }

        textarea.addEventListener('input', function () {
            btn.disabled = textarea.value.trim().length < 10;
        });

        btn.addEventListener('click', function () {
            submitResearchAnswer(q);
        });

        startTimer();
    }

    async function submitResearchAnswer(question) {
        var answerText = document.getElementById('answerText').value.trim();
        var timeSpent = stopTimer();

        var answerData = {
            answer: answerText,
            timeSpentSeconds: timeSpent,
            questionIndex: state.currentResearchIndex,
            exceededTimeLimit: timeSpent > 600
        };

        state.answers[state.currentResearchIndex] = {
            questionId: question.id,
            data: answerData
        };

        document.getElementById('savingStatus').textContent = 'Sauvegarde en cours...';

        await sendToServer('research_answer', question.id, null, answerData);

        goTo('self_assessment');
    }

    // =========================================================
    // 6. SELF ASSESSMENT - 2 SLIDERS (0-100)
    // =========================================================
    function renderSelfAssessment() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];

        app.innerHTML =
            '<h2>Auto-évaluation</h2>' +
            '<p>Concernant la question que vous venez de traiter :</p>' +
            '<div class="question-box">' +
            '<p style="font-size:0.95em;">' + q.text + '</p>' +
            '</div>' +

            '<div class="slider-group">' +
            '<label class="slider-label">Avant de faire votre recherche, comment évalueriez-vous ' +
            'votre <strong>niveau de connaissance</strong> sur ce sujet ?</label>' +
            '<div class="slider-container">' +
            '<input type="range" id="sliderKnowledge" class="slider" min="0" max="100" value="50">' +
            '<div class="slider-value" id="sliderKnowledgeVal">50</div>' +
            '</div>' +
            '<div class="slider-labels">' +
            '<span>0 - Aucune connaissance</span>' +
            '<span>100 - Expert(e)</span>' +
            '</div>' +
            '</div>' +

            '<div class="slider-group">' +
            '<label class="slider-label">Quel <strong>niveau d\'effort</strong> avez-vous ' +
            'déployé pour rechercher et formuler votre réponse ?</label>' +
            '<div class="slider-container">' +
            '<input type="range" id="sliderEffort" class="slider" min="0" max="100" value="50">' +
            '<div class="slider-value" id="sliderEffortVal">50</div>' +
            '</div>' +
            '<div class="slider-labels">' +
            '<span>0 - Aucun effort</span>' +
            '<span>100 - Effort maximal</span>' +
            '</div>' +
            '</div>' +

            '<button class="btn btn-primary" id="btnSubmitScale">Suivant</button>';

        var sk = document.getElementById('sliderKnowledge');
        var skv = document.getElementById('sliderKnowledgeVal');
        sk.addEventListener('input', function () { skv.textContent = sk.value; });

        var se = document.getElementById('sliderEffort');
        var sev = document.getElementById('sliderEffortVal');
        se.addEventListener('input', function () { sev.textContent = se.value; });

        document.getElementById('btnSubmitScale').addEventListener('click', function () {
            submitSelfAssessment(q);
        });
    }

    async function submitSelfAssessment(question) {
        var knowledge = parseInt(document.getElementById('sliderKnowledge').value);
        var effort = parseInt(document.getElementById('sliderEffort').value);

        state.selfAssessments[state.currentResearchIndex] = {
            questionId: question.id,
            knowledge: knowledge,
            effort: effort
        };

        await sendToServer('self_assessment', question.id, null, {
            priorKnowledge: knowledge,
            effortLevel: effort,
            questionIndex: state.currentResearchIndex
        });

        state.currentResearchIndex++;
        if (state.currentResearchIndex < state.researchQuestions.length) {
            goTo('research_question');
        } else {
            // Apres les questions de recherche -> test de memoire (surprise)
            goTo('memory_intro');
        }
    }

    // =========================================================
    // 7. MEMORY INTRO
    // =========================================================
    function renderMemoryIntro() {
        app.innerHTML =
            '<div style="text-align:center;">' +
            '<h1>Test de mémoire</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">' +
            'Vous allez maintenant répondre à <strong>' + state.memoryQuestions.length +
            ' questions à choix multiples</strong> portant sur les informations que vous avez consultées.' +
            '</p>' +
            '<p>Répondez <strong>de mémoire</strong>, sans retourner sur Internet.</p>' +
            '<p style="color:#64748b;">Il n\'y a pas de chronomètre pour cette partie.</p>' +
            '<button class="btn btn-primary" id="btnStartMemory">Commencer le test</button>' +
            '</div>';

        document.getElementById('btnStartMemory').addEventListener('click', function () {
            state.currentMemoryIndex = 0;
            goTo('memory_question');
        });
    }

    // =========================================================
    // 8. MEMORY QUESTION
    // =========================================================
    function renderMemoryQuestion() {
        var idx = state.currentMemoryIndex;
        var mq = state.memoryQuestions[idx];
        var total = state.memoryQuestions.length;

        var optionsHTML = '<ul class="mcq-options">';
        mq.options.forEach(function (opt, i) {
            optionsHTML +=
                '<li><label>' +
                '<input type="radio" name="mcq" value="' + i + '">' +
                '<span>' + opt + '</span>' +
                '</label></li>';
        });
        optionsHTML += '</ul>';

        app.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<h2>Mémoire ' + (idx + 1) + ' / ' + total + '</h2>' +
            '</div>' +
            '<div class="question-box" style="margin-top:16px;">' +
            '<p>' + mq.text + '</p>' +
            '</div>' +
            optionsHTML +
            '<button class="btn btn-primary" id="btnSubmitMemory" disabled>Suivant</button>';

        document.querySelectorAll('input[name="mcq"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                document.getElementById('btnSubmitMemory').disabled = false;
            });
        });

        document.getElementById('btnSubmitMemory').addEventListener('click', function () {
            submitMemoryAnswer(mq);
        });
    }

    async function submitMemoryAnswer(memoryQ) {
        var selected = parseInt(document.querySelector('input[name="mcq"]:checked').value);
        var isCorrect = selected === memoryQ.correct;

        state.memoryAnswers[state.currentMemoryIndex] = {
            questionId: memoryQ.id,
            selected: selected,
            correct: memoryQ.correct,
            isCorrect: isCorrect
        };

        await sendToServer('memory_answer', memoryQ.id, null, {
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
            // Apres les questions de memoire -> consentement post-duperie
            goTo('deception_consent');
        }
    }

    // =========================================================
    // 9. DECEPTION CONSENT (post-etude, APRES les questions memoire)
    //    Contenu base sur le PDF post-experimental
    // =========================================================
    function renderDeceptionConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">Formulaire d\'information et de consentement post-expérimental</h1>' +
            '<p style="text-align:center;color:#64748b;">Validation de questions de connaissances générales pour l\'étude des processus de recherche d\'information sur le Web</p>' +

            '<div class="consent-box">' +

            '<h3>Introduction</h3>' +
            '<p>Suite à la divulgation de la duperie à laquelle vous avez été exposé(e), nous vous ' +
            'fournissons un addendum post-expérimental au formulaire d\'information et de consentement ' +
            'que vous avez signé avant le début de l\'expérience. Ce document explique les éléments qui ' +
            'ont été dissimulés dans le formulaire original et réitère les informations liées à votre ' +
            'consentement. Vous êtes invité(e) à contacter l\'équipe du laboratoire si vous avez des ' +
            'questions que vous jugez utiles.</p>' +

            '<h3>Nature de l\'étude</h3>' +
            '<p>Initialement, nous avons indiqué que le but de cette recherche était de mieux comprendre ' +
            'comment les individus interagissent avec les technologies de l\'information à des fins de ' +
            'recherche d\'information, plus spécifiquement les technologies web. Les véritables objectifs ' +
            'de l\'étude sont de mieux comprendre comment les <strong>stratégies de recherche sur le web ' +
            'peuvent affecter la mémorisation du contenu</strong> rencontré dans un contexte de recherche ' +
            'd\'information.</p>' +

            '<h3>Participation volontaire et droit de retrait</h3>' +
            '<p>Vous êtes libre de maintenir ou de retirer votre consentement suite à la divulgation de ' +
            'cette information. Vous pouvez mettre fin à votre participation sans préjudice, conserver ' +
            'votre compensation, et sans avoir à justifier votre décision. Toutes les informations ' +
            'personnelles vous concernant ainsi que vos réponses seront alors détruites.</p>' +
            '<p>Veuillez sélectionner l\'option qui reflète le mieux votre décision suite à la divulgation ' +
            'de cette duperie.</p>' +

            '<h3>Informations supplémentaires</h3>' +
            '<p>Pour toute question, veuillez contacter le laboratoire à ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Plaintes ou critiques</h3>' +
            '<p>Les plaintes peuvent être adressées au Bureau de l\'ombudsman de l\'Université Laval :</p>' +
            '<p style="font-size:0.9em; color:#64748b; line-height:1.8;">' +
            'Pavillon Alphonse-Desjardins, bureau 3320<br>' +
            '2325, rue de l\'Université<br>' +
            'Université Laval<br>' +
            'Québec (Québec) G1V 0A6<br>' +
            'Renseignements - Secrétariat : 1 418 656-3081<br>' +
            'Ligne sans frais : 1 866 323-2271<br>' +
            'Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>' +

            '</div>' +

            '<div class="consent-checks">' +
            '<label class="consent-label">' +
            '<input type="radio" name="deceptionChoice" value="maintain">' +
            '<span>Je souhaite <strong>maintenir</strong> ma participation à l\'étude.</span>' +
            '</label>' +
            '<label class="consent-label">' +
            '<input type="radio" name="deceptionChoice" value="withdraw">' +
            '<span>Je souhaite <strong>mettre fin</strong> à ma participation à l\'étude.</span>' +
            '</label>' +
            '</div>' +

            '<button class="btn btn-primary" id="btnDeceptionConsent" disabled>Confirmer mon choix</button>';

        var radios = document.querySelectorAll('input[name="deceptionChoice"]');
        var btn = document.getElementById('btnDeceptionConsent');

        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                btn.disabled = false;
            });
        });

        btn.addEventListener('click', function () {
            var selected = document.querySelector('input[name="deceptionChoice"]:checked').value;

            if (selected === 'maintain') {
                state.deceptionConsentGiven = true;
                sendToServer('deception_consent', 'CONSENT_2', null, {
                    consent: true,
                    decision: 'maintain',
                    questionLabel: "Consentement Post-Expérimental (Maintenu)",
                    timestamp: new Date().toISOString()
                });
                goTo('end');
            } else {
                state.deceptionConsentGiven = false;
                sendToServer('deception_consent', 'CONSENT_2', null, {
                    consent: false,
                    decision: 'withdraw',
                    questionLabel: "Consentement Post-Expérimental (Retiré)",
                    timestamp: new Date().toISOString()
                });
                app.innerHTML =
                    '<div style="text-align:center;padding:60px 0;">' +
                    '<h1>Merci</h1>' +
                    '<p>Nous comprenons votre décision. Vos données seront détruites ' +
                    'conformément à notre politique de confidentialité.</p>' +
                    '<p style="color:#64748b; margin-top:16px;">Vous pouvez désinstaller l\'extension Chrome :</p>' +
                    '<p style="font-size:0.9em; color:#475569;">Clic droit sur l\'icône de l\'extension > ' +
                    '<strong style="color:#ef4444;">Supprimer de Chrome</strong></p>' +
                    '<p style="color:#94a3b8;margin-top:20px;">Pour toute question : ' +
                    '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a></p>' +
                    '</div>';
                localStorage.removeItem('questionnaire_progress');
                window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
            }
        });
    }

    // =========================================================
    // 10. END - Page de desinstallation
    // =========================================================
    function renderEnd() {
        var totalMemory = state.memoryAnswers.length;
        var correctMemory = state.memoryAnswers.filter(function (a) {
            return a && a.isCorrect;
        }).length;

        app.innerHTML =
            '<div class="end-screen">' +
            '<h1>Merci pour votre participation</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">' +
            'Vos réponses ont été enregistrées avec succès.' +
            '</p>' +
            '<p style="color:#64748b;">' +
            'Score mémoire : ' + correctMemory + ' / ' + totalMemory +
            '</p>' +

            '<div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px;">' +
            '<h3 style="margin:0 0 12px; font-size:16px; color:#dc2626;">Dernière étape : désinstaller l\'extension</h3>' +
            '<p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:16px;">' +
            'L\'étude est terminée. Pour désinstaller l\'extension :</p>' +

            '<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Faites un <strong>clic droit</strong> sur l\'icône de l\'extension en haut à droite de Chrome.</p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong style="color:#ef4444;">"Supprimer de Chrome"</strong> puis confirmez.</p>' +
            '</div>' +

            '</div>' +

            '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">' +

            '<h4 style="margin:0 0 12px; font-size:14px; color:#475569;">Méthode alternative</h4>' +
            '<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Copiez et collez cette adresse dans votre barre d\'adresse : ' +
            '<span id="copyUrl" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;font-family:monospace;font-size:13px;color:#3b82f6;cursor:pointer;" title="Cliquer pour copier">chrome://extensions</span></p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Trouvez <strong>"Étude Navigation Web - Université Laval"</strong> dans la liste.</p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">3</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong>"Supprimer"</strong> puis confirmez.</p>' +
            '</div>' +

            '</div>' +

            '</div>' +

            '<div style="margin-top:20px; padding:16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;">' +
            '<p style="font-size:13px; color:#0369a1; margin:0; line-height:1.5;">' +
            '<strong>Confidentialité :</strong> Vos données sont anonymisées et chiffrées. ' +
            'Aucune donnée personnelle n\'est conservée. ' +
            'Pour toute question : <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a></p>' +
            '</div>' +

            '</div>';

        // Copier chrome://extensions
        var copyEl = document.getElementById('copyUrl');
        if (copyEl) {
            copyEl.addEventListener('click', function () {
                navigator.clipboard.writeText('chrome://extensions').then(function () {
                    copyEl.textContent = 'Copié !';
                    setTimeout(function () { copyEl.textContent = 'chrome://extensions'; }, 2000);
                });
            });
        }

        // Signaler la fin a l'extension
        window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');

        // Nettoyer la progression
        localStorage.removeItem('questionnaire_progress');

        // Envoyer l'evenement de fin au serveur
        sendToServer('questionnaire_event', null, null, {
            event: 'questionnaire_completed',
            totalResearchQuestions: state.researchQuestions.length,
            totalMemoryQuestions: totalMemory,
            memoryScore: correctMemory,
            deceptionConsentMaintained: state.deceptionConsentGiven
        });

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
            var resp = await fetch(API_BASE + '/reponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                var err = await resp.json();
                console.error('Erreur serveur:', err);
            }
        } catch (err) {
            console.error('Erreur reseau:', err.message);
            var fallback = JSON.parse(localStorage.getItem('questionnaire_fallback') || '[]');
            fallback.push(payload);
            localStorage.setItem('questionnaire_fallback', JSON.stringify(fallback));
        }
    }

    // =========================================================
    // BOOT
    // =========================================================
    init();

})();