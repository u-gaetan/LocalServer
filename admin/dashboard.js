'use strict';

var S = null;
var CHARTS = {};
var metInit = false;
var researcherPrivateKey = null;
var PAL = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#84cc16','#a855f7','#14b8a6','#f43f5e','#eab308'];

const SKILLS_MAP = {
    "item_1": "1_Telecharger_Fichiers", "item_2": "2_Sauvegarder_Photos", "item_3": "3_Raccourcis_Clavier",
    "item_4": "4_Ouvrir_Onglet", "item_5": "5_Signet_Favoris", "item_6": "6_Cliquer_Lien",
    "item_7": "7_Diff_Mots_Cles", "item_8": "8_Diff_Retrouver_Site", "item_9": "9_Fatigue_Recherche",
    "item_10": "10_Nav_Involontaire", "item_11": "11_Confusion_Ergo", "item_12": "12_Besoin_Cours",
    "item_13": "13_Diff_Verif_Info", "item_14": "14_Partage_Securite", "item_15": "15_Quand_Partager",
    "item_16": "16_Comportement_Net", "item_17": "17_Reglage_Confid", "item_18": "18_Supprimer_Amis",
    "item_19": "19_Creation_Contenu", "item_20": "20_Modif_Contenu", "item_21": "21_Concevoir_Site",
    "item_22": "22_Licences_Web", "item_23": "23_Confiance_Publier", "item_24": "24_Installer_App",
    "item_25": "25_Telecharger_App", "item_26": "26_Suivi_Couts_App"
};

// =========================================================
// HELPERS
// =========================================================
function formatExcerptList(arr) {
    if (!arr || arr.length === 0) return '—';
    return arr.map((txt, idx) => `[${idx + 1}] "${txt}"`).join('\n---\n');
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

function formatTime(ts) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('fr-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) { return ''; }
}

function tokenizeText(text) {
    if (!text || typeof text !== 'string') return [];
    return text.toLowerCase().replace(/[^\w\s\u00C0-\u024F]/g, ' ').split(/\s+/).filter(w => w.length > 0);
}

function calculateMATTR(text, windowSize = 50) {
    const tokens = tokenizeText(text);
    if (tokens.length === 0) return 0;
    if (tokens.length < windowSize) return +(new Set(tokens).size / tokens.length).toFixed(4);
    let totalTTR = 0;
    const numWindows = tokens.length - windowSize + 1;
    for (let i = 0; i < numWindows; i++) totalTTR += (new Set(tokens.slice(i, i + windowSize)).size / windowSize);
    return +(totalTTR / numWindows).toFixed(4);
}

function calculateMTLD(text, factorThreshold = 0.72) {
    const tokens = tokenizeText(text);
    if (tokens.length === 0) return 0;
    function getFactors(wordList) {
        let factors = 0, current = [];
        for (let i = 0; i < wordList.length; i++) {
            current.push(wordList[i]);
            if ((new Set(current).size / current.length) < factorThreshold) { factors++; current = []; }
        }
        if (current.length > 0) factors += Math.min(1, Math.max(0, (1 - (new Set(current).size / current.length)) / (1 - factorThreshold)));
        return factors === 0 ? 1 : factors;
    }
    return +(tokens.length / ((getFactors(tokens) + getFactors([...tokens].reverse())) / 2)).toFixed(2);
}

function shortUrl(u) {
    if (!u) return '?';
    if (u.startsWith('chrome://')) return 'Nouvel onglet';
    if (u.includes('/questionnaire/')) {
        var sl = u.split('/questionnaire/')[1];
        if (sl) sl = sl.split('?')[0].replace(/\/$/, '');
        return sl ? 'Questionnaire/' + sl : 'Questionnaire';
    }
    if (u.includes('google.') && u.includes('/search')) {
        try { var q = new URL(u).searchParams.get('q'); return q ? 'Recherche: "' + q + '"' : 'Google'; }
        catch (e) { return 'Google'; }
    }
    try {
        var p = new URL(u), d = p.hostname.replace('www.', ''), pt = p.pathname.replace(/\/$/, '');
        if (pt && pt !== '/' && pt.length < 30) return d + pt;
        return d || u.substring(0, 40);
    } catch (e) { return u.substring(0, 40); }
}

function fr(n, d) { return Number(n || 0).toFixed(d === undefined ? 1 : d).replace('.', ','); }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function svgSym(clic, copy, paste, closed) {
    var cc = [];
    if (clic) cc.push('#6366f1');
    if (copy) cc.push('#059669');
    if (paste) cc.push('#0891b2');
    if (!cc.length) cc.push('#64748b');
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
    if (cc.length === 1) s += '<circle cx="50" cy="50" r="46" fill="' + cc[0] + '"/>';
    else if (cc.length === 2) {
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

// =========================================================
// TRAITEMENT ET AGREGATION DES DONNÉES
// =========================================================
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
        periods.push({ label: lb, type: r.type, qid: r.questionId || '', start: i > 0 ? sorted[i - 1].timestamp : null, end: r.timestamp, data: r.data || {} });
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
    var logs = Array.isArray(raw) ? raw : (raw.events || []);
    var reps = Array.isArray(raw) ? [] : (raw.reponses || []);

    var periods = mkPeriods(reps);
    var qc = {}; periods.forEach((p, i) => { qc[p.label] = PAL[i % PAL.length]; });

    var vis = [], vById = {}, prev = null, tStk = {}, tPtr = {};
    logs.forEach(log => {
        var t = log.type, url = log.url || '', vid = log.visitId;
        if (t === 'navigation' || t === 'tab_activated') {
            var tid = log.tabId, ib = false, ifw = false;
            if (log.transitionType === 'back_forward') ib = true;
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
            for (var i = vis.length - 1; i >= 0; i--) { if (vis[i].tid === log.tabId) { vis[i].closed = true; break; } }
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

    // CUMUL PARFAIT TOUTES VISITES CONFONDUES PAR SITE
    var uO = [], uG = {};
    vis.forEach(v => {
        var u = v.url;
        if (!uG[u]) {
            uO.push(u);
            uG[u] = { url: u, nom: v.nom, tms: 0, scroll: 0, clics: 0, touches_clavier: 0, copies: [], collages: [], nb: 0, visits: [] };
        }
        var g = uG[u];
        g.tms += v.tms; // CUMUL TEMPS
        g.scroll = Math.max(g.scroll, v.scroll);
        g.clics += v.clics; // CUMUL CLICS
        g.touches_clavier += v.touches_clavier;
        g.copies = g.copies.concat(v.copies);
        g.collages = g.collages.concat(v.collages);
        g.nb++;
        g.visits.push(v); // Stockage de chaque visite individuelle
    });
    var vr = uO.map(u => uG[u]);

    var tot = { clics: 0, copies: 0, collages: 0, touches_clavier: 0, temps: 0, back: 0, fwd: 0, closed: 0, tabs: {}, pages: vr.length };
    vis.forEach(v => {
        tot.clics += v.clics; tot.copies += v.copies.length; tot.collages += v.collages.length;
        tot.touches_clavier += v.touches_clavier; tot.temps += v.tms;
        if (v.ib) tot.back++; if (v.closed) tot.closed++;
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
    reps.forEach(r => {
        if (r.type === 'consent') consent1 = (r.data && r.data.consent) ? "✅ Accepté" : "❌ Refusé";
        if (r.type === 'deception_consent') consent2 = (r.data && r.data.decision === 'maintain') ? "✅ Maintenu" : "🚨 RETIRÉ";
    });

    S = { vis: vis, reps: reps, periods: periods, qc: qc, vr: vr, tot: tot, duree: duree, consent1: consent1, consent2: consent2 };
    return S;
}

// =========================================================
// GESTION DES ONGLETS DÉDIÉS
// =========================================================
function sw(id, btn) {
    document.querySelectorAll('.pan').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    document.getElementById('p-' + id).classList.add('on');
    btn.classList.add('on');
    if (id === 'met' && !metInit) { metInit = true; renderMetrics(); }
    setTimeout(() => { Object.values(CHARTS).forEach(c => { if (c && c.resize) c.resize(); }); }, 100);
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
}

// =========================================================
// RENDU GLOBAL
// =========================================================
function render() {
    renderHeader();
    renderTabs();
    renderTree();
    renderNavTab();
    renderCopiesTab();
    renderResearchTab();
    renderEvalTab();
    renderGlobTab();
}

function renderHeader() {
    var t = S.tot;
    var h = '<span>' + S.vis.length + ' visites</span>';
    h += '<span>' + t.pages + ' pages distinctes</span>';
    h += '<span>' + t.tabCount + ' onglets</span>';
    h += '<span>Durée : ' + S.duree + '</span>';
    
    var c1 = S.consent1, c2 = S.consent2;
    h += '<div style="margin-left:auto; display:flex; gap:10px;">';
    h += '<span style="background:#d1fae5; color:#065f46; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px;">C1: ' + c1 + '</span>';
    h += '<span style="background:#d1fae5; color:#065f46; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px;">C2: ' + c2 + '</span>';
    h += '</div>';
    document.getElementById('header-meta').innerHTML = h;
}

function renderTabs() {
    var h = '<button class="tb on" onclick="sw(\'tree\',this)">Arbre</button>';
    h += '<button class="tb" onclick="sw(\'met\',this)">Métriques</button>';
    h += '<button class="tb" onclick="sw(\'nav\',this)">Navigation</button>';
    h += '<button class="tb" onclick="sw(\'cp\',this)">Copies & Collages</button>';
    h += '<button class="tb" onclick="sw(\'res\',this)">Réponses Recherche</button>';
    h += '<button class="tb" onclick="sw(\'eval\',this)">Auto-Évaluations</button>';
    h += '<button class="tb" onclick="sw(\'glob\',this)">Chronologie Globale</button>';
    document.getElementById('tabbar').innerHTML = h;
}

// 1. ARBRE
function renderTree() {
    var EX = 180, EY = 140, nodes = [], links = [], bof = {}, my = 0;
    S.vis.forEach((v, xi) => {
        var nid = 'n' + v.id, src = null, cv = 0;
        if (v.purl && v.purl !== "Demarrage de l'experience" && v.purl !== 'Ouverture directe / Nouvel onglet') {
            for (var i = v.id - 1; i >= 0; i--) {
                if (S.vis[i].url === v.purl) { src = 'n' + S.vis[i].id; break; }
            }
        }
        if (!src && v.pchron !== null) src = 'n' + v.pchron;
        var yy = (src && bof[src] !== undefined) ? bof[src] : 0;
        bof[nid] = yy;

        var nm = (v.q ? '[' + v.q + '] ' : '') + v.nom;
        nodes.push({
            id: nid, name: nm, x: xi * EX, y: yy,
            symbol: svgSym(v.clics > 0, v.copies.length > 0, v.collages.length > 0, v.closed),
            symbolSize: v.closed ? 30 : 22,
            label: { show: true, position: 'bottom', fontSize: 11, color: '#475569' }
        });
        if (src) links.push({ source: src, target: nid, lineStyle: { color: '#94a3b8', width: 1.5 } });
    });

    var h = '<div class="cb" style="height:600px;overflow:auto;"><div id="c-tree" style="width:' + Math.max(1200, S.vis.length * 180) + 'px;height:500px;"></div></div>';
    document.getElementById('p-tree').innerHTML = h;

    var chart = echarts.init(document.getElementById('c-tree'));
    CHARTS.tree = chart;
    chart.setOption({
        tooltip: { trigger: 'item' },
        series: [{ type: 'graph', layout: 'none', data: nodes, links: links, roam: true, zoom: 0.9 }]
    });
}

// 2. MÉTRIQUES (Correction Cumul + Histogramme Découpé par Visite)
function renderMetrics() {
    var t = S.tot;
    var h = '<div class="sr">';
    h += '<div class="sc"><div class="sl">Pages Distinctes</div><div class="sv">' + t.pages + '</div></div>';
    h += '<div class="sc"><div class="sl">Temps Total</div><div class="sv">' + fr(t.temps / 1000, 0) + 's</div></div>';
    h += '<div class="sc"><div class="sl">Clics Totaux</div><div class="sv" style="color:#6366f1">' + t.clics + '</div></div>';
    h += '<div class="sc"><div class="sl">Touches Clavier</div><div class="sv" style="color:#f59e0b">' + t.touches_clavier + '</div></div>';
    h += '<div class="sc"><div class="sl">Copies</div><div class="sv" style="color:#059669">' + t.copies + '</div></div>';
    h += '<div class="sc"><div class="sl">Collages</div><div class="sv" style="color:#0891b2">' + t.collages + '</div></div>';
    h += '</div>';

    var ch = Math.max(300, S.vr.length * 45 + 80);
    h += '<div class="cg">';
    h += '<div class="cb cf"><h3>Temps par site (Découpé par Visite individuelle)</h3><div id="c-temps" style="height:' + ch + 'px"></div></div>';
    h += '<div class="cb"><h3>Interactions Globale</h3><div id="c-pie" style="height:300px"></div></div>';
    h += '<div class="cb"><h3>Clics par site (Cumul)</h3><div id="c-clics" style="height:300px"></div></div>';
    h += '</div>';
    document.getElementById('p-met').innerHTML = h;

    var labs = S.vr.map(g => g.nom);

    // HISTOGRAMME EMPILÉ : Découpe chaque barre en visites individuelles !
    var maxVisitsCount = Math.max(...S.vr.map(g => g.visits.length));
    var timeSeries = [];

    for (let i = 0; i < maxVisitsCount; i++) {
        var seriesData = S.vr.map(g => {
            var v = g.visits[i];
            return v ? +(v.tms / 1000).toFixed(1) : 0;
        });
        timeSeries.push({
            name: 'Visite ' + (i + 1),
            type: 'bar',
            stack: 'totalTime',
            data: seriesData,
            color: PAL[i % PAL.length]
        });
    }

    CHARTS.temps = echarts.init(document.getElementById('c-temps'));
    CHARTS.temps.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { show: true },
        grid: { left: 180, right: 40, top: 40, bottom: 30 },
        xAxis: { type: 'value', name: 's' },
        yAxis: { type: 'category', data: labs, inverse: true },
        series: timeSeries
    });

    // Pie chart
    CHARTS.pie = echarts.init(document.getElementById('c-pie'));
    CHARTS.pie.setOption({
        tooltip: { trigger: 'item' }, color: ['#6366f1', '#f59e0b', '#059669', '#0891b2'],
        series: [{ type: 'pie', radius: ['40%', '70%'], data: [{ name: 'Clics', value: t.clics }, { name: 'Clavier', value: t.touches_clavier }, { name: 'Copies', value: t.copies }, { name: 'Collages', value: t.collages }] }]
    });

    // Clics par site cumulé
    CHARTS.clics = echarts.init(document.getElementById('c-clics'));
    CHARTS.clics.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 140, right: 30, top: 10, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: labs, inverse: true },
        series: [{ type: 'bar', data: S.vr.map(g => g.clics), color: '#6366f1' }]
    });
}

// 3. FEUILLE 1 : NAVIGATION
function renderNavTab() {
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question</th><th>Visite_ID</th><th>Entrée</th><th>Sortie</th><th>Durée (s)</th><th>URL</th><th>Nom</th><th>Scroll %</th><th>Clics</th><th>Touches</th><th>Copies</th><th>Collages</th>';
    th += '</tr></thead><tbody>';

    S.vis.forEach((v, idx) => {
        var hE = formatTime(v.ts);
        var hS = '—';
        if (v.ts && v.tms > 0) hS = formatTime(new Date(v.ts).getTime() + v.tms);

        th += '<tr>';
        th += '<td><span class="qb" style="background:' + (S.qc[v.q] || '#64748b') + '">' + (v.q || '—') + '</span></td>';
        th += '<td><strong>' + (v.vid || '—') + '</strong></td>';
        th += '<td class="m">' + hE + '</td>';
        th += '<td class="m">' + hS + '</td>';
        th += '<td class="r">' + fr(v.tms / 1000) + '</td>';
        th += '<td><a href="' + esc(v.url) + '" target="_blank" class="lk">' + esc(v.nom) + '</a></td>';
        th += '<td>' + esc(v.nom) + '</td>';
        th += '<td class="r">' + v.scroll + '</td>';
        th += '<td class="r">' + v.clics + '</td>';
        th += '<td class="r">' + v.touches_clavier + '</td>';
        th += '<td class="r">' + v.copies.length + '</td>';
        th += '<td class="r">' + v.collages.length + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-nav').innerHTML = th;
}

// 4. FEUILLE 2 : COPIES & COLLAGES
function renderCopiesTab() {
    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question</th><th>Type Action</th><th>Timestamp Exact</th><th>URL</th><th>Texte Extrait</th>';
    th += '</tr></thead><tbody>';

    var count = 0;
    S.vis.forEach(v => {
        v.copies.forEach(txt => {
            count++;
            th += '<tr><td>' + (v.q || '—') + '</td><td><span class="tg" style="background:#059669;color:#fff">copie</span></td><td class="m">' + formatTime(v.ts) + '</td><td>' + esc(v.url) + '</td><td class="w">' + esc(txt) + '</td></tr>';
        });
        v.collages.forEach(txt => {
            count++;
            th += '<tr><td>' + (v.q || '—') + '</td><td><span class="tg" style="background:#0891b2;color:#fff">collage</span></td><td class="m">' + formatTime(v.ts) + '</td><td>' + esc(v.url) + '</td><td class="w">' + esc(txt) + '</td></tr>';
        });
    });
    if (!count) th += '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8">Aucun texte copié ou collé</td></tr>';
    th += '</tbody></table></div>';
    document.getElementById('p-cp').innerHTML = th;
}

// 5. FEUILLE 3 : RÉPONSES RECHERCHE
function renderResearchTab() {
    var reps = S.reps.filter(r => r.type === 'research_answer' || r.type === 'memory_answer')
                    .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Question ID</th><th>Difficulté</th><th>Heure Soumission</th><th>Réponse Rédigée</th><th>Mots</th><th>MATTR</th><th>MTLD</th><th>Copies</th><th>Collages</th>';
    th += '</tr></thead><tbody>';

    reps.forEach(r => {
        var d = r.data || {};
        var answerText = extractResponseText(d);
        var wordCount = tokenizeText(answerText).length;
        var mattr = calculateMATTR(answerText);
        var mtld = calculateMTLD(answerText);
        var diff = r.difficulty || d.difficulty || '—';

        var qCopiesList = []; var qPastesList = [];
        S.vis.filter(v => v.q === getQL(r.timestamp, S.periods)).forEach(v => {
            qCopiesList = qCopiesList.concat(v.copies);
            qPastesList = qPastesList.concat(v.collages);
        });

        th += '<tr>';
        th += '<td><strong>' + esc(r.questionId || r.type) + '</strong></td>';
        th += '<td>' + esc(diff) + '</td>';
        th += '<td class="m">' + formatTime(r.timestamp) + '</td>';
        th += '<td class="w"><strong>' + esc(answerText) + '</strong></td>';
        th += '<td class="r">' + wordCount + '</td>';
        th += '<td class="r"><strong>' + mattr + '</strong></td>';
        th += '<td class="r"><strong>' + mtld + '</strong></td>';
        th += '<td class="w">' + esc(formatExcerptList(qCopiesList)) + '</td>';
        th += '<td class="w">' + esc(formatExcerptList(qPastesList)) + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-res').innerHTML = th;
}

// 6. FEUILLE 4 : AUTO-ÉVALUATIONS
function renderEvalTab() {
    var reps = S.reps.filter(r => r.type !== 'research_answer' && r.type !== 'memory_answer')
                    .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Heure</th><th>Type Évaluation</th><th>Question ID</th><th>Label</th><th>Données Réponse</th>';
    th += '</tr></thead><tbody>';

    reps.forEach(r => {
        var d = r.data || {};
        var answerText = extractResponseText(d);
        th += '<tr>';
        th += '<td class="m">' + formatTime(r.timestamp) + '</td>';
        th += '<td><span class="tg">' + esc(r.type) + '</span></td>';
        th += '<td><strong>' + esc(r.questionId || '') + '</strong></td>';
        th += '<td>' + esc(r.questionLabel || '') + '</td>';
        th += '<td class="w">' + esc(answerText) + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-eval').innerHTML = th;
}

// 7. FEUILLE 5 : CHRONOLOGIE GLOBALE
function renderGlobTab() {
    var items = [];
    S.vis.forEach(v => {
        items.push({ ts: v.ts, type: 'Navigation', detail: v.url, q: v.q });
    });
    S.reps.forEach(r => {
        items.push({ ts: r.timestamp, type: 'Réponse (' + r.type + ')', detail: extractResponseText(r.data), q: r.questionId || '' });
    });
    items.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

    var th = '<div class="tw"><table><thead><tr>';
    th += '<th>Heure</th><th>Source</th><th>Question</th><th>Détails Événement</th>';
    th += '</tr></thead><tbody>';

    items.forEach(it => {
        th += '<tr>';
        th += '<td class="m">' + formatTime(it.ts) + '</td>';
        th += '<td><strong>' + esc(it.type) + '</strong></td>';
        th += '<td>' + esc(it.q) + '</td>';
        th += '<td class="w">' + esc(it.detail) + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-glob').innerHTML = th;
}

// =========================================================
// INITIALISATION
// =========================================================
(function init() {
    var dropbox = document.getElementById('dropbox');
    var filein = document.getElementById('filein');
    dropbox.addEventListener('click', () => filein.click());
    filein.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });

    var params = new URLSearchParams(window.location.search);
    var pid = params.get('pid');

    if (pid) {
        fetch('/api/collecte/export/participant/' + encodeURIComponent(pid) + '?include_responses=true')
            .then(r => r.json())
            .then(data => { process(data); showDash(); });
    }
})();

function handleFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var raw = JSON.parse(e.target.result);
        process(raw);
        showDash();
    };
    reader.readAsText(file);
}