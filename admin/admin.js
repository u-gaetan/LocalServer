// admin.js (Modifié)

// =========================================================
// VARIABLES GLOBALES
// =========================================================
let AUTH_TOKEN = '';
const BASE_URL = window.location.origin;
let researcherPrivateKey = null; // Stocke l'objet CryptoKey en mémoire vive

// =========================================================
// ÉLÉMENTS DU DOM
// =========================================================
const usernameInput          = document.getElementById('usernameInput');
const passwordInput          = document.getElementById('passwordInput');
const connectBtn             = document.getElementById('connectBtn');
const logoutBtn              = document.getElementById('logoutBtn');
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
// DICTIONNAIRE DE TRADUCTION DES COMPÉTENCES INTERNET
// =========================================================
const SKILLS_MAP = {
    "item_1": "1_Telecharger_Fichiers",
    "item_2": "2_Sauvegarder_Photos",
    "item_3": "3_Raccourcis_Clavier",
    "item_4": "4_Ouvrir_Onglet",
    "item_5": "5_Signet_Favoris",
    "item_6": "6_Cliquer_Lien",
    "item_7": "7_Diff_Mots_Cles",
    "item_8": "8_Diff_Retrouver_Site",
    "item_9": "9_Fatigue_Recherche",
    "item_10": "10_Nav_Involontaire",
    "item_11": "11_Confusion_Ergo",
    "item_12": "12_Besoin_Cours",
    "item_13": "13_Diff_Verif_Info",
    "item_14": "14_Partage_Securite",
    "item_15": "15_Quand_Partager",
    "item_16": "16_Comportement_Net",
    "item_17": "17_Reglage_Confid",
    "item_18": "18_Supprimer_Amis",
    "item_19": "19_Creation_Contenu",
    "item_20": "20_Modif_Contenu",
    "item_21": "21_Concevoir_Site",
    "item_22": "22_Licences_Web",
    "item_23": "23_Confiance_Publier",
    "item_24": "24_Installer_App",
    "item_25": "25_Telecharger_App",
    "item_26": "26_Suivi_Couts_App"
};

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
        return encryptedString; // Non chiffré
    }
    if (!researcherPrivateKey) {
        return "[🔒 Champ Chiffré - Chargez la clé]";
    }
    try {
        const parts = encryptedString.split(":");
        const encAesKeyBuffer = base64ToArrayBuffer(parts[1]);
        const ivBuffer = base64ToArrayBuffer(parts[2]);
        const ciphertextBuffer = base64ToArrayBuffer(parts[3]);

        // 1. Déchiffrer la clé de session AES avec la clé privée du chercheur
        const rawAesKey = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            researcherPrivateKey,
            encAesKeyBuffer
        );

        // 2. Importer cette clé AES
        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            rawAesKey,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // 3. Déchiffrer la donnée originale
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

/**
 * Déchiffre de façon asynchrone l'intégralité du pack de données d'un participant
 */
async function decryptParticipantData(data) {
    if (!researcherPrivateKey) return data; // On retourne brut si aucune clé n'est configurée

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
            sessionStorage.setItem('tracker_private_key_pem', content); // Persistance temporaire
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

// Auto-restauration de la clé privée au rafraîchissement
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
    sessionStorage.removeItem('tracker_private_key_pem'); // Effacer la clé par sécurité
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
            sessionsTable.innerHTML = '<tr><td colspan="7" class="empty">Aucune donnée collectée</td></tr>';
            document.getElementById('totalEvents').textContent = '0';
            return;
        }

        data.sessions.forEach(function(s) {
            totalEvents += s.nbEvenements;
            const row = document.createElement('tr');
            const debut = s.debut ? new Date(s.debut).toLocaleString('fr-FR') : '-';
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
// FONCTIONS DE COMPILATION EXCEL MODULES REUTILISABLES
// =========================================================

function buildWorkbookForParticipant(pid, data) {
    const logs = data.events || [];
    const reps = data.reponses || [];
    const wb = XLSX.utils.book_new();

    const navRows = [['ParticipantID', 'Question', 'Heure', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Backward', 'Forward']];
    const repRows = [['ParticipantID', 'Heure', 'Type', 'QuestionID', 'QuestionLabel', 'Réponse / Données']];
    const globRows = [['ParticipantID', 'Source', 'Heure', 'Question', 'Type', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Backward', 'Forward', 'Réponse']];

    const sortedReps = reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) {
        return (a.timestamp || '').localeCompare(b.timestamp || '');
    });

    const periods = [];
    let rc = 0;
    sortedReps.forEach(function(r, i) {
        var lb;
        if (r.type === 'research_answer') { rc++; lb = 'Q' + rc; }
        else if (r.type === 'self_assessment') { lb = 'Q' + rc + '.5'; }
        else if (r.type === 'demographics') { lb = 'Démo'; }
        else if (r.type === 'memory_answer') { lb = 'Mém'; }
        else if (r.type === 'consent') { lb = 'Consentement 1'; }
        else if (r.type === 'deception_consent') { lb = 'Consentement 2'; }
        else if (r.type === 'internet_skills' || (r.type === 'questionnaire_event' && r.data && r.data.event === 'internet_skills')) { 
            lb = 'Compétences Internet'; 
        }
        else { lb = 'R' + (i + 1); }
        periods.push({
            label: lb, type: r.type, qid: r.questionId || '',
            start: i > 0 ? sortedReps[i - 1].timestamp : null,
            end: r.timestamp, data: r.data || {}
        });
    });

    function getQL(ts) {
        if (!periods.length || !ts) return '';
        for (var i = 0; i < periods.length; i++) {
            var p = periods[i];
            if ((p.start === null || ts >= p.start) && ts <= p.end) return p.label;
        }
        if (ts > periods[periods.length - 1].end) return 'Post-Q';
        return '';
    }

    const vis = [];
    const vById = {};
    logs.forEach(function(log) {
        var t = log.type, url = log.url || '', vid = log.visitId;
        if (t === 'navigation' || t === 'tab_activated') {
            var v = {
                id: vis.length, url: url, vid: vid,
                clics: 0, scroll: 0, tms: 0, touches_clavier: 0, copies: [], collages: [],
                closed: t === 'tab_closed', ib: log.transitionType === 'back_forward', ifw: false,
                nom: url.substring(0, 40), q: getQL(log.timestamp || ''), ts: log.timestamp || ''
            };
            vis.push(v);
            if (vid) vById[vid] = v;
        } else if (vid && vById[vid]) {
            var vi = vById[vid];
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

    vis.forEach(function(v) {
        navRows.push([
            pid, v.q, v.ts ? new Date(v.ts).toTimeString().substring(0, 8) : '', v.url, v.nom,
            +(v.tms / 1000).toFixed(2), v.scroll, v.clics, v.touches_clavier,
            v.copies.join('\n'), v.collages.join('\n'),
            v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : ''
        ]);
    });

    sortedReps.forEach(function(r) {
        var d = r.data || {};
        var rs = "";
        if (typeof d === 'object' && !Array.isArray(d)) {
            var targetObj = (d.answers && typeof d.answers === 'object') ? d.answers : d;
            rs = Object.entries(targetObj).map(function(e) {
                var label = SKILLS_MAP[e[0]] || e[0];
                return label + '=' + e[1];
            }).join('; ');
        } else {
            rs = String(d);
        }

        var rRow = [
            pid, 
            r.timestamp ? new Date(r.timestamp).toTimeString().substring(0, 8) : '', 
            r.type, 
            r.questionId || '', 
            r.questionLabel || '',
            rs
        ];
        repRows.push(rRow);
    });

    var items = [];
    vis.forEach(function(v) {
        items.push({
            ts: v.ts,
            row: [pid, 'Navigation', v.ts ? new Date(v.ts).toTimeString().substring(0, 8) : '', v.q, 'navigation', v.url, v.nom,
                  +(v.tms / 1000).toFixed(2), v.scroll, v.clics, v.touches_clavier, v.copies.join('\n'), v.collages.join('\n'),
                  v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : '', '']
        });
    });
    sortedReps.forEach(function(r) {
        var d = r.data || {};
        var rs = "";
        if (typeof d === 'object' && !Array.isArray(d)) {
            var targetObj = (d.answers && typeof d.answers === 'object') ? d.answers : d;
            rs = Object.entries(targetObj).map(function(e) { 
                var label = SKILLS_MAP[e[0]] || e[0];
                return label + '=' + e[1]; 
            }).join('; ');
        } else {
            rs = String(d);
        }
        items.push({
            ts: r.timestamp || '',
            row: [pid, 'Réponse', r.timestamp ? new Date(r.timestamp).toTimeString().substring(0, 8) : '', r.questionId || '', r.type,
                  '', '', '', '', '', '', '', '', '', '', '', rs]
        });
    });
    items.sort(function(a, b) { return (a.ts || '').localeCompare(b.ts || ''); });
    items.forEach(function(it) { globRows.push(it.row); });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(navRows), 'Navigation');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(repRows), 'Réponses');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(globRows), 'Global');

    return wb;
}

// =========================================================
// EXTRACTION INDIVIDUELLE (DÉCHIFFREMENT INTÉGRÉ)
// =========================================================
async function downloadParticipant(pid) {
    try {
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        let data = await response.json();
        
        // Déchiffrement CSFLE transparent
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
        
        // Déchiffrement CSFLE transparent
        data = await decryptParticipantData(data);
        
        const wb = buildWorkbookForParticipant(pid, data);
        XLSX.writeFile(wb, 'participant_' + pid + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
        showStatus('✅ Fichier Excel déchiffré généré pour ' + pid, 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

// =========================================================
// EXPORTS GROUPÉS (DÉCHIFFREMENT BATCH INTÉGRÉ)
// =========================================================

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
            
            // Déchiffrement batch CSFLE transparent
            data = await decryptParticipantData(data);

            records.push({ pid: pid, data: data });
        } catch (err) {
            console.error("Erreur de récupération pour le participant : " + pid, err);
        }
    }
    return records;
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

        // Déchiffrement CSFLE transparent avant stockage dans la session locale
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