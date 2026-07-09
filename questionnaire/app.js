// questionnaire/app.js (Modifié)

(function () {
    'use strict';

    const API_BASE = window.location.origin + '/api/questionnaire';

    let state = {
        phase: 'language',
        participantId: null,
        token: null,
        language: 'fr',
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

    function t(key, variables) {
        if (!state.language) return ""; 
        if (typeof i18n === 'undefined' || !i18n[state.language]) return key;
        let phrase = i18n[state.language][key] || key;
        if (variables && typeof phrase === 'string') {
            for (let prop in variables) {
                phrase = phrase.replace('{' + prop + '}', variables[prop]);
            }
        }
        return phrase;
    }

    async function fetchAndSyncToken() {
        if (state.token) {
            window.postMessage({ type: 'SET_TOKEN', token: state.token }, window.location.origin);
            window.postMessage({ 
                type: 'EXCHANGE_SESSION', 
                participantId: state.participantId, 
                token: state.token 
            }, window.location.origin);
            return;
        }
    }

    async function init() {
        // 1. Tenter de charger la progression existante
        const saved = localStorage.getItem('questionnaire_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.participantId && parsed.token) {
                    state = parsed; // Restaure l'état, y compris le participantId et le token
                }
            } catch (e) {
                console.error("Échec de lecture du stockage local", e);
            }
        }

        // 2. Si AUCUNE session n'existe en mémoire, on demande au serveur d'en créer une
        if (!state.participantId || !state.token) {
            try {
                const response = await fetch(API_BASE + '/init-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error('Échec init-session');
                const data = await response.json();
                if (data.participantId && data.token) {
                    state.participantId = data.participantId;
                    state.token = data.token;
                    saveProgress(); // Sauvegarde immédiate dans localStorage
                }
            } catch (err) {
                console.error("Erreur d'initialisation de session :", err);
                app.innerHTML = '<div style="text-align:center; padding:60px 0;"><h1>Erreur système</h1><p>Impossible de se connecter au serveur de recherche. Veuillez rafraîchir la page.</p></div>';
                return;
            }
        }

        // 3. Synchronisation avec l'extension
        await fetchAndSyncToken();
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
            case 'tutorial':          renderTutorial(); break; // Nouvelle étape
            case 'demographics':      renderDemographics(); break;
            case 'instructions':      renderInstructions(); break;
            case 'research_question': renderResearchQuestion(); break;
            case 'self_assessment':   renderSelfAssessment(); break;
            case 'internet_skills':   renderInternetSkills(); break;
            case 'memory_intro':      renderMemoryIntro(); break;
            case 'memory_question':   renderMemoryQuestion(); break;
            case 'deception_consent': renderDeceptionConsent(); break;
            case 'end':               renderEnd(); break;
            case 'terminated':        renderTermination(); break;
        }
        updateProgress();
    }

    function getSlugForPhase(phase) {
        switch (phase) {
            case 'language': return 'langue';
            case 'consent': return 'consentement';
            case 'tutorial': return 'installation';
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

    function goTo(phase, reason) {
        if (state.cleanupTutorial) {
            try { state.cleanupTutorial(); } catch (e) {}
            state.cleanupTutorial = null;
        }
        state.phase = phase;
        if (reason) {
            state.terminationReason = reason;
        }
        saveProgress();
        updateUrl();
        renderPhase();
        window.scrollTo(0, 0);
    }

    
    function renderTermination() {
        hideTimer();
        
        var reason = state.terminationReason || 'inactivity';
        var reasonText = "";
        window.postMessage({ type: 'STUDY_TERMINATED', reason: reason  }, '*');

        if (reason === 'consent_refused') reasonText = t('termination_raison_consent_refuse');
        else if (reason === 'post_consent_refused') reasonText = t('termination_raison_deception_refuse');
        else if (reason === 'inactivity') reasonText = t('termination_raison_inactivite');
        else if (reason === 'max_time') reasonText = t('termination_raison_max_temps');
        else if (reason === 'stopped_by_user') reasonText = t('termination_raison_stopped_by_user');

        app.innerHTML =
            '<div class="end-screen">' +
            '<h1 style="color:#dc2626;">' + t('termination_titre') + '</h1>' +
            '<p style="font-size:1.1em; margin:20px 0; font-weight:600; color:#475569;">' + reasonText + '</p>' +
            '<p style="margin-bottom:24px; color:#64748b;">' + t('termination_instructions') + '</p>' +
            t('fin_texte') + // Contient le bloc complet avec le bouton intégré
            '</div>';

        // Liaison de l'écouteur d'événement sur le bouton injecté dans le bloc i18n
        const btn = document.getElementById('btnUninstallFromPage');
        if (btn) {
            btn.addEventListener('click', function() {
                window.postMessage({ type: 'REQUEST_UNINSTALL' }, window.location.origin);
            });
        }

        // Nettoyage complet et immédiat des caches de la page
        localStorage.removeItem('questionnaire_progress');
        localStorage.removeItem('study_global_start');
        sessionStorage.clear();
    }


    function updateProgress() {
        var totalResearch = state.researchQuestions.length || 3;
        var totalMemory = state.memoryQuestions.length || 6;
        var hiddenPhases = ['language', 'consent', 'tutorial', 'terminated']; 
        var total = (totalResearch * 2) + 1 + 1 + totalMemory + 1 + 1;
        var current = 0;
        
        if (hiddenPhases.indexOf(state.phase) !== -1) {
            progressBar.classList.add('hidden');
            return;
        }

        if (state.phase === 'demographics') current = 0;
        else if (state.phase === 'instructions') current = 1;
        else if (state.phase === 'research_question') current = 2 + (state.currentResearchIndex * 2);
        else if (state.phase === 'self_assessment') current = 2 + (state.currentResearchIndex * 2) + 1;
        else if (state.phase === 'internet_skills') current = (totalResearch * 2) + 2;
        else if (state.phase === 'memory_intro') current = (totalResearch * 2) + 3;
        else if (state.phase === 'memory_question') current = (totalResearch * 2) + 4 + state.currentMemoryIndex;
        else if (state.phase === 'deception_consent') current = total - 1;
        else if (state.phase === 'end') current = total;

        var pct = Math.round((current / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
        progressBar.classList.remove('hidden');
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
                    alert(t('alert_10_min_warning'));
                }
                if (elapsedSeconds >= 720) {
                    clearInterval(timerInterval);
                    alert(t('alert_temps_ecoule_recherche'));
                    forceSubmitResearch();
                }
            } 
            else if (currentTimerPhase === 'memory') {
                if (elapsedSeconds < 45) timerEl.className = 'timer green';
                else timerEl.className = 'timer red blink';

                if (elapsedSeconds >= 60) {
                    clearInterval(timerInterval);
                    alert(t('alert_temps_ecoule_memoire'));
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
            let timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(-1);
            }, 1000);

            const handler = (e) => {
                if (e.data && e.data.type === 'NAV_COUNT_RESULT') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', handler);
                    resolve(e.data.count);
                }
            };
            window.addEventListener('message', handler);
            window.postMessage({ type: 'GET_NAV_COUNT' }, '*');
        });
    }

    function renderLanguage() {
        app.innerHTML =
            '<h1 style="text-align:center;">' + t('langue_titre') + '</h1>' +
            '<div class="form-group" style="max-width:400px; margin:30px auto;">' +
            '<select id="languageSelect" required>' +
                '<option value="">' + t('langue_select_default') + '</option>' +
                '<option value="fr">Français</option>' +
                '<option value="en">English</option>' +
            '</select>' +
            '</div>' +
            '<div style="text-align:center;"><button class="btn btn-primary" id="btnLanguage" disabled>' + t('btn_continuer') + '</button></div>';

        var select = document.getElementById('languageSelect');
        var btn = document.getElementById('btnLanguage');
        select.addEventListener('change', function () { btn.disabled = !select.value; });
        btn.addEventListener('click', function () { 
            state.language = select.value; 
            window.postMessage({ type: 'SET_LANGUAGE', language: select.value }, window.location.origin);
            saveProgress(); 
            goTo('consent'); 
        });
    }

    function renderConsent() {
        app.innerHTML =
            '<h1 style="text-align:center;">' + t('consentement_titre') + '</h1>' +
            '<h2 style="text-align:center;">' + t('consentement_sous_titre') + '</h2>' +
            '<p style="text-align:center;color:#64748b;">' + t('consentement_intro') + '</p>' +
            '<div class="consent-box">' + t('consentement_texte') + '</div>' +
            '<div class="consent-checks"><label class="consent-label"><input type="checkbox" id="consent1"><span>' + t('consentement_checkbox') + '</span></label></div>' +
            '<button class="btn btn-primary" id="btnConsent" disabled>' + t('btn_consentement_accepter') + '</button>' +
            '<p style="text-align:center;margin-top:12px;"><a href="#" id="btnRefuse" style="color:#94a3b8;font-size:13px;">' + t('btn_consentement_refuser') + '</a></p>';

        var cb = document.getElementById('consent1');
        var btn = document.getElementById('btnConsent');
        
        cb.addEventListener('change', function () { 
            btn.disabled = !cb.checked; 
        });

        btn.addEventListener('click', function () {
            state.consentGiven = true;
            localStorage.setItem('study_global_start', Date.now().toString());
            sendToServer('consent', null, null, { consent: true, questionLabel: "Consentement Initial" });
            goTo('tutorial');
        });

        document.getElementById('btnRefuse').addEventListener('click', function (e) {
            e.preventDefault();
            sendToServer('consent', null, null, { consent: false, questionLabel: "Consentement Initial" });
            goTo('terminated', 'consent_refused');
        });
    }

    // NOUVEL ÉCRAN : Tutoriel d'installation et détection
    function renderTutorial() {
        app.innerHTML = `
            <div class="tutorial-container">
                <h2>${t('tuto_titre')}</h2>
                <p style="color: #64748b; margin-bottom: 24px;">${t('tuto_description')}</p>
                
                <div id="extensionDetectionBox" class="detection-box waiting">
                    <span class="detection-icon">⏳</span>
                    <span class="detection-text">${t('tuto_statut_attente')}</span>
                </div>

                <div class="tutorial-steps">
                    <div class="tuto-step">
                        <h3>1. ${t('tuto_etape0_titre')}</h3>
                        <p>${t('tuto_etape0_texte')}</p>
                        <a href="https://chromewebstore.google.com/detail/%C3%A9tude-navigation-web-%E2%80%94-un/pmoefbopcbaojmfobgkgbdbllpihhfec" target="_blank" class="btn btn-success" style="margin-top:10px; display:inline-block;">
                            📥 ${t('tuto_bouton_telecharger')}
                        </a>
                    </div>


                    <div class="tuto-step">
                        <h3>3. ${t('tuto_etape1_titre')}</h3>
                        <p>${t('tuto_etape1_texte')}</p>
                        <img src="/images/fr_install_0.png"
                            alt="step 2"
                            style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"
                            loading="lazy">
                    </div>

                    <div class="tuto-step">
                        <h3>2. ${t('tuto_etape1_5_titre')}</h3>
                        <p>${t('tuto_etape1_5_texte')}</p>
                        <img src="/images/fr_install_0.5.png"
                            alt="step 3 "
                            style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"
                            loading="lazy">
                    </div>


                    <div class="tuto-step">
                        <h3>4. ${t('tuto_etape2_titre')}</h3>
                        <p>${t('tuto_etape2_texte')}</p>
                        <img src="/images/fr_install_1.png"
                            alt="step 4"
                            style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"
                            loading="lazy">
                    </div>

                    <div class="tuto-step">
                        <h3>5. ${t('tuto_etape3_titre')}</h3>
                        <p>${t('tuto_etape3_texte')}</p>
                        <img src="/images/fr_install_2.png"
                            alt="step 5"
                            style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"
                            loading="lazy">
                    </div>

                    <div class="tuto-step">
                        <h3>6. ${t('tuto_etape4_titre')}</h3>
                        <p>${t('tuto_etape4_texte')}</p>
                        <img src="/images/fr_install_3.png"
                            alt="step 6"
                            style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"
                            loading="lazy">
                    </div>
                </div>
            </div>
        `;

        // Boucle de détection et synchronisation immédiate et sécurisée du Token / ID / Langue
        const detectionInterval = setInterval(() => {
            window.postMessage({ type: "PING_EXTENSION" }, window.location.origin);
            
            if (state.participantId && state.token) {
                window.postMessage({ 
                    type: 'EXCHANGE_SESSION', 
                    participantId: state.participantId, 
                    token: state.token,
                    language: state.language
                }, window.location.origin);
            }
        }, 1000);

        const pongHandler = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data && event.data.type === "PONG_EXTENSION") {
                clearInterval(detectionInterval);
                const box = document.getElementById("extensionDetectionBox");
                if (box) {
                    box.className = "detection-box success";
                    box.innerHTML = `
                        <span class="detection-icon">✅</span>
                        <span class="detection-text"><strong>${t('tuto_statut_detecte')}</strong><br>${t('tuto_statut_detecte_detail')}</span>
                    `;
                }

                // Échange direct et instantané des identifiants et de la langue au moment de la détection
                if (state.participantId && state.token) {
                    window.postMessage({ 
                        type: 'EXCHANGE_SESSION', 
                        participantId: state.participantId, 
                        token: state.token,
                        language: state.language
                    }, window.location.origin);
                }
            }
        };
        window.addEventListener("message", pongHandler);

        state.cleanupTutorial = () => {
            clearInterval(detectionInterval);
            window.removeEventListener("message", pongHandler);
        };
    }

    function renderDemographics() {
        app.innerHTML =
            '<h2>' + t('demo_titre') + '</h2>' +
            '<p style="color:#64748b; font-size:0.9em; margin-bottom:20px;">' + t('demo_description') + '</p>' +
            '<div class="form-group"><label>' + t('demo_email') + '</label><input type="email" id="email" required></div>' +
            '<div class="form-group"><label>' + t('demo_age') + '</label><input type="number" id="age" min="18" max="99" required></div>' +
            '<div class="form-group"><label>' + t('demo_maitrise_langue') + '</label>' +
                '<select id="lang_prof" required>' +
                    '<option value="">' + t('demo_select_default') + '</option>' +
                    '<option value="debutant">' + t('demo_lang_debutant') + '</option>' +
                    '<option value="intermediaire">' + t('demo_lang_intermediaire') + '</option>' +
                    '<option value="expert">' + t('demo_lang_expert') + '</option>' +
                    '<option value="natif">' + t('demo_lang_natif') + '</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group"><label>' + t('demo_scolarite') + '</label>' +
                '<select id="niveau" required>' +
                    '<option value="">' + t('demo_select_default') + '</option>' +
                    '<option value="secondaire">' + t('demo_scol_secondaire') + '</option>' +
                    '<option value="cegep">' + t('demo_scol_cegep') + '</option>' +
                    '<option value="baccalaureat">' + t('demo_scol_bac') + '</option>' +
                    '<option value="maitrise">' + t('demo_scol_maitrise') + '</option>' +
                    '<option value="doctorat">' + t('demo_scol_doctorat') + '</option>' +
                    '<option value="autre">' + t('demo_scol_autre') + '</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group"><label>' + t('demo_compensation') + '</label>' +
                '<select id="payment" required>' +
                    '<option value="">' + t('demo_select_default') + '</option>' +
                    '<option value="interac">' + t('demo_pay_interac') + '</option>' +
                    '<option value="pickup">' + t('demo_pay_pickup') + '</option>' +
                    '<option value="cheque">' + t('demo_pay_cheque') + '</option>' +
                '</select>' +
            '</div>' +
            '<button class="btn btn-primary" id="btnDemo">' + t('btn_suivant') + '</button><div id="demoErr" style="color:red; display:none;"></div>';

        document.getElementById('btnDemo').addEventListener('click', async function () {
            var email = document.getElementById('email').value.trim();
            var age = document.getElementById('age').value;
            var lang = document.getElementById('lang_prof').value;
            var niveau = document.getElementById('niveau').value;
            var payment = document.getElementById('payment').value;

            if (!email || !age || !lang || !niveau || !payment) {
                document.getElementById('demoErr').textContent = t('demo_err_champs');
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

    function renderInstructions() {
        app.innerHTML =
            '<h2>' + t('instr_titre') + '</h2>' +
            '<p>' + t('instr_texte', { count: state.researchQuestions.length }) + '</p>' +
            '<ul class="instructions-list">' +
                '<li>' + t('instr_item_1') + '</li>' +
                '<li>' + t('instr_item_2') + '</li>' +
                '<li>' + t('instr_item_3') + '</li>' +
                '<li>' + t('instr_item_4') + '</li>' +
                '<li>' + t('instr_item_5') + '</li>' +
            '</ul>' +
            '<button class="btn btn-success" id="btnStartQuestions">' + t('btn_commencer') + '</button>';

        document.getElementById('btnStartQuestions').addEventListener('click', function () {
            state.currentResearchIndex = 0;
            goTo('research_question');
        });
    }

    function verifyResearchDone(startTime) {
        return new Promise(resolve => {
            let timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(true);
            }, 1000);

            const handler = (e) => {
                if (e.data && e.data.type === 'RESEARCH_VERIFY_RESULT') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', handler);
                    resolve(e.data.activityCount > 0);
                }
            };
            window.addEventListener('message', handler);
            window.postMessage({ type: "VERIFY_RESEARCH", startTime: startTime }, "*");
        });
    }

    function renderResearchQuestion() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];
        var qText = q.text[state.language] || q.text['fr'];

        app.innerHTML =
            '<h2>' + t('recherche_titre', { index: idx + 1, total: state.researchQuestions.length }) + '</h2>' +
            '<div class="question-box"><p>' + qText + '</p></div>' +
            '<p style="color:#64748b;">' + t('recherche_instructions') + '</p>' +
            '<textarea id="answerText" placeholder="' + t('recherche_placeholder') + '"></textarea>' +
            '<div id="wordCount" class="word-counter red">' + t('recherche_mots', { count: 0 }) + '</div>' +
            '<button class="btn btn-primary" id="btnSubmitAnswer" disabled>' + t('btn_valider_reponse') + '</button>';

        var textarea = document.getElementById('answerText');
        var btn = document.getElementById('btnSubmitAnswer');
        var wc = document.getElementById('wordCount');

        var existing = state.answers[idx];
        if (existing) textarea.value = existing.data.answer;

        textarea.addEventListener('input', function () {
            var count = countWords(textarea.value);
            wc.textContent = t('recherche_mots', { count: count });
            if (count < 75) { 
                wc.className = "word-counter red"; 
                btn.disabled = (count === 0);
            } else if (count >= 75 && count <= 100) { 
                wc.className = "word-counter green"; 
                btn.disabled = false; 
            } else { 
                wc.className = "word-counter red";
                btn.disabled = false;
            }
        });

        btn.addEventListener('click', async function () {
            let hasResearched = await verifyResearchDone(state.questionStartTime);
            if (!hasResearched && !existing) {
                var proceed = confirm(t('alert_pas_de_recherche'));
                if (!proceed) return;
            } 
            processSubmitResearch(q, textarea.value); 
        });
        
        startTimer('research');
        textarea.dispatchEvent(new Event('input'));
    }

    function forceSubmitResearch() {
        var q = state.researchQuestions[state.currentResearchIndex];
        var text = document.getElementById('answerText').value || "[Forced Timeout / Temps écoulé]";
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

    function renderSelfAssessment() {
        var idx = state.currentResearchIndex;
        var q = state.researchQuestions[idx];
        var qText = q.text[state.language] || q.text['fr'];

        var html = '<h2>' + t('eval_titre') + '</h2><p>' + t('eval_concerne') + ' <em>' + qText + '</em></p>';

        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_connaissance_titre') + '</h3>' +
            '<div class="slider-group"><label class="slider-label">' + t('q_connaissance_item') + '</label>' +
            '<div class="slider-container"><input type="range" id="k_base" class="slider" min="0" max="100" value="0"><div class="slider-value" id="vk_base">0</div></div>' +
            '<div class="slider-labels"><span>0</span><span>100</span></div></div>';

        var confItems = t('q_confiance_items');
        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_confiance_titre') + '</h3>' +
            '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_confiance_legende') + '</p>' +
            '<table class="likert-table"><tr><th>Énoncé / Statement</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
        confItems.forEach(function(item, i) {
            html += '<tr><td>' + item + '</td>';
            for(var v=1; v<=5; v++) html += '<td><input type="radio" name="conf' + (i+1) + '" value="' + v + '"></td>';
            html += '</tr>';
        });
        html += '</table>';

        var nasaItems = t('q_nasa_items');
        html += '<hr style="margin:30px 0; border:1px solid #e2e8f0;">' +
            '<h3>' + t('q_nasa_titre') + '</h3>' +
            '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_nasa_legende') + '</p>';
        nasaItems.forEach(function(item) {
            html += '<div class="slider-group"><label style="margin-bottom:4px;"><strong>' + item.titre + ' :</strong> ' + item.desc + '</label>' +
                '<div class="slider-container"><input type="range" id="' + item.id + '" class="slider" min="1" max="100" value="1"><div class="slider-value" id="v' + item.id + '">1</div></div>' +
                '<div class="slider-labels"><span>1</span><span>100</span></div></div>';
        });

        html += '<button class="btn btn-primary" id="btnSubmitScale" style="margin-top:30px;">' + t('btn_valider_eval') + '</button><div id="evalErr" style="color:red; display:none; margin-top:10px;">' + t('eval_err_radio') + '</div>';
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
            
            nasaItems.forEach(function(item) { 
                payload[item.id] = parseInt(document.getElementById(item.id).value); 
            });

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

    function renderInternetSkills() {
        var skills = t('q_internet_items');
        var html = '<h2>' + t('q_internet_titre') + '</h2>';
        html += '<p style="font-size:0.9em; color:#64748b; margin-bottom:10px;">' + t('q_internet_legende') + '</p>';
        html += '<table class="likert-table"><tr><th>Énoncé / Statement</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
        
        skills.forEach(function(item, i) {
            html += '<tr><td>' + item + '</td>';
            for(var v=1; v<=5; v++) html += '<td><input type="radio" name="iskill_' + i + '" value="' + v + '"></td>';
            html += '</tr>';
        });
        
        html += '</table><button class="btn btn-primary" id="btnSubmitSkills">' + t('btn_suivant') + '</button><div id="skillsErr" style="color:red; display:none; margin-top:10px;">' + t('eval_err_radio') + '</div>';
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

            await sendToServer('internet_skills', null, null, answers);
            goTo('memory_intro');
        });
    }

    function renderMemoryIntro() {
        window.postMessage({ type: 'SET_PHASE', phase: 'memory' }, '*');
        app.innerHTML =
            '<div style="text-align:center;">' +
            '<h1>' + t('mem_intro_titre') + '</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">' + t('mem_intro_desc', { count: state.memoryQuestions.length }) + '</p>' +
            '<p style="color:#dc2626;">' + t('mem_intro_regle') + '</p>' +
            '<p>' + t('mem_intro_limite') + '</p>' +
            '<button class="btn btn-primary" id="btnStartMemory">' + t('btn_commencer_memoire') + '</button>' +
            '</div>';

        document.getElementById('btnStartMemory').addEventListener('click', function () {
            state.currentMemoryIndex = 0;
            goTo('memory_question');
        });
    }

    function renderMemoryQuestion() {
        window.postMessage({ type: 'RESET_MEMORY_BYPASS' }, '*');

        var idx = state.currentMemoryIndex;
        var mq = state.memoryQuestions[idx];
        var mqText = mq.text[state.language] || mq.text['fr'];

        app.innerHTML =
            '<h2>' + t('mem_titre', { index: idx + 1, total: state.memoryQuestions.length }) + '</h2>' +
            '<div class="question-box"><p>' + mqText + '</p></div>' +
            '<textarea id="memAnswerText" placeholder="' + t('mem_placeholder') + '" style="min-height:100px;"></textarea>' +
            '<button class="btn btn-primary" id="btnSubmitMemory">' + t('btn_valider_memoire') + '</button>';

        document.getElementById('btnSubmitMemory').addEventListener('click', function () {
            processSubmitMemory(mq, document.getElementById('memAnswerText').value.trim());
        });

        startTimer('memory');
    }

    function forceSubmitMemory() {
        var mq = state.memoryQuestions[state.currentMemoryIndex];
        var text = document.getElementById('memAnswerText').value || "[Forced Timeout / Temps écoulé]";
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

    function renderDeceptionConsent() {
        window.postMessage({ type: 'SET_PHASE', phase: 'research' }, '*');
        app.innerHTML =
            '<h1 style="text-align:center;">' + t('debriefing_titre') + '</h1>' +
            '<div class="consent-box" style="font-size:0.95em;">' + t('debriefing_texte') + '</div>' +
            '<div class="consent-checks">' +
            '<label class="consent-label"><input type="radio" name="deceptionChoice" value="maintain"><span>' + t('debriefing_choix_maintain') + '</span></label>' +
            '<label class="consent-label"><input type="radio" name="deceptionChoice" value="withdraw"><span>' + t('debriefing_choix_withdraw') + '</span></label>' +
            '</div>' +
            '<button class="btn btn-primary" id="btnDeceptionConsent" disabled>' + t('btn_confirmer_choix') + '</button>';

        var radios = document.querySelectorAll('input[name="deceptionChoice"]');
        var btn = document.getElementById('btnDeceptionConsent');

        radios.forEach(function (r) { 
            r.addEventListener('change', function () { 
                btn.disabled = false; 
            }); 
        });

        btn.addEventListener('click', function () {
            var selected = document.querySelector('input[name="deceptionChoice"]:checked').value;
            if (selected === 'maintain') {
                sendToServer('deception_consent', null, null, { consent: true, decision: 'maintain', questionLabel: "Consentement Post-Expérimental (Maintenu)" });
                goTo('end');
            } else {
                sendToServer('deception_consent', null, null, { consent: false, decision: 'withdraw', questionLabel: "Consentement Post-Expérimental (Retiré)" });
                goTo('terminated', 'post_consent_refused');
            }
        });
    }

    function renderEnd() {
        app.innerHTML =
            '<div class="end-screen">' +
            '<h1>' + t('fin_titre') + '</h1>' +
            '<p style="font-size:1.1em; margin:20px 0;">' + t('fin_soustitre') + '</p>' +
            t('fin_texte') + // Contient le bloc complet avec le bouton intégré
            '</div>';

        window.postMessage({ type: 'QUESTIONNAIRE_COMPLETED' }, '*');
        
        // Liaison de l'écouteur d'événement sur le bouton injecté dans le bloc i18n
        const btn = document.getElementById('btnUninstallFromPage');
        if (btn) {
            btn.addEventListener('click', function() {
                window.postMessage({ type: 'REQUEST_UNINSTALL' }, window.location.origin);
            });
        }
        
        // Nettoyage complet et immédiat des caches de la page
        localStorage.removeItem('questionnaire_progress');
        localStorage.removeItem('study_global_start');
        sessionStorage.clear();
        
        sendToServer('questionnaire_event', null, null, { event: 'questionnaire_completed' });
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    }

    async function sendToServer(type, questionId, difficulty, data) {
        var payload = { 
            participantId: state.participantId, 
            type: type, 
            questionId: questionId, 
            difficulty: difficulty, 
            data: data, 
            timestamp: new Date().toISOString() 
        };

        const headers = { 'Content-Type': 'application/json' };
        if (state.token) {
            headers['Authorization'] = 'Bearer ' + state.token;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            await fetch(API_BASE + '/reponse', { 
                method: 'POST', 
                headers: headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (err) {
            var fallback = JSON.parse(localStorage.getItem('questionnaire_fallback') || '[]');
            fallback.push(payload);
            localStorage.setItem('questionnaire_fallback', JSON.stringify(fallback));
        }
    }

    window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data) return;
        if (event.data.type === "EXTERNAL_TERMINATE") {
            goTo('terminated', event.data.reason || 'stopped_by_user');
        }
        // Transition automatique du tutoriel vers les instructions lors de l'activation
        if (event.data.type === "EXTERNAL_START") {
            goTo('demographics');
        }
    });

    init();
})();