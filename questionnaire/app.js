(function () {
    'use strict';

    const API_BASE = window.location.origin + '/api/questionnaire';

    // =========================================================
    // STATE
    // =========================================================
    let state = {
        phase: 'language',
        participantId: null,
        sessionId: null,
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
        state.sessionId = params.get('sid');

        if (!state.participantId || !state.sessionId) {
            app.innerHTML =
                '<div style="text-align:center; padding:60px 0;">' +
                '<h1>Acces invalide</h1>' +
                '<p>Veuillez demarrer l\'etude depuis l\'extension Chrome.<br>' +
                'Le questionnaire s\'ouvrira automatiquement.</p>' +
                '</div>';
            return;
        }

        const saved = localStorage.getItem('questionnaire_progress');
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
            '<h1 style="text-align:center;">Preferred Language / Langue preferentielle</h1>' +
            '<p style="text-align:center; color:#64748b;">Please select your preferred language for this study.<br>' +
            'Veuillez selectionner votre langue preferentielle pour cette etude.</p>' +

            '<div class="form-group" style="max-width:400px; margin:30px auto;">' +
            '<select id="languageSelect" required>' +
            '<option value="">-- Selectionnez / Select --</option>' +
            '<option value="french">Francais / French</option>' +
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
            '<p style="text-align:center;color:#64748b;">Veuillez lire attentivement les informations suivantes avant de participer a l\'etude.</p>' +

            '<div class="consent-box">' +

            '<h3>Presentation du chercheur</h3>' +
            '<p>Cette recherche est realisee dans le cadre d\'une subvention du Conseil de recherche en sciences ' +
            'naturelles et en genie, dirigee par Alexandre Marois, professeur adjoint a l\'Ecole de psychologie de ' +
            'l\'Universite Laval et directeur du Laboratoire d\'etudes interdisciplinaires sur les limites et ' +
            'l\'augmentation humaines (LEILAH).</p>' +

            '<h3>Introduction</h3>' +
            '<p>Avant d\'accepter de participer a cette etude, veuillez prendre le temps de lire et de comprendre ' +
            'les renseignements qui suivent. Ce document vous explique le but de cette recherche, ses procedures, ' +
            'avantages et inconvenients. Si vous avez des questions sur la recherche ou sur les implications de votre ' +
            'participation, veuillez communiquer avec le laboratoire par courriel au ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Nature de l\'etude</h3>' +
            '<p>La recherche vise a mieux comprendre la facon dont les individus interagissent avec des technologies ' +
            'de l\'information pour la recherche documentaire, plus specifiquement des technologies web.</p>' +

            '<h3>Deroulement de la participation</h3>' +
            '<p>Une fois cette fiche de consentement lue, vous serez amene(e) a remplir une fiche sur laquelle vous ' +
            'devez preciser quelques-unes de vos caracteristiques sociodemographiques. Nous vous demanderons ensuite ' +
            'd\'effectuer une tache de recherche documentaire. Pour ce faire, nous vous inviterons a repondre a des ' +
            'questions a developpement long sur differents sujets de culture generale.</p>' +
            '<p>Afin de vous soutenir dans votre tache, vous serez encourage(e) a utiliser des moteurs de recherche ' +
            'classiques (p. ex. Google). Nous vous demandons de <strong>ne pas utiliser d\'outil d\'intelligence ' +
            'artificielle</strong> (p. ex. Gemini, ChatGPT ou Copilot) pour realiser la tache. Votre navigation sera ' +
            'enregistree tout au long de l\'etude et, consequemment, l\'equipe de recherche devra invalider vos donnees ' +
            'si vous utilisez ces outils.</p>' +
            '<p>Apres chacune des questions a developpement long, quelques questions vous seront posees quant aux ' +
            'processus que vous avez mis en branle lors de la recherche d\'information que vous avez effectuee. ' +
            'A la fin, vous aurez egalement a remplir deux autres questionnaires par rapport a votre experience.</p>' +
            '<p>Vos questionnaires ne seront consideres comme complets que si vous consentez a participer a la ' +
            'recherche en selectionnant l\'option correspondante.</p>' +

            '<h3>Avantages et inconvenients</h3>' +
            '<p>Un avantage a cette etude est que vous contribuerez aux avancements des connaissances liees a ' +
            'l\'usage des technologies de l\'information afin de soutenir la performance humaine. Ce projet permettra ' +
            'de mettre en lumiere les processus mis en branle lors de la recherche documentaire. L\'etude permettra ' +
            'aussi de valider et de produire des normes de reponse pour les differentes questions auxquelles vous ' +
            'repondrez.</p>' +
            '<p>Un inconvenient a ce projet est l\'induction d\'une certaine fatigue cognitive. Vous aurez en effet ' +
            'a effectuer un effort mental modere pendant environ 60 min. Le temps consacre au projet peut egalement ' +
            'representer un inconvenient. Vous aurez la possibilite de prendre une pause a tout moment si la fatigue ' +
            'que vous ressentez devient trop difficile mais vous devrez tout de meme terminer l\'etude en une seule ' +
            'periode.</p>' +

            '<h3>Participation volontaire et droit de retrait</h3>' +
            '<p>Vous etes libre de participer ou non a cette etude. Le simple retour du questionnaire rempli sera ' +
            'considere comme l\'expression implicite de votre consentement a participer au projet. Si vous desirez ' +
            'vous retirer de l\'etude une fois le questionnaire soumis, veuillez communiquer avec le laboratoire par ' +
            'courriel au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Nous pourrons retirer vos ' +
            'resultats sans prejudice, en gardant votre compensation et sans avoir a justifier votre decision.</p>' +

            '<h3>Confidentialite et gestion des donnees</h3>' +
            '<p>Les donnees recueillies pendant cette etude sont entierement confidentielles et ne pourront en aucun ' +
            'cas mener a votre identification. Votre confidentialite sera assuree par l\'attribution d\'un code ' +
            'numerique qui ne figure pas au present formulaire a toutes les donnees de recherche collectees. ' +
            'Les donnees ne seront accessibles qu\'aux membres de l\'equipe de recherche, chacun d\'eux ayant signe ' +
            'un engagement a la confidentialite.</p>' +
            '<p>Les donnees seront conservees par l\'equipe de recherche pour utilisation ulterieure sous forme codee ' +
            'de maniere irreversible dans une base de donnees anonyme, c\'est-a-dire a la suite de la destruction du ' +
            'materiel de recherche (liste de nom des personnes participantes et tout document permettant de les ' +
            'identifier), jusqu\'au plus tard en <strong>decembre 2035</strong>. Les resultats de la recherche, qui ' +
            'pourront etre diffuses sous forme d\'article scientifique, de rapport de recherche, de presentation a un ' +
            'congres scientifique et/ou d\'une these doctorale, ne permettront pas d\'identifier les personnes ' +
            'participantes.</p>' +

            '<h3>Renseignements supplementaires</h3>' +
            '<p>Si vous avez des questions sur la recherche ou sur les implications de votre participation, veuillez ' +
            'communiquer avec le laboratoire par courriel au ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Plaintes ou critiques</h3>' +
            '<p>Toute plainte ou critique sur cette etude pourra etre adressee au Bureau de l\'Ombudsman de ' +
            'l\'Universite Laval :</p>' +
            '<p style="font-size:0.9em; color:#64748b; line-height:1.8;">' +
            'Pavillon Alphonse-Desjardins, bureau 3320<br>' +
            '2325, rue de l\'Universite<br>' +
            'Universite Laval<br>' +
            'Quebec (Quebec) G1V 0A6<br>' +
            'Renseignements - Secretariat : 1 418 656-3081<br>' +
            'Ligne sans frais : 1 866 323-2271<br>' +
            'Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>' +

            '</div>' +


            '<div class="consent-checks">' +
            '<label class="consent-label">' +
            '<input type="checkbox" id="consent1">' +
            '<span>J\'ai lu et compris les informations ci-dessus et je souhaite participer a l\'etude. ' +
            'Je confirme etre age(e) de 18 ans ou plus.</span>' +
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

            window.postMessage({ type: 'START_TRACKING', participantId: state.participantId, sessionId: state.sessionId }, '*');

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
                '<p>Nous comprenons votre decision. Vous pouvez fermer cette page.</p>' +
                '<p style="color:#94a3b8;margin-top:20px;">Si vous changez d\'avis, vous pouvez ' +
                'relancer l\'etude depuis l\'extension Chrome.</p>' +
                '</div>';
        });
    }

    // =========================================================
    // 3. DEMOGRAPHICS (email, age, niveau d'etudes)
    // =========================================================
    function renderDemographics() {
        app.innerHTML =
            '<h2>Informations personnelles</h2>' +
            '<p>Ces informations sont anonymisees et utilisees uniquement a des fins de recherche.</p>' +

            '<div class="form-group">' +
            '<label for="email">Adresse courriel (celle utilisee pour l\'inscription a l\'etude)</label>' +
            '<input type="email" id="email" placeholder="votre.email@exemple.com" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="age">Age</label>' +
            '<input type="number" id="age" min="18" max="99" placeholder="Ex: 25" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="niveau_etudes">Niveau d\'etudes</label>' +
            '<select id="niveau_etudes" required>' +
            '<option value="">-- Selectionnez --</option>' +
            '<option value="secondaire">Secondaire (lycee)</option>' +
            '<option value="cegep">Cegep / DEC</option>' +
            '<option value="baccalaureat">Baccalaureat universitaire</option>' +
            '<option value="maitrise">Maitrise</option>' +
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
            '<p>Vous allez repondre a <strong>' + state.researchQuestions.length + ' questions de recherche</strong>.</p>' +
            '<p>Pour chaque question :</p>' +
            '<ol class="instructions-list">' +
            '<li>Lisez attentivement la question affichee.</li>' +
            '<li><strong>Naviguez librement sur Internet</strong> dans d\'autres onglets pour trouver la reponse.</li>' +
            '<li>Revenez sur cet onglet et redigez votre reponse.</li>' +
            '<li>Evaluez vos connaissances et votre effort.</li>' +
            '</ol>' +
            '<p>Un <strong>chronometre</strong> sera affiche en haut a droite. ' +
            'Essayez de repondre en <strong>moins de 10 minutes</strong> par question.</p>' +
            '<p style="margin-top:20px;"><strong>Repondez le plus precisement possible.</strong></p>' +
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
            'Vous pouvez ouvrir d\'autres onglets pour chercher la reponse sur Internet.' +
            '</p>' +

            '<textarea id="answerText" placeholder="Redigez votre reponse ici..."></textarea>' +

            '<button class="btn btn-primary" id="btnSubmitAnswer" disabled>Valider ma reponse</button>' +
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
            '<h2>Auto-evaluation</h2>' +
            '<p>Concernant la question que vous venez de traiter :</p>' +
            '<div class="question-box">' +
            '<p style="font-size:0.95em;">' + q.text + '</p>' +
            '</div>' +

            '<div class="slider-group">' +
            '<label class="slider-label">Avant de faire votre recherche, comment evalueriez-vous ' +
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
            'deploye pour rechercher et formuler votre reponse ?</label>' +
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
            '<h1>Test de memoire</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">' +
            'Vous allez maintenant repondre a <strong>' + state.memoryQuestions.length +
            ' questions a choix multiples</strong> portant sur les informations que vous avez consultees.' +
            '</p>' +
            '<p>Repondez <strong>de memoire</strong>, sans retourner sur Internet.</p>' +
            '<p style="color:#64748b;">Il n\'y a pas de chronometre pour cette partie.</p>' +
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
            '<h2>Memoire ' + (idx + 1) + ' / ' + total + '</h2>' +
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
            '<h1 style="text-align:center;">Formulaire d\'information et de consentement post-experimental</h1>' +
            '<p style="text-align:center;color:#64748b;">Validation de questions de connaissances generales pour l\'etude des processus de recherche d\'information sur le Web</p>' +

            '<div class="consent-box">' +

            '<h3>Introduction</h3>' +
            '<p>Suite a la divulgation de la duperie a laquelle vous avez ete expose(e), nous vous ' +
            'fournissons un addendum post-experimental au formulaire d\'information et de consentement ' +
            'que vous avez signe avant le debut de l\'experience. Ce document explique les elements qui ' +
            'ont ete dissimules dans le formulaire original et reitere les informations liees a votre ' +
            'consentement. Vous etes invite(e) a contacter l\'equipe du laboratoire si vous avez des ' +
            'questions que vous jugez utiles.</p>' +

            '<h3>Nature de l\'etude</h3>' +
            '<p>Initialement, nous avons indique que le but de cette recherche etait de mieux comprendre ' +
            'comment les individus interagissent avec les technologies de l\'information a des fins de ' +
            'recherche d\'information, plus specifiquement les technologies web. Les veritables objectifs ' +
            'de l\'etude sont de mieux comprendre comment les <strong>strategies de recherche sur le web ' +
            'peuvent affecter la memorisation du contenu</strong> rencontre dans un contexte de recherche ' +
            'd\'information.</p>' +

            '<h3>Participation volontaire et droit de retrait</h3>' +
            '<p>Vous etes libre de maintenir ou de retirer votre consentement suite a la divulgation de ' +
            'cette information. Vous pouvez mettre fin a votre participation sans prejudice, conserver ' +
            'votre compensation, et sans avoir a justifier votre decision. Toutes les informations ' +
            'personnelles vous concernant ainsi que vos reponses seront alors detruites.</p>' +
            '<p>Veuillez selectionner l\'option qui reflete le mieux votre decision suite a la divulgation ' +
            'de cette duperie.</p>' +

            '<h3>Informations supplementaires</h3>' +
            '<p>Pour toute question, veuillez contacter le laboratoire a ' +
            '<a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>' +

            '<h3>Plaintes ou critiques</h3>' +
            '<p>Les plaintes peuvent etre adressees au Bureau de l\'ombudsman de l\'Universite Laval :</p>' +
            '<p style="font-size:0.9em; color:#64748b; line-height:1.8;">' +
            'Pavillon Alphonse-Desjardins, bureau 3320<br>' +
            '2325, rue de l\'Universite<br>' +
            'Universite Laval<br>' +
            'Quebec (Quebec) G1V 0A6<br>' +
            'Renseignements - Secretariat : 1 418 656-3081<br>' +
            'Ligne sans frais : 1 866 323-2271<br>' +
            'Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>' +

            '</div>' +

            '<div class="consent-checks">' +
            '<label class="consent-label">' +
            '<input type="radio" name="deceptionChoice" value="maintain">' +
            '<span>Je souhaite <strong>maintenir</strong> ma participation a l\'etude.</span>' +
            '</label>' +
            '<label class="consent-label">' +
            '<input type="radio" name="deceptionChoice" value="withdraw">' +
            '<span>Je souhaite <strong>mettre fin</strong> a ma participation a l\'etude.</span>' +
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
                    '<p>Nous comprenons votre decision. Vos donnees seront detruites ' +
                    'conformement a notre politique de confidentialite.</p>' +
                    '<p style="color:#64748b; margin-top:16px;">Vous pouvez desinstaller l\'extension Chrome :</p>' +
                    '<p style="font-size:0.9em; color:#475569;">Clic droit sur l\'icone de l\'extension > ' +
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
            'Vos reponses ont ete enregistrees avec succes.' +
            '</p>' +
            '<p style="color:#64748b;">' +
            'Score memoire : ' + correctMemory + ' / ' + totalMemory +
            '</p>' +

            '<div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px;">' +
            '<h3 style="margin:0 0 12px; font-size:16px; color:#dc2626;">Derniere etape : desinstaller l\'extension</h3>' +
            '<p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:16px;">' +
            'L\'etude est terminee. Pour desinstaller l\'extension :</p>' +

            '<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Faites un <strong>clic droit</strong> sur l\'icone de l\'extension en haut a droite de Chrome.</p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong style="color:#ef4444;">"Supprimer de Chrome"</strong> puis confirmez.</p>' +
            '</div>' +

            '</div>' +

            '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">' +

            '<h4 style="margin:0 0 12px; font-size:14px; color:#475569;">Methode alternative</h4>' +
            '<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Copiez et collez cette adresse dans votre barre d\'adresse : ' +
            '<span id="copyUrl" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;font-family:monospace;font-size:13px;color:#3b82f6;cursor:pointer;" title="Cliquer pour copier">chrome://extensions</span></p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Trouvez <strong>"Etude Navigation Web - Universite Laval"</strong> dans la liste.</p>' +
            '</div>' +

            '<div style="display:flex; gap:10px; align-items:flex-start;">' +
            '<div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">3</div>' +
            '<p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong>"Supprimer"</strong> puis confirmez.</p>' +
            '</div>' +

            '</div>' +

            '</div>' +

            '<div style="margin-top:20px; padding:16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;">' +
            '<p style="font-size:13px; color:#0369a1; margin:0; line-height:1.5;">' +
            '<strong>Confidentialite :</strong> Vos donnees sont anonymisees et chiffrees. ' +
            'Aucune donnee personnelle identifiable n\'est conservee. ' +
            'Pour toute question : <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a></p>' +
            '</div>' +

            '</div>';

        // Copier chrome://extensions
        var copyEl = document.getElementById('copyUrl');
        if (copyEl) {
            copyEl.addEventListener('click', function () {
                navigator.clipboard.writeText('chrome://extensions').then(function () {
                    copyEl.textContent = 'Copie !';
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
            sessionId: state.sessionId,
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
