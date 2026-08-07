// dashboard.js (Corrigé et complet)

'use strict';

// ═══════════════════════════════════════════════════════
// ÉTAT GLOBAL ET CRYPTO
// ═══════════════════════════════════════════════════════
var S = null;
var CHARTS = {};
var metInit = false;
var researcherPrivateKey = null;
var PAL = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#84cc16','#a855f7','#14b8a6','#f43f5e','#eab308'];

const TEXT_DELIMITER = '\n--- [EXTRAIT] ---\n';

// ═══════════════════════════════════════════════════════
// DÉCHIFFREMENT WEB CRYPTO (CSFLE CLIENT-SIDE)
// ═══════════════════════════════════════════════════════
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
}

async function importPrivateKey(pem) {
    const cleanPem = pem.replace(/-----BEGIN (RSA )?PRIVATE KEY-----/, "").replace(/-----END (RSA )?PRIVATE KEY-----/, "").replace(/\s/g, "");
    const derBuffer = base64ToArrayBuffer(cleanPem);
    return window.crypto.subtle.importKey("pkcs8", derBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
}

async function decryptField(encryptedString) {
    if (!encryptedString || !encryptedString.startsWith("ENC:")) return encryptedString;
    if (!researcherPrivateKey) return "[🔒 Champ Chiffré]";
    try {
        const parts = encryptedString.split(":");
        const encAesKeyBuffer = base64ToArrayBuffer(parts[1]);
        const ivBuffer = base64ToArrayBuffer(parts[2]);
        const ciphertextBuffer = base64ToArrayBuffer(parts[3]);
        const rawAesKey = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, researcherPrivateKey, encAesKeyBuffer);
        const aesKey = await window.crypto.subtle.importKey("raw", rawAesKey, { name: "AES-GCM" }, false, ["decrypt"]);
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivBuffer) }, aesKey, ciphertextBuffer);
        return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
        return "[⚠️ Erreur déchiffrement]";
    }
}

async function decryptParticipantDataInPlace(data) {
    if (!researcherPrivateKey) return data;
    const events = data.events || [];
    for (const event of events) {
        if (event.url) event.url = await decryptField(event.url);
        if (event.parentUrl) event.parentUrl = await decryptField(event.parentUrl);
        if (event.texte) event.texte = await decryptField(event.texte);
    }
    return data;
}

// ═══════════════════════════════════════════════════════
// UTILITAIRES D'AFFICHAGE ET HEURE LOCALE PARTICIPANT
// ═══════════════════════════════════════════════════════
function shortUrl(u) {
    if (!u) return '?';
    if (u.startsWith('chrome://')) return 'Nouvel onglet';
    if (u.includes('/questionnaire/')) {
        var sl = u.split('/questionnaire/')[1];
        if (sl) sl = sl.split('?')[0].replace(/\/$/, '');
        return sl ? 'Questionnaire/' + sl : 'Questionnaire';
    }
    if (u.includes('google.') && u.includes('/search')) {
        try { var q = new URL(u).searchParams.get('q'); return q ? 'Recherche: "' + q + '"' : 'Google'; } catch (e) { return 'Google'; }
    }
    try {
        var p = new URL(u), d = p.hostname.replace('www.', ''), pt = p.pathname.replace(/\/$/, '');
        if (pt && pt !== '/' && pt.length < 30) return d + pt;
        return d || u.substring(0, 40);
    } catch (e) { return u.substring(0, 40); }
}

function tsT(ts, tz) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        if (tz) {
            return d.toLocaleTimeString('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        return d.toTimeString().substring(0, 8);
    } catch (e) { return ''; }
}

function fr(n, d) {
    if (d === undefined) d = 1;
    return Number(n).toFixed(d).replace('.', ',');
}

function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svgSym(clic, copy, paste, closed) {
    var cc = [];
    if (clic) cc.push('#6366f1');
    if (copy) cc.push('#059669');
    if (paste) cc.push('#0891b2');
    if (!cc.length) cc.push('#64748b');
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
    if (cc.length === 1) {
        s += '<circle cx="50" cy="50" r="46" fill="' + cc[0] + '"/>';
    } else if (cc.length === 2) {
        s += '<circle cx="50" cy="50" r="46" fill="' + cc[0] + '"/>';
        s += '<path d="M50 4A46 46 0 0 1 50 96Z" fill="' + cc[1] + '"/>';
    } else if (cc.length === 3) {
        s += '<circle cx="50" cy="50" r="46" fill="' + cc[0] + '"/>';
        s += '<path d="M50 50L50 4A46 46 0 0 1 89.8 73Z" fill="' + cc[1] + '"/>';
        s += '<path d="M50 50L89.8 73A46 46 0 0 1 10.2 73Z" fill="' + cc[2] + '"/>';
    }
    var bc = closed ? '#dc2626' : '#fff', sw = closed ? '6' : '3';
    s += '<circle cx="50" cy="50" r="46" fill="none" stroke="' + bc + '" stroke-width="' + sw + '"/>';
    s += '</svg>';
    return 'image://data:image/svg+xml;base64,' + btoa(s);
}

function tokenizeText(text) {
    if (!text || typeof text !== 'string') return [];
    return text.toLowerCase().replace(/[^\w\s\u00C0-\u024F]/g, ' ').split(/\s+/).filter(w => w.length > 0);
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

function extractResponseText(d) {
    if (!d) return '';
    if (typeof d === 'string') return d.trim();
    if (typeof d === 'object') {
        if (d.answer && typeof d.answer === 'string') return d.answer.trim();
        if (d.answerText && typeof d.answerText === 'string') return d.answerText.trim();
        if (d.response && typeof d.response === 'string') return d.response.trim();
        if (d.reponse && typeof d.reponse === 'string') return d.reponse.trim();
        if (d.texte && typeof d.texte === 'string') return d.texte.trim();
        if (d.userAnswer && typeof d.userAnswer === 'string') return d.userAnswer.trim();
        if (d.answers) return extractResponseText(d.answers);

        const stringValues = Object.values(d).filter(v => typeof v === 'string' && v.trim().length > 0);
        if (stringValues.length > 0) return stringValues.join(' | ');
    }
    return JSON.stringify(d);
}

// ═══════════════════════════════════════════════════════
// PÉRIODES ET DONNÉES
// ═══════════════════════════════════════════════════════
function mkPeriods(reps) {
    if (!reps || !reps.length) return [];
    var sorted = reps.filter(r => r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills'))
                     .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    var periods = [], rc = 0;
    sorted.forEach((r, i) => {
        var lb;
        if (r.type === 'research_answer') { rc++; lb = 'Q' + rc; }
        else if (r.type === 'self_assessment') { lb = 'Q' + rc + '.5'; }
        else if (r.type === 'demographics') { lb = 'Démo'; }
        else if (r.type === 'memory_answer') { lb = 'Mém'; }
        else if (r.type === 'consent') { lb = 'Consentement 1'; }
        else if (r.type === 'deception_consent') { lb = 'Consentement 2'; }
        else if (r.type === 'internet_skills') { lb = 'Compétences Internet'; }
        else { lb = 'R' + (i + 1); }
        periods.push({
            label: lb, type: r.type, qid: r.questionId || '',
            start: i > 0 ? sorted[i - 1].timestamp : null,
            end: r.timestamp, data: r.data || {}
        });
    });
    return periods;
}

function getQL(ts, periods) {
    if (!periods.length || !ts) return '';
    for (var i = 0; i < periods.length; i++) {
        var p = periods[i];
        if ((p.start === null || ts >= p.start) && ts <= p.end) return p.label;
    }
    if (ts > periods[periods.length - 1].end) return 'Post-Q';
    return '';
}

function process(raw) {
    var logs = raw.events || (Array.isArray(raw) ? raw : []);
    var reps = raw.reponses || [];

    var demoRep = reps.find(r => r.type === 'demographics');
    var participantTz = demoRep && demoRep.data ? demoRep.data.timezone : null;

    var periods = mkPeriods(reps);
    var qc = {};
    periods.forEach((p, i) => { qc[p.label] = PAL[i % PAL.length]; });

    var vis = [], vById = {}, prev = null, tStk = {}, tPtr = {};
    logs.forEach(log => {
        var t = log.type, url = log.url || '', vid = log.visitId;
        if (t === 'navigation') {
            var tid = log.tabId, ib = false, ifw = false;
            if (tid != null) {
                if (!tStk[tid]) { tStk[tid] = []; tPtr[tid] = -1; }
                var stk = tStk[tid], ptr = tPtr[tid];
                if (ptr >= 1 && stk[ptr - 1] === url) { ib = true; tPtr[tid] = ptr - 1; }
                else if (ptr < stk.length - 1 && stk[ptr + 1] === url) { ifw = true; tPtr[tid] = ptr + 1; }
                else { tStk[tid] = stk.slice(0, ptr + 1).concat([url]); tPtr[tid] = ptr + 1; }
            }
            if (log.transitionType === 'back_forward' && !ib && !ifw) ib = true;
            var v = {
                id: vis.length, url: url, vid: vid, purl: log.parentUrl || '',
                tid: tid, ib: ib, ifw: ifw, ts: log.timestamp || '',
                clics: 0, scroll: 0, tms: 0, touches_clavier: 0, copies: [], collages: [],
                closed: false, pchron: prev ? prev.id : null,
                nom: shortUrl(url), q: getQL(log.timestamp || '', periods)
            };
            vis.push(v);
            if (vid) vById[vid] = v;
            prev = v;
        } else if (t === 'tab_closed') {
            var tid2 = log.tabId;
            for (var i = vis.length - 1; i >= 0; i--) {
                if (vis[i].tid === tid2) { vis[i].closed = true; break; }
            }
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

    var uO = [], uG = {};
    vis.forEach(v => {
        var u = v.url;
        if (!uG[u]) {
            uO.push(u);
            uG[u] = { 
                url: u, nom: v.nom, tms: 0, scroll: 0, clics: 0, touches_clavier: 0,
                copies: [], collages: [], nb: 0, back: 0, fwd: 0, closed: 0, qs: {},
                visits: []
            };
        }
        var g = uG[u];
        g.tms += v.tms; 
        g.scroll = Math.max(g.scroll, v.scroll);
        g.clics += v.clics; 
        g.touches_clavier += v.touches_clavier; 
        g.copies = g.copies.concat(v.copies);
        g.collages = g.collages.concat(v.collages);
        g.nb++;
        if (v.ib) g.back++; if (v.ifw) g.fwd++; if (v.closed) g.closed++;
        if (v.q) g.qs[v.q] = true;
        g.visits.push(v);
    });
    var vr = uO.map(u => uG[u]);

    var tot = { clics: 0, copies: 0, collages: 0, touches_clavier: 0, temps: 0, back: 0, fwd: 0, closed: 0, tabs: {}, pages: vr.length };
    vis.forEach(v => {
        tot.clics += v.clics; tot.copies += v.copies.length;
        tot.collages += v.collages.length; tot.touches_clavier += v.touches_clavier;
        tot.temps += v.tms;
        if (v.ib) tot.back++; if (v.ifw) tot.fwd++; if (v.closed) tot.closed++;
        if (v.tid) tot.tabs[v.tid] = true;
    });
    tot.tabCount = Object.keys(tot.tabs).length;

    var duree = '—';
    if (vis.length >= 2) {
        try {
            var ds = (new Date(vis[vis.length - 1].ts) - new Date(vis[0].ts)) / 1000;
            duree = Math.floor(ds / 60) + ' min ' + Math.floor(ds % 60) + ' s';
        } catch (e) {}
    }

    var consent1 = "Non spécifié", consent2 = "Non spécifié";
    reps.forEach(function(r) {
        if (r.type === 'consent') consent1 = (r.data && r.data.consent) ? "✅ Accepté" : "❌ Refusé";
        if (r.type === 'deception_consent') consent2 = (r.data && r.data.decision === 'maintain') ? "✅ Maintenu" : "🚨 RETIRÉ";
    });

    S = { vis, reps, periods, qc, vr, tot, duree, consent1, consent2, participantTz };
    return S;
}

// ═══════════════════════════════════════════════════════
// CHARGEMENT ET RÉCUPÉRATION DE SESSION
// ═══════════════════════════════════════════════════════
function handleFile(file) {
    setLoading('Chargement du fichier...');
    var reader = new FileReader();
    reader.onload = async function(e) {
        try {
            var raw = JSON.parse(e.target.result);
            if (researcherPrivateKey) raw = await decryptParticipantDataInPlace(raw);
            process(raw);
            showDash();
        } catch (err) { setLoading('❌ Erreur : ' + err.message); }
    };
    reader.readAsText(file);
}

function loadFromSessionStorage() {
    var data = sessionStorage.getItem('dashboard_data');
    if (!data) return false;
    try {
        var raw = JSON.parse(data);
        process(raw);
        sessionStorage.removeItem('dashboard_data');
        sessionStorage.removeItem('dashboard_participant_id');
        showDash();
        return true;
    } catch (err) {
        setLoading('❌ Erreur données : ' + err.message);
        return false;
    }
}

function loadFromAPI(pid) {
    setLoading('Chargement participant ' + pid + ' depuis l\'API...');
    var token = sessionStorage.getItem('tracker_admin_token') || '';
    fetch('/api/collecte/export/participant/' + encodeURIComponent(pid) + '?include_responses=true', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(async function(data) {
            if (researcherPrivateKey) data = await decryptParticipantDataInPlace(data);
            process(data);
            showDash();
        })
        .catch(function(err) {
            setLoading('❌ Erreur API : ' + err.message + ' — Utilisez le glisser-déposer.');
        });
}

function setLoading(msg) {
    var el = document.getElementById('loading');
    if (el) el.textContent = msg;
}

function showDash() {
    document.getElementById('drop').style.display = 'none';
    document.getElementById('dash').style.display = 'block';
    metInit = false;
    render();
}

function resetDash() {
    S = null; CHARTS = {}; metInit = false;
    document.getElementById('dash').style.display = 'none';
    document.getElementById('drop').style.display = 'flex';
    setLoading('');
}

function sw(id, btn) {
    document.querySelectorAll('.pan').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    document.getElementById('p-' + id).classList.add('on');
    btn.classList.add('on');
    if (id === 'met' && !metInit) { metInit = true; renderMetrics(); }
    setTimeout(() => { Object.values(CHARTS).forEach(c => { if (c && c.resize) c.resize(); }); }, 100);
}

// ═══════════════════════════════════════════════════════
// RENDU GLOBAL
// ═══════════════════════════════════════════════════════
function render() {
    renderHeader();
    renderTabs();
    renderTree();
    renderNavTab();
    renderCopyPasteTab();
    renderResearchTab();
    renderEvalTab();
    renderChronoTab();
}

function renderHeader() {
    var t = S.tot;
    var tzInfo = S.participantTz ? ' (Fuseau: ' + S.participantTz + ')' : '';
    var h = '<span>' + S.vis.length + ' visites</span>';
    h += '<span>' + t.pages + ' pages distinctes</span>';
    h += '<span>' + t.tabCount + ' onglets</span>';
    h += '<span>Durée : ' + S.duree + tzInfo + '</span>';
    
    var c1 = S.consent1 || "Non spécifié";
    var c2 = S.consent2 || "Non spécifié";
    var bg1 = c1.includes('✅') ? '#d1fae5' : (c1.includes('❌') ? '#fee2e2' : '#f8fafc');
    var text1 = c1.includes('✅') ? '#065f46' : (c1.includes('❌') ? '#991b1b' : '#475569');
    var bg2 = c2.includes('✅') ? '#d1fae5' : (c2.includes('🚨') ? '#fee2e2' : '#f8fafc');
    var text2 = c2.includes('✅') ? '#065f46' : (c2.includes('🚨') ? '#991b1b' : '#475569');
    
    h += '<div style="margin-left:auto; display:flex; gap:10px;">';
    h += '<span style="background:'+bg1+'; color:'+text1+'; font-weight:700; padding:4px 12px; border-radius:20px; font-size:13px;">C1 : ' + c1 + '</span>';
    h += '<span style="background:'+bg2+'; color:'+text2+'; font-weight:700; padding:4px 12px; border-radius:20px; font-size:13px;">C2 : ' + c2 + '</span>';
    h += '</div>';
    document.getElementById('header-meta').innerHTML = h;
}

function renderTabs() {
    var h = '<button class="tb on" onclick="sw(\'tree\',this)">Arbre</button>';
    h += '<button class="tb" onclick="sw(\'met\',this)">Métriques</button>';
    h += '<button class="tb" onclick="sw(\'nav\',this)">📄 Navigation</button>';
    h += '<button class="tb" onclick="sw(\'copypaste\',this)">📋 Copies & Collages</button>';
    h += '<button class="tb" onclick="sw(\'research\',this)">🔍 Réponses Recherche</button>';
    h += '<button class="tb" onclick="sw(\'eval\',this)">📊 Auto-Évaluations</button>';
    h += '<button class="tb" onclick="sw(\'chrono\',this)">⏱️ Chronologie Globale</button>';
    document.getElementById('tabbar').innerHTML = h;
}

// ═══════════════════════════════════════════════════════
// ARBRE ET MÉTRIQUES CUMULÉES
// ═══════════════════════════════════════════════════════
function renderTree() {
    var EX = 180, EY = 140, nodes = [], links = [], bof = {}, my = 0;
    S.vis.forEach((v, xi) => {
        var nid = 'n' + v.id, src = null;
        if (v.pchron !== null && v.id > 0) src = 'n' + v.pchron;
        var yy = 0;
        var nm = v.nom; if (v.q) nm = '[' + v.q + '] ' + nm;
        nodes.push({
            id: nid, name: nm, x: xi * EX, y: yy,
            symbol: svgSym(v.clics > 0, v.copies.length > 0, v.collages.length > 0, v.closed),
            symbolSize: v.closed ? 28 : 20
        });
        if (src) links.push({ source: src, target: nid, lineStyle: { color: '#94a3b8', width: 1.5 } });
    });

    var cw = Math.max(1200, S.vis.length * 180 + 200);
    document.getElementById('p-tree').innerHTML = '<div class="cb" style="height:550px;overflow:auto;"><div id="c-tree" style="width:' + cw + 'px;height:500px;"></div></div>';
    var chart = echarts.init(document.getElementById('c-tree'));
    CHARTS.tree = chart;
    chart.setOption({
        tooltip: { trigger: 'item' },
        series: [{ type: 'graph', layout: 'none', data: nodes, links: links, roam: true, zoom: 0.9 }]
    });
}

function renderMetrics() {
    var t = S.tot;
    var h = '<div class="sr">';
    h += mkSC('Pages distinctes', t.pages, '');
    h += mkSC('Temps total', fr(t.temps / 1000, 0) + 's', '');
    h += mkSC('Clics cumulés', t.clics, '#6366f1');
    h += mkSC('Copies cumulées', t.copies, '#059669');
    h += '</div>';

    var ch = Math.max(300, S.vr.length * 40 + 80);
    h += '<div class="cg">';
    h += '<div class="cb cf"><h3>Temps total cumulé par site (avec découpage par visite)</h3><div id="c-temps" style="height:' + ch + 'px"></div></div>';
    h += '<div class="cb cf"><h3>Clics totaux par site (avec découpage par visite)</h3><div id="c-clics" style="height:' + ch + 'px"></div></div>';
    h += '</div>';
    document.getElementById('p-met').innerHTML = h;

    var labs = S.vr.map(g => g.nom);

    var maxVisits = Math.max(...S.vr.map(g => g.visits.length));
    var tempsSeries = [];
    for (var i = 0; i < maxVisits; i++) {
        tempsSeries.push({
            name: 'Visite ' + (i + 1),
            type: 'bar',
            stack: 'totalTemps',
            data: S.vr.map(g => g.visits[i] ? +(g.visits[i].tms / 1000).toFixed(1) : 0)
        });
    }

    CHARTS.temps = echarts.init(document.getElementById('c-temps'));
    CHARTS.temps.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 180, right: 40, top: 20, bottom: 30 },
        xAxis: { type: 'value', name: 's' },
        yAxis: { type: 'category', data: labs, inverse: true },
        series: tempsSeries
    });

    var clicsSeries = [];
    for (var j = 0; j < maxVisits; j++) {
        clicsSeries.push({
            name: 'Visite ' + (j + 1),
            type: 'bar',
            stack: 'totalClics',
            data: S.vr.map(g => g.visits[j] ? g.visits[j].clics : 0)
        });
    }

    CHARTS.clics = echarts.init(document.getElementById('c-clics'));
    CHARTS.clics.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 180, right: 40, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: labs, inverse: true },
        series: clicsSeries
    });
}

function mkSC(l, v, c) {
    return '<div class="sc"><div class="sl">' + l + '</div><div class="sv"' + (c ? ' style="color:' + c + '"' : '') + '>' + v + '</div></div>';
}

// ═══════════════════════════════════════════════════════
// RENDU DES 5 ONGLETS DU EXCEL
// ═══════════════════════════════════════════════════════

function renderNavTab() {
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question</th><th>Visite_ID</th><th>Heure_Entrée</th><th>Heure_Sortie</th><th>Durée (s)</th><th>URL</th><th>Nom_Page</th><th>Scroll_Max (%)</th><th>Clics</th><th>Copies</th><th>Collages</th>';
    th += '</tr></thead><tbody>';

    S.vis.forEach((v, index) => {
        var hEntree = tsT(v.ts, S.participantTz);
        var hSortie = (v.ts && v.tms > 0) ? tsT(new Date(v.ts).getTime() + v.tms, S.participantTz) : hEntree;
        th += '<tr>';
        th += '<td><span class="qb" style="background:' + (S.qc[v.q] || '#64748b') + '">' + v.q + '</span></td>';
        th += '<td class="m">' + v.vid + '</td>';
        th += '<td class="m">' + hEntree + '</td>';
        th += '<td class="m">' + hSortie + '</td>';
        th += '<td class="r">' + fr(v.tms / 1000) + '</td>';
        th += '<td><a href="' + esc(v.url) + '" target="_blank" class="lk">' + esc(v.nom) + '</a></td>';
        th += '<td>' + esc(v.nom) + '</td>';
        th += '<td class="r">' + v.scroll + '%</td>';
        th += '<td class="r">' + v.clics + '</td>';
        th += '<td class="w">' + esc(v.copies.join(TEXT_DELIMITER) || '—') + '</td>';
        th += '<td class="w">' + esc(v.collages.join(TEXT_DELIMITER) || '—') + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-nav').innerHTML = th;
}

function renderCopyPasteTab() {
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question</th><th>Type_Action</th><th>Timestamp_Exact</th><th>URL</th><th>Texte_Extrait</th>';
    th += '</tr></thead><tbody>';

    S.vis.forEach(v => {
        var h = tsT(v.ts, S.participantTz);
        v.copies.forEach(c => {
            th += '<tr><td>' + v.q + '</td><td><span class="tg" style="background:#e6f4ea;color:#137333;">Copie</span></td><td class="m">' + h + '</td><td>' + esc(v.url) + '</td><td class="w">' + esc(c) + '</td></tr>';
        });
        v.collages.forEach(c => {
            th += '<tr><td>' + v.q + '</td><td><span class="tg" style="background:#feefc3;color:#b06000;">Collage</span></td><td class="m">' + h + '</td><td>' + esc(v.url) + '</td><td class="w">' + esc(c) + '</td></tr>';
        });
    });
    th += '</tbody></table></div>';
    document.getElementById('p-copypaste').innerHTML = th;
}

function renderResearchTab() {
    var reps = S.reps.filter(r => r.type === 'research_answer' || r.type === 'memory_answer');
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question_ID</th><th>Difficulté</th><th>Heure_Soumission</th><th>Temps (s)</th><th>Réponse Textuelle</th><th>Mots</th><th>MATTR</th><th>MTLD</th>';
    th += '</tr></thead><tbody>';

    reps.forEach(r => {
        var d = r.data || {};
        var answerText = extractResponseText(d);
        var wordCount = tokenizeText(answerText).length;
        var mattr = calculateMATTR(answerText);
        var mtld = calculateMTLD(answerText);

        th += '<tr>';
        th += '<td><strong>' + esc(r.questionId || r.type) + '</strong></td>';
        th += '<td>' + esc(r.difficulty || d.difficulty || '—') + '</td>';
        th += '<td class="m">' + tsT(r.timestamp, S.participantTz) + '</td>';
        th += '<td class="r">' + (d.timeSpentSeconds || '—') + 's</td>';
        th += '<td class="w"><strong>' + esc(answerText) + '</strong></td>';
        th += '<td class="r">' + wordCount + '</td>';
        th += '<td class="r"><strong>' + mattr + '</strong></td>';
        th += '<td class="r"><strong>' + mtld + '</strong></td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-research').innerHTML = th;
}

function renderEvalTab() {
    var reps = S.reps.filter(r => r.type !== 'research_answer' && r.type !== 'memory_answer');
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Heure</th><th>Type_Evaluation</th><th>QuestionID</th><th>Données / Réponses</th>';
    th += '</tr></thead><tbody>';

    reps.forEach(r => {
        th += '<tr>';
        th += '<td class="m">' + tsT(r.timestamp, S.participantTz) + '</td>';
        th += '<td><span class="tg">' + esc(r.type) + '</span></td>';
        th += '<td>' + esc(r.questionId || '—') + '</td>';
        th += '<td class="w">' + esc(JSON.stringify(r.data || {})) + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-eval').innerHTML = th;
}

function renderChronoTab() {
    var items = [];
    S.vis.forEach(v => {
        items.push({ ts: v.ts, src: 'Navigation', q: v.q, type: 'navigation', url: v.url, details: v.nom });
    });
    S.reps.forEach(r => {
        items.push({ ts: r.timestamp, src: 'Réponse', q: r.questionId || '', type: r.type, url: '', details: JSON.stringify(r.data || {}) });
    });
    items.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Source</th><th>Heure</th><th>Question</th><th>Type</th><th>Détails / URL</th>';
    th += '</tr></thead><tbody>';

    items.forEach(it => {
        th += '<tr>';
        th += '<td>' + it.src + '</td>';
        th += '<td class="m">' + tsT(it.ts, S.participantTz) + '</td>';
        th += '<td>' + esc(it.q) + '</td>';
        th += '<td><span class="tg">' + esc(it.type) + '</span></td>';
        th += '<td class="w">' + esc(it.details || it.url) + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-chrono').innerHTML = th;
}

// ═══════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE & ÉCOUTEURS
// ═══════════════════════════════════════════════════════
(function init() {
    var dropbox = document.getElementById('dropbox');
    var filein = document.getElementById('filein');
    const privateKeyFileInput = document.getElementById('private-key-file');
    const keyStatus = document.getElementById('key-status');

    if (dropbox && filein) {
        dropbox.addEventListener('click', function() { filein.click(); });
        filein.addEventListener('change', function(e) {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        dropbox.addEventListener('dragover', function(e) { e.preventDefault(); dropbox.classList.add('over'); });
        dropbox.addEventListener('dragleave', function() { dropbox.classList.remove('over'); });
        dropbox.addEventListener('drop', function(e) {
            e.preventDefault(); dropbox.classList.remove('over');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });
    }

    if (privateKeyFileInput) {
        privateKeyFileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const content = e.target.result;
                try {
                    researcherPrivateKey = await importPrivateKey(content);
                    sessionStorage.setItem('tracker_private_key_pem', content);
                    if (keyStatus) {
                        keyStatus.textContent = "✅ Clé privée active - Déchiffrement à la volée opérationnel";
                        keyStatus.style.color = "#10b981";
                    }
                } catch (err) {
                    if (keyStatus) {
                        keyStatus.textContent = "❌ Clé de déchiffrement invalide";
                        keyStatus.style.color = "#ef4444";
                    }
                    researcherPrivateKey = null;
                }
            };
            reader.readAsText(file);
        });
    }

    const savedKeyPem = sessionStorage.getItem('tracker_private_key_pem');
    if (savedKeyPem) {
        importPrivateKey(savedKeyPem).then(function(cryptoKey) {
            researcherPrivateKey = cryptoKey;
            if (keyStatus) {
                keyStatus.textContent = "✅ Clé privée héritée active";
                keyStatus.style.color = "#10b981";
            }
        }).catch(function() {
            sessionStorage.removeItem('tracker_private_key_pem');
        });
    }

    var params = new URLSearchParams(window.location.search);
    var pid = params.get('pid');

    // 1. Tente de charger depuis sessionStorage si redirigé par le bouton "Analyser"
    if (pid && loadFromSessionStorage()) {
        return;
    }

    // 2. Sinon charge depuis l'API backend
    if (pid) {
        loadFromAPI(pid);
        return;
    }
})();