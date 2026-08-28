// =========================================================
// VARIABLES GLOBALES
// =========================================================
let AUTH_TOKEN = '';
const BASE_URL = window.location.origin;
let researcherPrivateKey = null; // Stocke l'objet CryptoKey en mémoire vive

const TEXT_DELIMITER = '\n--- [EXTRAIT] ---\n';

// =========================================================
// ÉLÉMENTS DU DOM
// =========================================================
const usernameInput          = document.getElementById('usernameInput');
const passwordInput          = document.getElementById('passwordInput');
const connectBtn             = document.getElementById('connectBtn');
const logoutBtn              = document.getElementById('logoutBtn');
const downloadCompiledExcelBtn = document.getElementById('downloadCompiledExcelBtn');
const downloadSelectedExcelBtn = document.getElementById('downloadSelectedExcelBtn');
const downloadSelectedJsonBtn  = document.getElementById('downloadSelectedJsonBtn');
const refreshBtn             = document.getElementById('refreshBtn');
const selectAllCheckbox      = document.getElementById('selectAllCheckbox');
const statusBar              = document.getElementById('statusBar');
const mainContent            = document.getElementById('mainContent');
const sessionsTable          = document.getElementById('sessionsTable');
const loginSection           = document.getElementById('loginSection');
const loggedSection          = document.getElementById('loggedSection');
const loggedUser             = document.getElementById('loggedUser');
const privateKeyFile         = document.getElementById('private-key-file');
const keyStatus              = document.getElementById('key-status');

// =========================================================
// FORMATAGE HORODATAGE COMPLET (YYYY-MM-DD HH:mm:ss)
// =========================================================
function formatParticipantTime(ts, timezone) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';

        const pad = (n) => String(n).padStart(2, '0');

        if (timezone) {
            // Utiliser Intl.DateTimeFormat pour obtenir les parties dans le fuseau du participant
            const dtf = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const parts = dtf.formatToParts(d);
            const get = (type) => parts.find(p => p.type === type)?.value || '00';
            return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
        }

        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return '';
    }
}

// =========================================================
// MODULE CRYPTOGRAPHIQUE (Déchiffrement CSFLE)
// =========================================================
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function importPrivateKey(pem) {
    const cleanPem = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
        .replace(/-----END RSA PRIVATE KEY-----/, "")
        .replace(/\s/g, "");

    const derBuffer = base64ToArrayBuffer(cleanPem);

    return window.crypto.subtle.importKey(
        "pkcs8",
        derBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
    );
}

async function decryptField(encryptedString) {
    if (!encryptedString || !encryptedString.startsWith("ENC:")) {
        return encryptedString;
    }
    if (!researcherPrivateKey) {
        return "[🔒 Champ Chiffré - Chargez la clé]";
    }
    try {
        const parts = encryptedString.split(":");
        const encAesKeyBuffer = base64ToArrayBuffer(parts[1]);
        const ivBuffer = base64ToArrayBuffer(parts[2]);
        const ciphertextBuffer = base64ToArrayBuffer(parts[3]);

        const rawAesKey = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            researcherPrivateKey,
            encAesKeyBuffer
        );

        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            rawAesKey,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            aesKey,
            ciphertextBuffer
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
        console.error("Échec de déchiffrement :", err);
        return "[⚠️ Erreur Déchiffrement]";
    }
}

async function decryptParticipantData(data) {
    if (!researcherPrivateKey) return data;

    const events = data.events || [];
    for (const event of events) {
        if (event.url) event.url = await decryptField(event.url);
        if (event.parentUrl) event.parentUrl = await decryptField(event.parentUrl);
        if (event.texte) event.texte = await decryptField(event.texte);
    }
    return data;
}

// =========================================================
// ÉCOUTEURS ET INITIALISATION CLÉ PRIVÉE
// =========================================================
privateKeyFile.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const content = e.target.result;
        try {
            researcherPrivateKey = await importPrivateKey(content);
            sessionStorage.setItem('tracker_private_key_pem', content);
            keyStatus.textContent = "✅ Clé privée active - Données déchiffrées automatiquement";
            keyStatus.style.color = "#34d399";
        } catch (err) {
            console.error(err);
            keyStatus.textContent = "❌ Clé invalide (le format PKCS#8 est requis)";
            keyStatus.style.color = "#f87171";
            researcherPrivateKey = null;
        }
    };
    reader.readAsText(file);
});

const savedKeyPem = sessionStorage.getItem('tracker_private_key_pem');
if (savedKeyPem) {
    importPrivateKey(savedKeyPem).then(function(cryptoKey) {
        researcherPrivateKey = cryptoKey;
        keyStatus.textContent = "✅ Clé privée active - Données déchiffrées automatiquement";
        keyStatus.style.color = "#34d399";
    }).catch(function() {
        sessionStorage.removeItem('tracker_private_key_pem');
    });
}

// =========================================================
// AU CHARGEMENT : restaurer le token sauvegardé
// =========================================================
const savedToken = sessionStorage.getItem('tracker_admin_token');
const savedUser  = sessionStorage.getItem('tracker_admin_user');
if (savedToken) {
    AUTH_TOKEN = savedToken;
    showLoggedIn(savedUser);
    refreshData();
}

// =========================================================
// EVENT LISTENERS STANDARD
// =========================================================
connectBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
if (downloadCompiledExcelBtn) downloadCompiledExcelBtn.addEventListener('click', downloadCompiledExcel);
downloadSelectedExcelBtn.addEventListener('click', downloadSelectedExcel);
downloadSelectedJsonBtn.addEventListener('click', downloadSelectedJson);
refreshBtn.addEventListener('click', refreshData);

passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') login();
});

if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.participant-checkbox');
        checkboxes.forEach(function(cb) {
            cb.checked = selectAllCheckbox.checked;
        });
    });
}

// =========================================================
// LOGIN / LOGOUT
// =========================================================
async function login() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showStatus('Entrez votre identifiant et mot de passe', 'err');
        return;
    }

    try {
        showStatus('Connexion...', 'info');

        const response = await fetch(BASE_URL + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erreur || 'Échec de connexion');
        }

        AUTH_TOKEN = data.token;

        sessionStorage.setItem('tracker_admin_token', AUTH_TOKEN);
        sessionStorage.setItem('tracker_admin_user', username);
        passwordInput.value = '';

        showLoggedIn(username);
        showStatus('✅ Connecté ! Chargement des données...', 'ok');
        refreshData();

    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

function logout() {
    AUTH_TOKEN = '';
    sessionStorage.removeItem('tracker_admin_token');
    sessionStorage.removeItem('tracker_admin_user');
    sessionStorage.removeItem('tracker_private_key_pem');
    researcherPrivateKey = null;
    keyStatus.textContent = "Clé non chargée - Les données sensibles apparaîtront chiffrées";
    keyStatus.style.color = "#f87171";
    if (privateKeyFile) privateKeyFile.value = '';

    loginSection.style.display = 'flex';
    loggedSection.style.display = 'none';
    mainContent.style.display = 'none';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    showStatus('Déconnecté', 'info');
}

function showLoggedIn(username) {
    loginSection.style.display = 'none';
    loggedSection.style.display = 'flex';
    loggedUser.textContent = username;
    mainContent.style.display = 'block';
}

async function apiCall(path) {
    const response = await fetch(BASE_URL + '/api/collecte' + path, {
        headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error('Session expirée, reconnectez-vous');
        }
        const err = await response.json().catch(function() { return {}; });
        throw new Error(err.erreur || 'HTTP ' + response.status);
    }
    return response;
}

// =========================================================
// CHARGER LES DONNÉES DU TABLEAU
// =========================================================
async function refreshData() {
    try {
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        const response = await apiCall('/resume');
        const data = await response.json();

        document.getElementById('totalParticipants').textContent = data.totalParticipants || 0;

        let totalEvents = 0;
        sessionsTable.innerHTML = '';

        if (!data.sessions || data.sessions.length === 0) {
            sessionsTable.innerHTML = '<tr><td colspan="9" class="empty">Aucune donnée collectée</td></tr>';
            document.getElementById('totalEvents').textContent = '0';
            return;
        }

        data.sessions.forEach(function(s) {
            totalEvents += s.nbEvenements;
            const row = document.createElement('tr');
            const debut = s.debut ? formatParticipantTime(s.debut) : '-';
            const pid = s._id.participant;

            const cellCheck = document.createElement('td');
            cellCheck.style.textAlign = 'center';
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.className = 'participant-checkbox';
            chk.dataset.pid = pid;
            chk.style.cursor = 'pointer';
            cellCheck.appendChild(chk);

            const cellPid = document.createElement('td');
            cellPid.innerHTML = '<strong>' + pid + '</strong>';

            const cellC1 = document.createElement('td');
            cellC1.textContent = s.c1 || "Non spécifié";
            if (s.c1 && s.c1.includes('✅')) cellC1.style.color = '#34d399';
            if (s.c1 && s.c1.includes('❌')) cellC1.style.color = '#f87171';

            const cellC2 = document.createElement('td');
            cellC2.textContent = s.c2 || "Non spécifié";
            if (s.c2 && s.c2.includes('✅')) cellC2.style.color = '#34d399';
            if (s.c2 && s.c2.includes('🚨')) cellC2.style.color = '#f87171';
            
            const cellEvents = document.createElement('td');
            cellEvents.textContent = s.nbEvenements;
            const cellPages = document.createElement('td');
            cellPages.textContent = s.nbPages || 0;
            const cellClics = document.createElement('td');
            cellClics.textContent = s.nbClics || 0;
            const cellDebut = document.createElement('td');
            cellDebut.textContent = debut;
            const cellActions = document.createElement('td');

            const btnP = document.createElement('button');
            btnP.className = 'btn btn-blue';
            btnP.textContent = '📥 JSON';
            btnP.addEventListener('click', function() { downloadParticipant(pid); });

            const btnE = document.createElement('button');
            btnE.className = 'btn btn-blue';
            btnE.textContent = '📥 Excel';
            btnE.style.marginLeft = '5px';
            btnE.addEventListener('click', function() { downloadParticipantExcel(pid); });

            const btnV = document.createElement('button');
            btnV.className = 'btn btn-green';
            btnV.textContent = '📊 Analyser';
            btnV.style.marginLeft = '5px';
            btnV.addEventListener('click', function() { viewParticipant(pid); });

            cellActions.appendChild(btnP);
            cellActions.appendChild(btnE);
            cellActions.appendChild(btnV);

            row.appendChild(cellCheck);
            row.appendChild(cellPid);
            row.appendChild(cellC1);
            row.appendChild(cellC2);
            row.appendChild(cellEvents);
            row.appendChild(cellPages);
            row.appendChild(cellClics);
            row.appendChild(cellDebut);
            row.appendChild(cellActions);
            sessionsTable.appendChild(row);
        });

        document.getElementById('totalEvents').textContent = totalEvents;
        showStatus('✅ ' + data.totalParticipants + ' participants chargés', 'ok');
    } catch (e) {
        showStatus('❌ Erreur : ' + e.message, 'err');
    }
}

// =========================================================
// EXTRACTION DES RÉPONSES & DONNÉES D'ÉVALUATION (CORRIGÉ)
// =========================================================
function extractResponseText(d, type) {
    if (!d) return '';
    if (typeof d === 'string') return d.trim();
    if (typeof d === 'object') {
        // Pour les questions de recherche / mémoire
        if (d.answer && typeof d.answer === 'string') return d.answer.trim();
        if (d.answerText && typeof d.answerText === 'string') return d.answerText.trim();
        if (d.response && typeof d.response === 'string') return d.response.trim();
        if (d.reponse && typeof d.reponse === 'string') return d.reponse.trim();
        if (d.texte && typeof d.texte === 'string') return d.texte.trim();
        if (d.userAnswer && typeof d.userAnswer === 'string') return d.userAnswer.trim();
        
        // Pour l'auto-évaluation et NASA-TLX : sérialisation claire et lisible
        if (type === 'self_assessment' || d.perceivedDifficulty !== undefined || d.knowledgeBase !== undefined) {
            const parts = [];
            if (d.knowledgeBase !== undefined) parts.push(`ConnaissanceBase: ${d.knowledgeBase}/100`);
            if (d.perceivedDifficulty !== undefined) parts.push(`DifficultePercue: ${d.perceivedDifficulty}/7`);
            if (d.tlx_mental !== undefined) parts.push(`TLX_Mental: ${d.tlx_mental}`);
            if (d.tlx_phys !== undefined) parts.push(`TLX_Phys: ${d.tlx_phys}`);
            if (d.tlx_temp !== undefined) parts.push(`TLX_Temp: ${d.tlx_temp}`);
            if (d.tlx_effort !== undefined) parts.push(`TLX_Effort: ${d.tlx_effort}`);
            if (d.tlx_perf !== undefined) parts.push(`TLX_Perf: ${d.tlx_perf}`);
            if (d.tlx_frust !== undefined) parts.push(`TLX_Frust: ${d.tlx_frust}`);
            if (parts.length > 0) return parts.join(' | ');
        }

        // Pour les données de compétences internet
        if (type === 'internet_skills' || (d.item_1 !== undefined)) {
            return Object.entries(d).map(([k, v]) => `${k}:${v}`).join(' | ');
        }

        // Pour la démographie
        if (type === 'demographics') {
            return Object.entries(d).map(([k, v]) => `${k}:${v}`).join(' | ');
        }

        return JSON.stringify(d);
    }
    return JSON.stringify(d);
}

// =========================================================
// ALGORITHMES DE DIVERSITÉ LEXICALE (MATTR & MTLD)
// =========================================================
function tokenizeText(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^\w\s\u00C0-\u024F]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 0);
}

function calculateMATTR(text, windowSize = 50) {
    const tokens = tokenizeText(text);
    if (tokens.length === 0) return 0;
    if (tokens.length < windowSize) {
        const unique = new Set(tokens);
        return +(unique.size / tokens.length).toFixed(4);
    }
    let totalTTR = 0;
    const numWindows = tokens.length - windowSize + 1;
    for (let i = 0; i < numWindows; i++) {
        const window = tokens.slice(i, i + windowSize);
        const unique = new Set(window);
        totalTTR += (unique.size / windowSize);
    }
    return +(totalTTR / numWindows).toFixed(4);
}

function calculateMTLD(text, factorThreshold = 0.72) {
    const tokens = tokenizeText(text);
    if (tokens.length === 0) return 0;

    function getFactors(wordList) {
        let factors = 0;
        let currentTokens = [];
        for (let i = 0; i < wordList.length; i++) {
            currentTokens.push(wordList[i]);
            const unique = new Set(currentTokens);
            const ttr = unique.size / currentTokens.length;
            if (ttr < factorThreshold) {
                factors++;
                currentTokens = [];
            }
        }
        if (currentTokens.length > 0) {
            const unique = new Set(currentTokens);
            const ttr = unique.size / currentTokens.length;
            const excess = (1 - ttr) / (1 - factorThreshold);
            factors += Math.min(1, Math.max(0, excess));
        }
        return factors === 0 ? 1 : factors;
    }

    const forwardFactors = getFactors(tokens);
    const backwardFactors = getFactors([...tokens].reverse());
    const avgFactors = (forwardFactors + backwardFactors) / 2;
    return +(tokens.length / avgFactors).toFixed(2);
}

// =========================================================
// EXTRACTION DES LIGNES POUR UN PARTICIPANT
// =========================================================
function extractParticipantRows(pid, data) {
    const logs = data.events || [];
    const reps = data.reponses || [];

    const demoRep = reps.find(r => r.type === 'demographics');
    const participantTz = demoRep && demoRep.data ? demoRep.data.timezone : null;

    const navRows = [];
    const copyPasteRows = [];
    const researchRows = [];
    const evalRows = [];
    const globRows = [];

    // 1. Périodes par Question
    const sortedReps = reps.filter(r => r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills'))
                           .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

    const periods = [];
    let rc = 0;
    sortedReps.forEach((r, i) => {
        let lb;
        if (r.type === 'research_answer') { rc++; lb = 'Q' + rc; }
        else if (r.type === 'self_assessment') { lb = 'Q' + rc + '.5'; }
        else if (r.type === 'demographics') { lb = 'Démo'; }
        else if (r.type === 'memory_answer') { lb = 'Mém'; }
        else if (r.type === 'consent') { lb = 'Consentement 1'; }
        else if (r.type === 'deception_consent') { lb = 'Consentement 2'; }
        else if (r.type === 'internet_skills') { lb = 'Compétences Internet'; }
        else { lb = 'R' + (i + 1); }
        periods.push({
            label: lb, 
            type: r.type, 
            qid: r.questionId || '',
            difficulty: r.difficulty || (r.data ? r.data.difficulty : '') || '',
            start: i > 0 ? sortedReps[i - 1].timestamp : null,
            end: r.timestamp, 
            data: r.data || {}
        });
    });

    function getPeriodInfo(ts) {
        if (!periods.length || !ts) return { label: '', qid: '', difficulty: '' };
        for (let i = 0; i < periods.length; i++) {
            let p = periods[i];
            if ((p.start === null || ts >= p.start) && ts <= p.end) {
                return { label: p.label, qid: p.qid, difficulty: p.difficulty };
            }
        }
        if (ts > periods[periods.length - 1].end) {
            return { label: 'Post-Q', qid: '', difficulty: '' };
        }
        return { label: '', qid: '', difficulty: '' };
    }

    // 2. Traitement des événements
    const vis = [];
    const vById = {};

    logs.forEach(log => {
        const t = log.type, url = log.url || '', vid = log.visitId;
        const pInfo = getPeriodInfo(log.timestamp || '');

        if (t === 'copie' || t === 'collage') {
            copyPasteRows.push([
                pid, 
                pInfo.label, 
                pInfo.qid || '—', 
                pInfo.difficulty || '—', 
                t,
                log.timestamp ? formatParticipantTime(log.timestamp, participantTz) : '',
                url, 
                log.texte || ''
            ]);
        }

        if (t === 'navigation' || t === 'tab_activated') {
            const v = {
                id: vis.length, url: url, vid: vid,
                clics: 0, scroll: 0, tms: 0, touches_clavier: 0, copies: [], collages: [],
                closed: t === 'tab_closed', ib: log.transitionType === 'back_forward', ifw: false,
                nom: url.substring(0, 40), 
                q: pInfo.label, 
                qid: pInfo.qid || '', 
                diff: pInfo.difficulty || '',
                tsEntree: log.timestamp || ''
            };
            vis.push(v);
            if (vid) vById[vid] = v;
        } else if (vid && vById[vid]) {
            const vi = vById[vid];
            if (t === 'clic') vi.clics++;
            else if (t === 'page_quittee') {
                vi.scroll = Math.max(vi.scroll, log.maxScroll || 0);
                vi.tms = Math.max(vi.tms, log.temps_passe_ms || 0);
                vi.touches_clavier = Math.max(vi.touches_clavier, log.touches_clavier || 0);
            }
            else if (t === 'copie') vi.copies.push(log.texte || '');
            else if (t === 'collage') vi.collages.push(log.texte || '');
        }
    });

    vis.forEach((v, index) => {
        let heureEntreeFormatted = v.tsEntree ? formatParticipantTime(v.tsEntree, participantTz) : '';
        let heureSortieFormatted = '';

        if (v.tsEntree && v.tms > 0) {
            const entryMs = new Date(v.tsEntree).getTime();
            const exitMs = entryMs + v.tms;
            heureSortieFormatted = formatParticipantTime(exitMs, participantTz);
        } else if (index < vis.length - 1 && vis[index + 1].tsEntree) {
            heureSortieFormatted = formatParticipantTime(vis[index + 1].tsEntree, participantTz);
        } else {
            heureSortieFormatted = heureEntreeFormatted;
        }

        navRows.push([
            pid, 
            v.q, 
            v.qid || '—', 
            v.diff || '—', 
            v.vid,
            heureEntreeFormatted,
            heureSortieFormatted,
            +(v.tms / 1000).toFixed(2), 
            v.url, 
            v.nom, 
            v.scroll, 
            v.clics, 
            v.touches_clavier,
            v.copies.length, 
            v.collages.length,
            v.closed ? 'Oui' : '', 
            v.ib ? 'Oui' : '', 
            v.ifw ? 'Oui' : ''
        ]);
    });

    // 3. Extraction des Réponses de Recherche
    let rIndex = 0;
    sortedReps.forEach(r => {
        const d = r.data || {};
        const answerText = extractResponseText(d, r.type);

        if (r.type === 'research_answer' || r.type === 'memory_answer') {
            if (r.type === 'research_answer') rIndex++;
            const positionQ = r.type === 'research_answer' ? ('Q' + rIndex) : 'Mém';
            const wordCount = tokenizeText(answerText).length;
            const mattr = calculateMATTR(answerText);
            const mtld = calculateMTLD(answerText);

            const difficulty = r.difficulty || d.difficulty || 'Non spécifié';
            const lang = d.language || 'fr';
            const timeSpentSec = d.timeSpentSeconds !== undefined ? d.timeSpentSeconds : '—';
            const forcedTimeout = d.forcedTimeout ? 'Oui' : 'Non';

            const pLabel = getPeriodInfo(r.timestamp).label;
            const qCopies = copyPasteRows.filter(row => row[1] === pLabel && row[4] === 'copie').map(row => row[7]).join(TEXT_DELIMITER);
            const qPastes = copyPasteRows.filter(row => row[1] === pLabel && row[4] === 'collage').map(row => row[7]).join(TEXT_DELIMITER);

            researchRows.push([
                pid, 
                positionQ,
                r.questionId || r.type, 
                difficulty, 
                lang,
                r.timestamp ? formatParticipantTime(r.timestamp, participantTz) : '',
                timeSpentSec, 
                forcedTimeout,
                answerText, 
                wordCount, 
                mattr, 
                mtld, 
                qCopies, 
                qPastes
            ]);
        } else {
            evalRows.push([
                pid, 
                r.timestamp ? formatParticipantTime(r.timestamp, participantTz) : '',
                r.type, 
                r.questionId || '', 
                r.questionLabel || '', 
                answerText
            ]);
        }
    });

    // 4. Chronologie Globale
    const items = [];
    vis.forEach(v => {
        items.push({
            ts: v.tsEntree,
            row: [
                pid, 
                'Navigation', 
                v.tsEntree ? formatParticipantTime(v.tsEntree, participantTz) : '', 
                v.q, 
                v.qid || '—', 
                'navigation', 
                v.url, 
                v.nom, 
                +(v.tms / 1000).toFixed(2), 
                v.scroll, 
                v.clics, 
                v.touches_clavier, 
                v.copies.length, 
                v.collages.length, 
                v.closed ? 'Oui' : '', 
                ''
            ]
        });
    });
    sortedReps.forEach(r => {
        const answerText = extractResponseText(r.data, r.type);
        items.push({
            ts: r.timestamp || '',
            row: [
                pid, 
                'Réponse', 
                r.timestamp ? formatParticipantTime(r.timestamp, participantTz) : '', 
                getPeriodInfo(r.timestamp).label || '', 
                r.questionId || '', 
                r.type, 
                '', 
                '', 
                '', 
                '', 
                '', 
                '', 
                '', 
                '', 
                '', 
                answerText
            ]
        });
    });
    items.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));
    items.forEach(it => globRows.push(it.row));

    return { navRows, copyPasteRows, researchRows, evalRows, globRows };
}

// Entêtes standardisées
const HEADERS_NAV = ['ParticipantID', 'Position_Q', 'Question_ID', 'Difficulte', 'Visite_ID', 'Heure_Entree', 'Heure_Sortie', 'Duree_Sec', 'URL', 'Nom_Page', 'Scroll_Max_%', 'Clics', 'Touches_Clavier', 'Copies_Count', 'Collages_Count', 'Onglet_Ferme', 'Backward', 'Forward'];
const HEADERS_COPY_PASTE = ['ParticipantID', 'Position_Q', 'Question_ID', 'Difficulte', 'Type_Action', 'Timestamp_Exact', 'URL', 'Texte_Extrait'];
const HEADERS_RESEARCH = ['ParticipantID', 'Position_Q', 'Question_ID', 'Difficulte', 'Langue', 'Heure_Soumission', 'Temps_Reponse_Sec', 'Temps_Ecoule_Timeout', 'Reponse_Textuelle', 'Nombre_Mots', 'MATTR', 'MTLD', 'Textes_Copies_Pendant_Q', 'Textes_Colles_Pendant_Q'];
const HEADERS_EVAL = ['ParticipantID', 'Heure', 'Type_Evaluation', 'QuestionID', 'QuestionLabel', 'Donnees_Reponses'];
const HEADERS_GLOB = ['ParticipantID', 'Source', 'Heure', 'Position_Q', 'Question_ID', 'Type', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Réponse_Donnees'];

// =========================================================
// GENERATEUR EXCEL INDIVIDUEL 5 FEUILLES
// =========================================================
function buildWorkbookForParticipant(pid, data) {
    const wb = XLSX.utils.book_new();
    const rows = extractParticipantRows(pid, data);

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADERS_NAV, ...rows.navRows]), 'Navigation');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADERS_COPY_PASTE, ...rows.copyPasteRows]), 'Copies_Collages');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADERS_RESEARCH, ...rows.researchRows]), 'Reponses_Recherche');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADERS_EVAL, ...rows.evalRows]), 'Auto_Evaluations');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADERS_GLOB, ...rows.globRows]), 'Chronologie_Globale');

    return wb;
}

// =========================================================
// EXPORTS INDIVIDUELS ET GROUPÉS
// =========================================================
async function downloadParticipant(pid) {
    try {
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        let data = await response.json();
        
        data = await decryptParticipantData(data);

        downloadJSON(data, 'participant_' + pid);
        var nbEvents = data.events ? data.events.length : data.length;
        var nbReponses = data.reponses ? data.reponses.length : 0;
        showStatus('✅ Participant: ' + nbEvents + ' événements + ' + nbReponses + ' réponses (déchiffrés)', 'ok');
    } catch (e) { showStatus('❌ ' + e.message, 'err'); }
}

async function downloadParticipantExcel(pid) {
    try {
        showStatus('📥 Génération de la feuille Excel déchiffrée pour ' + pid + '...', 'info');
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        let data = await response.json();
        
        data = await decryptParticipantData(data);
        
        const wb = buildWorkbookForParticipant(pid, data);
        XLSX.writeFile(wb, 'participant_' + pid + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
        showStatus('✅ Fichier Excel déchiffré généré pour ' + pid, 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

async function fetchSelectedData() {
    const checkboxes = document.querySelectorAll('.participant-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Veuillez sélectionner au moins un participant de l'étude à l'aide des cases à cocher.");
        return null;
    }
    
    showStatus('📥 Récupération des données pour ' + checkboxes.length + ' participant(s)...', 'info');
    const records = [];
    
    for (const cb of checkboxes) {
        const pid = cb.dataset.pid;
        try {
            const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
            let data = await response.json();
            
            data = await decryptParticipantData(data);
            records.push({ pid: pid, data: data });
        } catch (err) {
            console.error("Erreur de récupération pour le participant : " + pid, err);
        }
    }
    return records;
}

// =========================================================
// NOUVEAU : EXPORT EXCEL COMPILÉ (TOUT-EN-UN EMPILÉ)
// =========================================================
async function downloadCompiledExcel() {
    const selected = await fetchSelectedData();
    if (!selected) return;

    if (typeof XLSX === 'undefined') {
        showStatus('❌ Erreur: La bibliothèque XLSX (SheetJS) n\'est pas disponible.', 'err');
        return;
    }

    try {
        showStatus('📊 Compilation des données de ' + selected.length + ' participant(s)...', 'info');

        const allNav = [HEADERS_NAV];
        const allCopyPaste = [HEADERS_COPY_PASTE];
        const allResearch = [HEADERS_RESEARCH];
        const allEval = [HEADERS_EVAL];
        const allGlob = [HEADERS_GLOB];

        selected.forEach(item => {
            const rows = extractParticipantRows(item.pid, item.data);
            allNav.push(...rows.navRows);
            allCopyPaste.push(...rows.copyPasteRows);
            allResearch.push(...rows.researchRows);
            allEval.push(...rows.evalRows);
            allGlob.push(...rows.globRows);
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allNav), 'Navigation');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allCopyPaste), 'Copies_Collages');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allResearch), 'Reponses_Recherche');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allEval), 'Auto_Evaluations');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allGlob), 'Chronologie_Globale');

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `export_compile_participants_${selected.length}_${dateStr}.xlsx`);
        showStatus('✅ Fichier Excel compilé généré pour ' + selected.length + ' participant(s)', 'ok');
    } catch (err) {
        showStatus('❌ Erreur lors de la compilation Excel : ' + err.message, 'err');
    }
}

async function downloadSelectedJson() {
    const selected = await fetchSelectedData();
    if (!selected) return;

    try {
        const jsonExport = selected.map(function(item) {
            return {
                participantId: item.pid,
                events: item.data.events || [],
                reponses: item.data.reponses || []
            };
        });

        downloadJSON(jsonExport, 'export_selection_participants');
        showStatus('✅ Export JSON déchiffré complété pour ' + selected.length + ' participant(s)', 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

async function downloadSelectedExcel() {
    const selected = await fetchSelectedData();
    if (!selected) return;

    if (typeof XLSX === 'undefined') {
        showStatus('❌ Erreur: La bibliothèque XLSX (SheetJS) n\'est pas disponible.', 'err');
        return;
    }
    if (typeof JSZip === 'undefined') {
        showStatus('❌ Erreur: La bibliothèque JSZip n\'est pas disponible.', 'err');
        return;
    }

    try {
        const zip = new JSZip();

        selected.forEach(function(item) {
            const pid = item.pid;
            const data = item.data;
            
            const wb = buildWorkbookForParticipant(pid, data);
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            zip.file('participant_' + pid + '_' + new Date().toISOString().slice(0, 10) + '.xlsx', excelBuffer);
        });

        showStatus('📦 Création de l\'archive ZIP déchiffrée en cours...', 'info');
        const content = await zip.generateAsync({ type: 'blob' });
        
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export_excel_participants_' + new Date().toISOString().slice(0, 10) + '.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('✅ ZIP exporté contenant ' + selected.length + ' fichier(s) Excel déchiffré(s)', 'ok');
    } catch (err) {
        showStatus('❌ Erreur d\'exportation ZIP : ' + err.message, 'err');
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showStatus(text, type) {
    statusBar.textContent = text;
    statusBar.className = 'status-' + type;
}

// =========================================================
// OUVRIR LE DASHBOARD VISUEL (DÉCHIFFRÉ)
// =========================================================
async function viewParticipant(pid) {
    try {
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        let data = await response.json();

        data = await decryptParticipantData(data);

        sessionStorage.setItem('dashboard_data', JSON.stringify(data));
        sessionStorage.setItem('dashboard_participant_id', pid);

        window.open('/admin/dashboard.html?pid=' + encodeURIComponent(pid), '_blank');
    } catch (e) {
        showStatus('❌ Erreur chargement participant : ' + e.message, 'err');
    }
}

function openDashboard() {
    sessionStorage.removeItem('dashboard_data');
    sessionStorage.removeItem('dashboard_participant_id');
    window.open('/admin/dashboard.html', '_blank');
}