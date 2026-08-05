// dashboard.js (Modifié)

'use strict';

// ═══════════════════════════════════════════════════════
// ÉTAT GLOBAL ET CRYPTO
// ═══════════════════════════════════════════════════════
var S = null;
var CHARTS = {};
var metInit = false;
var researcherPrivateKey = null; // Stocke la clé de déchiffrement
var PAL = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#84cc16','#a855f7','#14b8a6','#f43f5e','#eab308'];

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
// MODULE DÉCHIFFREMENT WEB CRYPTO (CSFLE CLIENT-SIDE)
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
        return "[🔒 Champ Chiffré]";
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
        console.error("Échec déchiffrement :", err);
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
// UTILITAIRES D'AFFICHAGE
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
        try { var q = new URL(u).searchParams.get('q'); return q ? 'Recherche: "' + q + '"' : 'Google'; }
        catch (e) { return 'Google'; }
    }
    try {
        var p = new URL(u), d = p.hostname.replace('www.', ''), pt = p.pathname.replace(/\/$/, '');
        if (pt && pt !== '/' && pt.length < 30) return d + pt;
        return d || u.substring(0, 40);
    } catch (e) { return u.substring(0, 40); }
}

function tsT(ts) {
    if (!ts) return '';
    try { return new Date(ts).toTimeString().substring(0, 8); }
    catch (e) { return ''; }
}

function fr(n, d) {
    if (d === undefined) d = 1;
    return Number(n).toFixed(d).replace('.', ',');
}

function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

// ═══════════════════════════════════════════════════════
// PÉRIODES DE QUESTIONS
// ═══════════════════════════════════════════════════════
function mkPeriods(reps) {
    if (!reps || !reps.length) return [];
    var sorted = reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) {
        return (a.timestamp || '').localeCompare(b.timestamp || '');
    });
    var periods = [], rc = 0;
    sorted.forEach(function(r, i) {
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

// ═══════════════════════════════════════════════════════
// TRAITEMENT DES DONNÉES
// ═══════════════════════════════════════════════════════
function process(raw) {
    var logs, reps;
    if (Array.isArray(raw)) { logs = raw; reps = []; }
    else { logs = raw.events || []; reps = raw.reponses || []; }

    var periods = mkPeriods(reps);
    var qc = {};
    periods.forEach(function(p, i) { qc[p.label] = PAL[i % PAL.length]; });

    var vis = [], vById = {}, prev = null, tStk = {}, tPtr = {};
    logs.forEach(function(log) {
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
            delete tStk[tid2]; delete tPtr[tid2];
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
    vis.forEach(function(v) {
        var u = v.url;
        if (!uG[u]) {
            uO.push(u);
            uG[u] = { url: u, nom: v.nom, tms: 0, scroll: 0, clics: 0, touches_clavier: 0,
                copies: [], collages: [], nb: 0, back: 0, fwd: 0, closed: 0, qs: {} };
        }
        var g = uG[u];
        g.tms += v.tms; g.scroll = Math.max(g.scroll, v.scroll);
        g.clics += v.clics; g.touches_clavier += v.touches_clavier; g.copies = g.copies.concat(v.copies);
        g.collages = g.collages.concat(v.collages);
        g.nb++;
        if (v.ib) g.back++; if (v.ifw) g.fwd++; if (v.closed) g.closed++;
        if (v.q) g.qs[v.q] = true;
    });
    var vr = uO.map(function(u) { return uG[u]; });

    var tot = { clics: 0, copies: 0, collages: 0, touches_clavier: 0, temps: 0, back: 0, fwd: 0, closed: 0, tabs: {}, pages: vr.length };
    vis.forEach(function(v) {
        tot.clics += v.clics; tot.copies += v.copies.length;
        tot.collages += v.collages.length;
        tot.touches_clavier += v.touches_clavier;
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

    var allQ = [], seenQ = {};
    vis.forEach(function(v) {
        if (v.q && !seenQ[v.q]) { allQ.push(v.q); seenQ[v.q] = true; }
    });

    var nrep = reps.filter(function(r) { return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills'); }).length;

    var consent1 = "Non spécifié", consent2 = "Non spécifié";
    reps.forEach(function(r) {
        if (r.type === 'consent') {
            consent1 = (r.data && r.data.consent) ? "✅ Accepté" : "❌ Refusé";
        }
        if (r.type === 'deception_consent') {
            consent2 = (r.data && r.data.decision === 'maintain') ? "✅ Maintenu" : "🚨 RETIRÉ";
        }
    });

    S = { vis: vis, reps: reps, periods: periods, qc: qc, vr: vr, tot: tot,
        duree: duree, allQ: allQ, nrep: nrep, consent1: consent1, consent2: consent2 };
    return S;
}

// ═══════════════════════════════════════════════════════
// CHARGEMENT ET DÉCHIFFREMENT LOCAL
// ═══════════════════════════════════════════════════════
function handleFile(file) {
    setLoading('Chargement du fichier...');
    var reader = new FileReader();
    reader.onload = async function(e) {
        try {
            var raw = JSON.parse(e.target.result);
            
            // Déchiffrement CSFLE transparent si la clé est chargée
            if (researcherPrivateKey) {
                raw = await decryptParticipantDataInPlace(raw);
            }

            process(raw);
            showDash();
        } catch (err) {
            setLoading('❌ Erreur : ' + err.message);
        }
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
    fetch('/api/collecte/export/participant/' + encodeURIComponent(pid) + '?include_responses=true')
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(async function(data) {
            // Déchiffrement si la clé privée est active localement
            if (researcherPrivateKey) {
                data = await decryptParticipantDataInPlace(data);
            }
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

// ═══════════════════════════════════════════════════════
// ONGLETS
// ═══════════════════════════════════════════════════════
function sw(id, btn) {
    document.querySelectorAll('.pan').forEach(function(p) { p.classList.remove('on'); });
    document.querySelectorAll('.tb').forEach(function(b) { b.classList.remove('on'); });
    document.getElementById('p-' + id).classList.add('on');
    btn.classList.add('on');
    if (id === 'met' && !metInit) { metInit = true; renderMetrics(); }
    setTimeout(function() {
        Object.values(CHARTS).forEach(function(c) { if (c && c.resize) c.resize(); });
    }, 100);
}

// ═══════════════════════════════════════════════════════
// RENDU DU DASHBOARD
// ═══════════════════════════════════════════════════════
function render() {
    renderHeader();
    renderTabs();
    renderTree();
    renderDetail();
    renderAgg();
    renderRep();
}

function renderHeader() {
    var t = S.tot;
    var h = '<span>' + S.vis.length + ' visites</span>';
    h += '<span>' + t.pages + ' pages</span>';
    h += '<span>' + t.tabCount + ' onglets</span>';
    h += '<span>Durée : ' + S.duree + '</span>';
    h += '<span>' + t.back + ' back / ' + t.fwd + ' fwd</span>';
    
    var totalReps = S.reps ? S.reps.length : 0;
    h += '<span>' + totalReps + ' réponses</span>';
    
    var c1 = S.consent1 || "Non spécifié";
    var c2 = S.consent2 || "Non spécifié";
    
    var bg1 = c1.includes('✅') ? '#d1fae5' : (c1.includes('❌') ? '#fee2e2' : '#f8fafc');
    var text1 = c1.includes('✅') ? '#065f46' : (c1.includes('❌') ? '#991b1b' : '#475569');
    
    var bg2 = c2.includes('✅') ? '#d1fae5' : (c2.includes('🚨') ? '#fee2e2' : '#f8fafc');
    var text2 = c2.includes('✅') ? '#065f46' : (c2.includes('🚨') ? '#991b1b' : '#475569');
    
    h += '<div style="margin-left:auto; display:flex; gap:10px;">';
    h += '<span style="background:'+bg1+'; color:'+text1+'; font-weight:700; padding:4px 12px; border-radius:20px; font-size:13px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">C1 : ' + c1 + '</span>';
    h += '<span style="background:'+bg2+'; color:'+text2+'; font-weight:700; padding:4px 12px; border-radius:20px; font-size:13px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">C2 : ' + c2 + '</span>';
    h += '</div>';
    
    document.getElementById('header-meta').innerHTML = h;
}

function renderTabs() {
    var h = '<button class="tb on" onclick="sw(\'tree\',this)">Arbre</button>';
    h += '<button class="tb" onclick="sw(\'met\',this)">Métriques</button>';
    h += '<button class="tb" onclick="sw(\'det\',this)">Détail</button>';
    h += '<button class="tb" onclick="sw(\'agg\',this)">Agrégé</button>';
    
    var totalReps = S.reps ? S.reps.length : 0;
    h += '<button class="tb" onclick="sw(\'rep\',this)">Réponses (' + totalReps + ')</button>';
    
    document.getElementById('tabbar').innerHTML = h;
}

// ═══════════════════════════════════════════════════════
// ARBRE DE NAVIGATION
// ═══════════════════════════════════════════════════════
function renderTree() {
    var EX = 180, EY = 140, nodes = [], links = [], bof = {}, my = 0;

    S.vis.forEach(function(v, xi) {
        var nid = 'n' + v.id, src = null, cv = 0;
        if (v.purl && v.purl !== "Demarrage de l'experience" && v.purl !== 'Ouverture directe / Nouvel onglet') {
            for (var i = v.id - 1; i >= 0; i--) {
                if (S.vis[i].url === v.purl) {
                    src = 'n' + S.vis[i].id;
                    cv = (v.tid && S.vis[i].tid && v.tid === S.vis[i].tid) ? 0 : 0.3;
                    break;
                }
            }
        }
        if (!src && v.pchron !== null) src = 'n' + v.pchron;
        var yy;
        if (src && bof[src] !== undefined) {
            if (cv > 0) { my += EY; yy = my; } else { yy = bof[src]; }
        } else { yy = 0; }
        bof[nid] = yy;

        var nm = v.nom;
        if (v.q) nm = '[' + v.q + '] ' + nm;
        if (v.closed) nm += ' [fermé]';
        var hr = tsT(v.ts), tss = fr(v.tms / 1000);
        var us = v.url.length > 60 ? v.url.substring(0, 57) + '...' : v.url;

        var tip = '<div style="max-width:350px;white-space:normal;padding:8px;font-size:13px;line-height:1.5;">';
        tip += '<div style="font-weight:600;color:#e2e8f0;word-break:break-all;">' + esc(us) + '</div>';
        if (v.q) {
            tip += '<div style="display:inline-block;background:' + (S.qc[v.q] || '#94a3b8') + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin:4px 0;">' + v.q + '</div>';
        }
        tip += '<hr style="border:none;border-top:1px solid #334155;margin:6px 0;">';
        if (v.ib) tip += '<div style="color:#f97316;font-weight:600;">← Retour arrière</div>';
        if (v.ifw) tip += '<div style="color:#3b82f6;font-weight:600;">→ Avant</div>';
        if (v.closed) tip += '<div style="color:#f87171;font-weight:600;">✖ Onglet fermé</div>';
        tip += '<table style="width:100%;font-size:12px;color:#cbd5e1;">';
        tip += '<tr><td>Heure</td><td style="text-align:right;font-weight:600;">' + hr + '</td></tr>';
        tip += '<tr><td>Temps</td><td style="text-align:right;font-weight:600;">' + tss + 's</td></tr>';
        tip += '<tr><td>Scroll</td><td style="text-align:right;font-weight:600;">' + v.scroll + '%</td></tr>';
        tip += '<tr><td>Clics</td><td style="text-align:right;font-weight:600;">' + v.clics + '</td></tr></table>';
        v.copies.forEach(function(c) { tip += '<div style="font-size:11px;color:#6ee7b7;white-space:pre-wrap;">📋 Copié: "' + esc(c) + '"</div>'; });
        v.collages.forEach(function(c) { tip += '<div style="font-size:11px;color:#67e8f9;white-space:pre-wrap;">📌 Collé: "' + esc(c) + '"</div>'; });
        tip += '<div style="margin-top:6px;"><a href="' + esc(v.url) + '" target="_blank" style="background:#3b82f6;color:#fff;padding:3px 10px;border-radius:4px;text-decoration:none;font-size:12px;">Ouvrir</a></div></div>';

        var ha = v.clics > 0 || v.copies.length > 0 || v.collages.length > 0;
        nodes.push({
            id: nid, name: nm, x: xi * EX, y: yy,
            symbol: svgSym(v.clics > 0, v.copies.length > 0, v.collages.length > 0, v.closed),
            symbolSize: v.closed ? 30 : (ha ? 26 : 18),
            label: { show: true, position: 'bottom', rotate: 30, align: 'left', verticalAlign: 'top', distance: 8, fontSize: 11, color: '#475569' },
            tip: tip
        });

        if (src) {
            var ls, el;
            if (v.ib) {
                ls = { curveness: cv, color: '#e87623', width: 2.5, type: 'dashed' };
                el = { show: true, formatter: '↩ BACK', fontSize: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#e87623', borderRadius: 3, padding: [2, 6] };
            } else if (v.ifw) {
                ls = { curveness: cv, color: '#2563eb', width: 2.5, type: 'dashed' };
                el = { show: true, formatter: '↪ FWD', fontSize: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#2563eb', borderRadius: 3, padding: [2, 6] };
            } else {
                ls = { curveness: cv, color: '#94a3b8', width: 1.5, type: 'solid' };
                el = null;
            }
            var lk = { source: src, target: nid, lineStyle: ls };
            if (el) lk.label = el;
            links.push(lk);
        }
    });

    var cw = Math.max(1200, S.vis.length * 180 + 200);
    var ch = Math.max(500, my + 300);
    var h = '<div class="cb" style="height:600px;overflow:auto;">';
    h += '<div id="c-tree" style="width:' + cw + 'px;height:' + ch + 'px;"></div></div>';
    
    h += '<div class="lg">';
    h += '<div class="li"><div class="lc" style="background:#6366f1"></div>Clics</div>';
    h += '<div class="li"><div class="lc" style="background:#059669"></div>Copies</div>';
    h += '<div class="li"><div class="lc" style="background:#0891b2"></div>Collages</div>';
    h += '<div class="li"><div class="lc" style="background:#64748b"></div>Aucune interaction</div>';
    h += '<div class="li"><div class="lc" style="background:#fff;border:3px solid #dc2626"></div>Onglet fermé</div>';
    h += '<div class="li"><span style="color:#e87623;font-weight:600;">- - ↩ BACK</span></div>';
    h += '<div class="li"><span style="color:#2563eb;font-weight:600;">- - ↪ FWD</span></div></div>';
    
    document.getElementById('p-tree').innerHTML = h;

    var chart = echarts.init(document.getElementById('c-tree'));
    CHARTS.tree = chart;
    chart.setOption({
        tooltip: {
            trigger: 'item', backgroundColor: '#1e293b', borderColor: '#334155', padding: 0,
            formatter: function(p) { return p.dataType === 'node' ? (p.data.tip || p.name) : ''; }
        },
        animationDuration: 600,
        series: [{
            type: 'graph', layout: 'none', data: nodes, links: links,
            edgeSymbol: ['none', 'arrow'], edgeSymbolSize: [0, 8],
            roam: true, zoom: 0.9, draggable: true,
            emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
            lineStyle: { opacity: 0.8 }
        }]
    });
}

// ═══════════════════════════════════════════════════════
// MÉTRIQUES
// ═══════════════════════════════════════════════════════
function mkSC(label, val, color) {
    var st = color ? ' style="color:' + color + '"' : '';
    return '<div class="sc"><div class="sl">' + label + '</div><div class="sv"' + st + '>' + val + '</div></div>';
}

function renderMetrics() {
    var t = S.tot;
    var h = '<div class="sr">';
    h += mkSC('Pages', t.pages, '');
    h += mkSC('Temps total', fr(t.temps / 1000, 0) + 's', '');
    h += mkSC('Clics', t.clics, '#6366f1');
    h += mkSC('Touches Clavier', t.touches_clavier, '#f59e0b');
    h += mkSC('Copies', t.copies, '#059669');
    h += mkSC('Collages', t.collages, '#0891b2');
    h += mkSC('Back', t.back, '#ea580c');
    h += mkSC('Fermés', t.closed, '#dc2626');
    h += '</div>';

    var ch = Math.max(280, S.vr.length * 40 + 80);
    h += '<div class="cg">';
    h += '<div class="cb cf"><h3>Temps par page (s)</h3><div id="c-temps" style="height:' + ch + 'px"></div></div>';
    h += '<div class="cb cf"><h3>Scroll (%)</h3><div id="c-scroll" style="height:' + ch + 'px"></div></div>';
    h += '<div class="cb"><h3>Interactions</h3><div id="c-pie" style="height:300px"></div></div>';
    h += '<div class="cb"><h3>Domaines</h3><div id="c-dom" style="height:300px"></div></div>';
    h += '</div>';
    document.getElementById('p-met').innerHTML = h;

    var labs = S.vr.map(function(g) { return g.nom; });
    var temps = S.vr.map(function(g) { return +(g.tms / 1000).toFixed(1); });
    var scrolls = S.vr.map(function(g) {
        return { value: g.scroll, itemStyle: { color: g.scroll >= 75 ? '#059669' : (g.scroll >= 40 ? '#d97706' : '#dc2626') } };
    });

    CHARTS.temps = echarts.init(document.getElementById('c-temps'));
    CHARTS.temps.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 180, right: 40, top: 10, bottom: 30 },
        xAxis: { type: 'value', name: 's' },
        yAxis: { type: 'category', data: labs, inverse: true, axisLabel: { fontSize: 11, width: 160, overflow: 'truncate' } },
        series: [{ type: 'bar', data: temps, color: '#3b82f6', label: { show: true, position: 'right', fontSize: 11 } }]
    });

    CHARTS.scroll = echarts.init(document.getElementById('c-scroll'));
    CHARTS.scroll.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 180, right: 40, top: 10, bottom: 30 },
        xAxis: { type: 'value', max: 100, name: '%' },
        yAxis: { type: 'category', data: labs, inverse: true, axisLabel: { fontSize: 11, width: 160, overflow: 'truncate' } },
        series: [{ type: 'bar', data: scrolls, label: { show: true, position: 'right', fontSize: 11, formatter: '{c}%' } }]
    });

    var pie = [];
    if (t.clics) pie.push({ name: 'Clics', value: t.clics });
    if (t.touches_clavier) pie.push({ name: 'Touches Clavier', value: t.touches_clavier });
    if (t.copies) pie.push({ name: 'Copies', value: t.copies });
    if (t.collages) pie.push({ name: 'Collages', value: t.collages });
    if (!pie.length) pie.push({ name: 'Aucune', value: 1 });
    CHARTS.pie = echarts.init(document.getElementById('c-pie'));
    CHARTS.pie.setOption({
        tooltip: { trigger: 'item' }, color: ['#6366f1', '#f59e0b', '#059669', '#0891b2', '#94a3b8'],
        series: [{ type: 'pie', radius: ['40%', '70%'], data: pie, label: { fontSize: 12 }, emphasis: { itemStyle: { shadowBlur: 10 } } }]
    });

    var doms = {};
    S.vr.forEach(function(g) {
        try { var d = new URL(g.url).hostname.replace('www.', ''); doms[d] = (doms[d] || 0) + g.nb; } catch (e) {}
    });
    var ds = Object.entries(doms).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
    CHARTS.dom = echarts.init(document.getElementById('c-dom'));
    CHARTS.dom.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 140, right: 30, top: 10, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: ds.map(function(d) { return d[0]; }), inverse: true, axisLabel: { fontSize: 11, width: 120, overflow: 'truncate' } },
        series: [{ type: 'bar', data: ds.map(function(d) { return d[1]; }), color: '#8b5cf6', label: { show: true, position: 'right', fontSize: 11 } }]
    });
}

// ═══════════════════════════════════════════════════════
// TABLEAU DÉTAILLÉ
// ═══════════════════════════════════════════════════════
function renderDetail() {
    var fh = '';
    if (S.allQ.length) {
        fh = '<div class="qf"><span class="qft">Filtrer :</span>';
        fh += '<label class="qfc"><input type="checkbox" checked onchange="togAll(this)"> Toutes</label>';
        S.allQ.forEach(function(q) {
            fh += '<label class="qfc"><input type="checkbox" checked data-q="' + q + '" onchange="filtQ()">';
            fh += ' <span class="qd" style="background:' + (S.qc[q] || '#64748b') + '"></span> ' + q + '</label>';
        });
        fh += '</div>';
    }

    var bh = '<div class="bar">';
    bh += '<button class="bt bg" onclick="dlXLSX()">⬇ Télécharger Excel (3 feuilles)</button>';
    bh += '<button class="bt bp" onclick="csvNav()">⬇ CSV Navigation</button>';
    bh += '<button class="bt bs" onclick="csvRep()">⬇ CSV Réponses</button>';
    bh += '<span class="cnt" id="dcnt">' + S.vis.length + ' lignes</span></div>';

    var th = '<div class="tw"><table id="dtbl"><thead><tr>';
    th += '<th>Question</th><th>Heure</th><th>Page</th><th>Temps (s)</th>';
    th += '<th>Scroll (%)</th><th>Clics</th><th>Touches Clavier</th><th>Copies</th><th>Collages</th>';
    th += '<th>Fermé</th><th>Backward</th><th>Forward</th>';
    th += '</tr></thead><tbody>';

    S.vis.forEach(function(v) {
        var q = v.q, qcc = S.qc[q] || '#64748b';
        var qb = q ? '<span class="qb" style="background:' + qcc + '">' + q + '</span>' : '—';
        th += '<tr data-q="' + q + '">';
        th += '<td>' + qb + '</td>';
        th += '<td class="m">' + tsT(v.ts) + '</td>';
        th += '<td><a href="' + esc(v.url) + '" target="_blank" class="lk">' + esc(v.nom) + '</a></td>';
        th += '<td class="r">' + fr(v.tms / 1000) + '</td>';
        th += '<td class="r">' + v.scroll + '</td>';
        th += '<td class="r">' + v.clics + '</td>';
        th += '<td class="r">' + v.touches_clavier + '</td>';
        th += '<td class="w">' + esc(v.copies.join('\n') || '—') + '</td>';
        th += '<td class="w">' + esc(v.collages.join('\n') || '—') + '</td>';
        th += '<td class="r">' + (v.closed ? 'Oui' : '') + '</td>';
        th += '<td class="r">' + (v.ib ? 'Oui' : '') + '</td>';
        th += '<td class="r">' + (v.ifw ? 'Oui' : '') + '</td>';
        th += '</tr>';
    });
    th += '</tbody></table></div>';
    document.getElementById('p-det').innerHTML = fh + bh + th;
}

// ═══════════════════════════════════════════════════════
// TABLEAU AGRÉGÉ
// ═══════════════════════════════════════════════════════
function renderAgg() {
    var h = '<div class="tw"><table><thead><tr>';
    h += '<th>Questions</th><th>Visites</th><th>Page</th><th>Temps (s)</th>';
    h += '<th>Scroll (%)</th><th>Clics</th><th>Touches Clavier</th><th>Copies</th><th>Collages</th>';
    h += '<th>Backward</th><th>Forward</th><th>Fermé</th>';
    h += '</tr></thead><tbody>';
    S.vr.forEach(function(g) {
        h += '<tr>';
        h += '<td>' + (Object.keys(g.qs).sort().join(', ') || '—') + '</td>';
        h += '<td class="r">' + g.nb + '</td>';
        h += '<td><a href="' + esc(g.url) + '" target="_blank" class="lk">' + esc(g.nom) + '</a></td>';
        h += '<td class="r">' + fr(g.tms / 1000) + '</td>';
        h += '<td class="r">' + g.scroll + '</td>';
        h += '<td class="r">' + g.clics + '</td>';
        h += '<td class="r">' + g.touches_clavier + '</td>';
        h += '<td class="w">' + esc(g.copies.join('\n') || '—') + '</td>';
        h += '<td class="w">' + esc(g.collages.join('\n') || '—') + '</td>';
        h += '<td class="r">' + (g.back ? 'Oui' : '') + '</td>';
        h += '<td class="r">' + (g.fwd ? 'Oui' : '') + '</td>';
        h += '<td class="r">' + (g.closed ? 'Oui' : '') + '</td>';
        h += '</tr>';
    });
    h += '</tbody></table></div>';
    document.getElementById('p-agg').innerHTML = h;
}

// ═══════════════════════════════════════════════════════
// TABLEAU RÉPONSES
// ═══════════════════════════════════════════════════════
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

function renderRep() {
    var reps = S.reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) {
        return (a.timestamp || '').localeCompare(b.timestamp || '');
    });

    var h = '<div class="bar"><button class="bt bs" onclick="csvRep()">⬇ CSV Réponses</button>';
    h += '<span class="cnt">' + reps.length + ' réponses</span></div>';
    h += '<div class="tw"><table><thead><tr>';
    h += '<th>Heure</th><th>Type</th><th>Question ID</th><th>Difficulté</th><th>Temps (s)</th><th>Réponse Rédigée</th><th>Mots</th><th>MATTR</th><th>MTLD</th>';
    h += '</tr></thead><tbody>';

    reps.forEach(function(r) {
        var d = r.data || {};
        var answerText = extractResponseText(d);
        var mattr = "—", mtld = "—", wordCount = "—";
        var diff = r.difficulty || d.difficulty || '—';
        var timeSpent = d.timeSpentSeconds !== undefined ? d.timeSpentSeconds + 's' : '—';

        if (r.type === 'research_answer' || r.type === 'memory_answer') {
            wordCount = tokenizeText(answerText).length;
            mattr = calculateMATTR(answerText);
            mtld = calculateMTLD(answerText);
        }

        h += '<tr>';
        h += '<td class="m">' + tsT(r.timestamp) + '</td>';
        h += '<td><span class="tg">' + esc(r.type) + '</span></td>';
        h += '<td><strong>' + esc(r.questionId || '') + '</strong></td>';
        h += '<td>' + esc(diff) + '</td>';
        h += '<td>' + timeSpent + '</td>';
        h += '<td class="w"><strong>' + esc(answerText) + '</strong></td>';
        h += '<td class="r">' + wordCount + '</td>';
        h += '<td class="r"><strong>' + mattr + '</strong></td>';
        h += '<td class="r"><strong>' + mtld + '</strong></td>';
        h += '</tr>';
    });
    h += '</tbody></table></div>';
    document.getElementById('p-rep').innerHTML = h;
}

// ═══════════════════════════════════════════════════════
// GESTION FILTRES ET EXPORT STANDARD
// ═══════════════════════════════════════════════════════
function filtQ() {
    var cbs = document.querySelectorAll('.qf input[data-q]');
    var active = {};
    cbs.forEach(function(cb) { if (cb.checked) active[cb.dataset.q] = true; });
    var rows = document.querySelectorAll('#dtbl tbody tr'), vis = 0;
    rows.forEach(function(row) {
        var q = row.getAttribute('data-q');
        if (!q || active[q]) { row.style.display = ''; vis++; }
        else { row.style.display = 'none'; }
    });
    var el = document.getElementById('dcnt');
    if (el) el.textContent = vis + ' / ' + S.vis.length + ' lignes';
    var allCb = document.querySelector('.qf input:not([data-q])');
    if (allCb) allCb.checked = (Object.keys(active).length === cbs.length);
}

function togAll(cb) {
    document.querySelectorAll('.qf input[data-q]').forEach(function(c) { c.checked = cb.checked; });
    filtQ();
}

function csvEncode(arr) {
    return arr.map(function(v) {
        var s = String(v == null ? '' : v);
        if (s.indexOf('"') >= 0 || s.indexOf(';') >= 0 || s.indexOf('\n') >= 0)
            return '"' + s.replace(/"/g, '""') + '"';
        return s;
    }).join(';');
}

function dlFile(content, name, type) {
    var blob = new Blob(['\uFEFF' + content], { type: type || 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
}

function csvNav() {
    var lines = [csvEncode(['Question', 'Heure', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Ferme', 'Backward', 'Forward'])];
    S.vis.forEach(function(v) {
        lines.push(csvEncode([
            v.q, tsT(v.ts), v.url, v.nom, fr(v.tms / 1000), v.scroll, v.clics, v.touches_clavier,
            v.copies.join('\n'), v.collages.join('\n'),
            v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : ''
        ]));
    });
    dlFile(lines.join('\n'), 'navigation.csv');
}

function csvRep() {
    var reps = S.reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) {
        return (a.timestamp || '').localeCompare(b.timestamp || '');
    });
    var allKeys = {};
    reps.forEach(function(r) {
        var d = r.data || {};
        if (typeof d === 'object') Object.keys(d).forEach(function(k) { allKeys[k] = true; });
    });
    var keys = Object.keys(allKeys);
    var header = ['Heure', 'Type', 'QuestionID', 'QuestionLabel'].concat(keys);
    var lines = [csvEncode(header)];
    reps.forEach(function(r) {
        var row = [tsT(r.timestamp), r.type, r.questionId || '', r.questionLabel || ''];
        keys.forEach(function(k) { var v = (r.data || {})[k]; row.push(v != null ? String(v) : ''); });
        lines.push(csvEncode(row));
    });
    dlFile(lines.join('\n'), 'reponses.csv');
}

function dlXLSX() {
    if (typeof XLSX === 'undefined') { alert('Bibliothèque XLSX non chargée.'); return; }
    var wb = XLSX.utils.book_new();

    var navD = [['Question', 'Heure', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Backward', 'Forward']];
    S.vis.forEach(function(v) {
        navD.push([v.q, tsT(v.ts), v.url, v.nom, +(v.tms / 1000).toFixed(2), v.scroll, v.clics, v.touches_clavier,
            v.copies.join('\n'), v.collages.join('\n'),
            v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(navD), 'Navigation');

    var reps = S.reps.filter(function(r) {
        return r.type !== 'questionnaire_event' || (r.data && r.data.event === 'internet_skills');
    }).sort(function(a, b) { return (a.timestamp || '').localeCompare(b.timestamp || ''); });

    var repD = [['Heure', 'Type', 'QuestionID', 'QuestionLabel', 'Réponse / Données']];
    reps.forEach(function(r) {
        var d = r.data || {};
        var rs = (typeof d === 'object' && !Array.isArray(d))
            ? Object.entries(d).map(function(e) {
                var label = SKILLS_MAP[e[0]] || e[0];
                return label + '=' + e[1];
              }).join('; ')
            : String(d);
        repD.push([tsT(r.timestamp), r.type, r.questionId || '', r.questionLabel || '', rs]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(repD), 'Réponses');

    var globH = ['Source', 'Heure', 'Question', 'Type', 'URL', 'Page', 'Temps_s', 'Scroll_pct', 'Clics', 'Touches_clavier', 'Copies', 'Collages', 'Fermé', 'Backward', 'Forward', 'Réponse'];
    var items = [];
    S.vis.forEach(function(v) {
        items.push({ ts: v.ts, row: ['Navigation', tsT(v.ts), v.q, 'navigation', v.url, v.nom,
            +(v.tms / 1000).toFixed(2), v.scroll, v.clics, v.touches_clavier, v.copies.join('\n'), v.collages.join('\n'),
            v.closed ? 'Oui' : '', v.ib ? 'Oui' : '', v.ifw ? 'Oui' : '', ''] });
    });
    reps.forEach(function(r) {
        var d = r.data || {};
        var rs = (typeof d === 'object' && !Array.isArray(d))
            ? Object.entries(d).map(function(e) {
                var label = SKILLS_MAP[e[0]] || e[0];
                return label + '=' + e[1];
              }).join('; ')
            : String(d);
        items.push({ ts: r.timestamp || '', row: ['Réponse', tsT(r.timestamp), r.questionId || '', r.type,
            '', '', '', '', '', '', '', '', '', '', '', rs] });
    });
    items.sort(function(a, b) { return (a.ts || '').localeCompare(b.ts || ''); });
    var globD = [globH];
    items.forEach(function(it) { globD.push(it.row); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(globD), 'Global');

    XLSX.writeFile(wb, 'session_data.xlsx');
}

// ═══════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════
(function init() {
    var dropbox = document.getElementById('dropbox');
    var filein = document.getElementById('filein');
    const privateKeyFileInput = document.getElementById('private-key-file');
    const keyStatus = document.getElementById('key-status');

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

    // Écouteur pour charger la clé si utilisation isolée du dashboard
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
                    keyStatus.textContent = "✅ Clé privée active - Déchiffrement à la volée opérationnel";
                    keyStatus.style.color = "#10b981";
                } catch (err) {
                    console.error(err);
                    keyStatus.textContent = "❌ Clé de déchiffrement invalide";
                    keyStatus.style.color = "#ef4444";
                    researcherPrivateKey = null;
                }
            };
            reader.readAsText(file);
        });
    }

    // Récupérer et importer la clé privée automatiquement si déjà renseignée dans l'admin
    const savedKeyPem = sessionStorage.getItem('tracker_private_key_pem');
    if (savedKeyPem) {
        importPrivateKey(savedKeyPem).then(function(cryptoKey) {
            researcherPrivateKey = cryptoKey;
            if (keyStatus) {
                keyStatus.textContent = "✅ Clé privée héritée de l'administration active";
                keyStatus.style.color = "#10b981";
            }
        }).catch(function() {
            sessionStorage.removeItem('tracker_private_key_pem');
        });
    }

    var params = new URLSearchParams(window.location.search);
    var pid = params.get('pid');

    if (pid && loadFromSessionStorage()) {
        return;
    }

    if (pid) {
        loadFromAPI(pid);
        return;
    }
})();