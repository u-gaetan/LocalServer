// =========================================================
// VARIABLES GLOBALES
// =========================================================
let AUTH_TOKEN = '';
const BASE_URL = window.location.origin;

// =========================================================
// ÉLÉMENTS DU DOM
// =========================================================
const usernameInput   = document.getElementById('usernameInput');
const passwordInput   = document.getElementById('passwordInput');
const connectBtn      = document.getElementById('connectBtn');
const logoutBtn       = document.getElementById('logoutBtn');
const downloadAllBtn  = document.getElementById('downloadAllBtn');
const refreshBtn      = document.getElementById('refreshBtn');
const statusBar       = document.getElementById('statusBar');
const mainContent     = document.getElementById('mainContent');
const sessionsTable   = document.getElementById('sessionsTable');
const loginSection    = document.getElementById('loginSection');
const loggedSection   = document.getElementById('loggedSection');
const loggedUser      = document.getElementById('loggedUser');

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
downloadAllBtn.addEventListener('click', downloadAll);
refreshBtn.addEventListener('click', refreshData);

passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') login();
});

// =========================================================
// LOGIN
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

        // sessionStorage : effacé à la fermeture de l'onglet (plus sûr que localStorage)
        sessionStorage.setItem('tracker_admin_token', AUTH_TOKEN);
        sessionStorage.setItem('tracker_admin_user', username);

        // Effacer les champs
        passwordInput.value = '';

        showLoggedIn(username);
        showStatus('✅ Connecté ! Chargement des données...', 'ok');
        refreshData();

    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

// =========================================================
// LOGOUT
// =========================================================
function logout() {
    AUTH_TOKEN = '';
    sessionStorage.removeItem('tracker_admin_token');
    sessionStorage.removeItem('tracker_admin_user');
    loginSection.style.display = 'flex';
    loggedSection.style.display = 'none';
    mainContent.style.display = 'none';
    showStatus('Déconnecté', 'info');
}

// =========================================================
// UI HELPERS
// =========================================================
function showLoggedIn(username) {
    loginSection.style.display = 'none';
    loggedSection.style.display = 'flex';
    loggedUser.textContent = username;
    mainContent.style.display = 'block';
}

// =========================================================
// APPEL API GÉNÉRIQUE (utilise maintenant Bearer token)
// =========================================================
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
// CHARGER LES DONNÉES (inchangé)
// =========================================================
async function refreshData() {
    try {
        const response = await apiCall('/resume');
        const data = await response.json();

        document.getElementById('totalParticipants').textContent = data.totalParticipants || 0;
        document.getElementById('totalSessions').textContent = data.totalSessions || 0;

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
            const sid = s._id.session;

            const cellPid = document.createElement('td');
            cellPid.innerHTML = '<strong>' + pid + '</strong>';
            const cellSid = document.createElement('td');
            cellSid.style.fontFamily = 'monospace';
            cellSid.style.fontSize = '11px';
            cellSid.textContent = sid;
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
            btnP.textContent = '📥 Participant';
            btnP.addEventListener('click', function() { downloadParticipant(pid); });

            const btnS = document.createElement('button');
            btnS.className = 'btn btn-gray';
            btnS.textContent = '📥 Session';
            
            btnS.style.marginLeft = '5px';
            btnS.addEventListener('click', function() { downloadSession(sid); });


            const btnV = document.createElement('button');
            btnV.className = 'btn btn-green';
            btnV.textContent = '📊 Visualiser';
            btnV.style.marginLeft = '5px';
            btnV.addEventListener('click', function() { viewSession(sid); });

            cellActions.appendChild(btnP);
            cellActions.appendChild(btnS);
            cellActions.appendChild(btnV);
            row.appendChild(cellPid);
            row.appendChild(cellSid);
            row.appendChild(cellEvents);
            row.appendChild(cellPages);
            row.appendChild(cellClics);
            row.appendChild(cellDebut);
            row.appendChild(cellActions);
            sessionsTable.appendChild(row);
        });

        document.getElementById('totalEvents').textContent = totalEvents;
        showStatus('✅ ' + data.totalSessions + ' sessions chargées', 'ok');
    } catch (e) {
        showStatus('❌ Erreur : ' + e.message, 'err');
    }
}

// =========================================================
// TÉLÉCHARGEMENTS (inchangé)
// =========================================================
async function downloadAll() {
    try {
        showStatus('📥 Téléchargement en cours...', 'info');
        const response = await apiCall('/export/all');
        const data = await response.json();
        downloadJSON(data, 'export_complet');
        showStatus('✅ ' + data.length + ' événements téléchargés', 'ok');
    } catch (e) {
        showStatus('❌ ' + e.message, 'err');
    }
}

async function downloadSession(sid) {
    try {
        const response = await apiCall('/export/session/' + sid + '?include_responses=true');
        const data = await response.json();
        downloadJSON(data, 'session_' + sid);
        var nbEvents = data.events ? data.events.length : data.length;
        var nbReponses = data.reponses ? data.reponses.length : 0;
        showStatus('✅ Session: ' + nbEvents + ' événements + ' + nbReponses + ' réponses', 'ok');
    } catch (e) { showStatus('❌ ' + e.message, 'err'); }
}

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

async function viewSession(sid) {
    try {
        // Charger les données depuis l'API (avec les bons headers d'auth)
        const response = await apiCall('/export/session/' + sid + '?include_responses=true');
        const data = await response.json();

        // Stocker dans sessionStorage pour que dashboard.js puisse les lire
        sessionStorage.setItem('dashboard_data', JSON.stringify(data));
        sessionStorage.setItem('dashboard_session_id', sid);

        // Ouvrir le dashboard
        window.open('/admin/dashboard.html?session=' + encodeURIComponent(sid), '_blank');
    } catch (e) {
        showStatus('❌ Erreur chargement session : ' + e.message, 'err');
    }
}

// Ouvre le dashboard en mode glisser-déposer (fichier libre)
function openDashboard() {
    sessionStorage.removeItem('dashboard_data');
    sessionStorage.removeItem('dashboard_session_id');
    window.open('/admin/dashboard.html', '_blank');
}
