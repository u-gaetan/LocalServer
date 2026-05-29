// =========================================================
// VARIABLES GLOBALES
// =========================================================
let AUTH_TOKEN = '';
const BASE_URL = window.location.origin;

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
// EVENT LISTENERS
// =========================================================
connectBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
downloadSelectedExcelBtn.addEventListener('click', downloadSelectedExcel);
downloadSelectedJsonBtn.addEventListener('click', downloadSelectedJson);
refreshBtn.addEventListener('click', refreshData);

passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') login();
});

// Écouteur de sélection de masse
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

            // Case à cocher pour sélection groupée
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

            // Bouton de téléchargement JSON individuel
            const btnP = document.createElement('button');
            btnP.className = 'btn btn-blue';
            btnP.textContent = '📥 JSON';
            btnP.addEventListener('click', function() { downloadParticipant(pid); });

            // Bouton de téléchargement Excel individuel (Ajouté)
            const btnE = document.createElement('button');
            btnE.className = 'btn btn-blue';
            btnE.textContent = '📥 Excel';
            btnE.style.marginLeft = '5px';
            btnE.addEventListener('click', function() { downloadParticipantExcel(pid); });

            // Bouton d'analyse visuelle
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
    const repRows = [];
    const globRows = [['ParticipantID', 'Source', 'Heure', 'Question', 'Type', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Backward', 'Forward', 'Réponse']];

    // Extraction des clés d'évaluation uniques (avec aplatissement intelligent)
    const allRepKeys = {};
    reps.forEach(function(r) {
        if (r.type === 'questionnaire_event' && r.data && r.data.event !== 'internet_skills') return;
        var d = r.data || {};
        if (typeof d === 'object') {
            // Si ancien format imbriqué { answers: { item_1: X } }
            if (d.answers && typeof d.answers === 'object') {
                Object.keys(d.answers).forEach(function(k) { allRepKeys[k] = true; });
            } else {
                // Si nouveau format plat { item_1: X }
                Object.keys(d).forEach(function(k) {
                    if (k !== 'event') allRepKeys[k] = true;
                });
            }
        }
    });
    const repKeys = Object.keys(allRepKeys);
    const repHeader = ['ParticipantID', 'Heure', 'Type', 'QuestionID', 'QuestionLabel'].concat(repKeys);
    repRows.push(repHeader);

    // Filtrage et tri des réponses
    const sortedReps = reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) {
        return (a.timestamp || '').localeCompare(b.timestamp || '');
    });

    // Construction de la chronologie des blocs
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

    // Reconstruction de la navigation
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

    // Insertion Navigation (Feuille 1)
    vis.forEach(function(v) {
        navRows.push([
            pid, v.q, v.ts ? new Date(v.ts).toTimeString().substring(0, 8) : '', v.url, v.nom,
            +(v.tms / 1000).toFixed(2), v.scroll, v.clics, v.touches_clavier,
            v.copies.join('\n'), v.collages.join('\n'),
            v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : ''
        ]);
    });

    // Insertion Réponses (Feuille 2) (Lecture tolérante des structures de données)
    sortedReps.forEach(function(r) {
        var rRow = [pid, r.timestamp ? new Date(r.timestamp).toTimeString().substring(0, 8) : '', r.type, r.questionId || '', r.questionLabel || ''];
        repKeys.forEach(function(k) {
            var val = null;
            if (r.data) {
                if (r.data[k] !== undefined) {
                    val = r.data[k];
                } else if (r.data.answers && r.data.answers[k] !== undefined) {
                    val = r.data.answers[k]; // Support de l'ancien format imbriqué
                }
            }
            rRow.push(val != null ? String(val) : '');
        });
        repRows.push(rRow);
    });

    // Insertion Globale (Feuille 3)
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
            // Aplatissement de l'affichage dans la feuille "Global"
            var targetObj = (d.answers && typeof d.answers === 'object') ? d.answers : d;
            rs = Object.entries(targetObj).map(function(e) { return e[0] + '=' + e[1]; }).join('; ');
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
// EXTRACTION INDIVIDUELLE (JSON / EXCEL DIRECT)
// =========================================================
async function downloadParticipant(pid) {
    try {
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        const data = await response.json();
        downloadJSON(data, 'participant_' + pid);
        var nbEvents = data.events ? data.events.length : data.length;
        var nbReponses = data.reponses ? data.reponses.length : 0;
        showStatus('✅ Participant: ' + nbEvents + ' événements + ' + nbReponses + ' réponses', 'ok');
    } catch (e) { showStatus('❌ ' + e.message, 'err'); }
}

async function downloadParticipantExcel(pid) {
    try {
        showStatus('📥 Génération de la feuille Excel pour ' + pid + '...', 'info');
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        const data = await response.json();
        
        const wb = buildWorkbookForParticipant(pid, data);
        XLSX.writeFile(wb, 'participant_' + pid + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
        showStatus('✅ Fichier Excel généré pour ' + pid, 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

// =========================================================
// EXPORTS GROUPÉS (SÉLECTION PAR CASES À COCHER)
// =========================================================

// Récupérer la liste des données d'événements et de réponses pour les lignes cochées
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
            const data = await response.json();
            records.push({ pid: pid, data: data });
        } catch (err) {
            console.error("Erreur de récupération pour le participant : " + pid, err);
        }
    }
    return records;
}

// Télécharger en JSON cumulé
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
        showStatus('✅ Export JSON complété pour ' + selected.length + ' participant(s)', 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

// Télécharger au format Excel (Un fichier Excel par participant dans un ZIP)
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
            
            // Génération du classeur Excel individuel structuré pour le participant
            const wb = buildWorkbookForParticipant(pid, data);
            
            // Conversion en tableau binaire
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            
            // Ajout du fichier individuel à l'archive
            zip.file('participant_' + pid + '_' + new Date().toISOString().slice(0, 10) + '.xlsx', excelBuffer);
        });

        showStatus('📦 Création de l\'archive ZIP en cours...', 'info');
        
        // Génération de l'archive ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Déclenchement du téléchargement local
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export_excel_participants_' + new Date().toISOString().slice(0, 10) + '.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('✅ ZIP exporté contenant ' + selected.length + ' fichier(s) Excel', 'ok');
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
// OUVRIR LE DASHBOARD VISUEL
// =========================================================
async function viewParticipant(pid) {
    try {
        const response = await apiCall('/export/participant/' + pid + '?include_responses=true');
        const data = await response.json();

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