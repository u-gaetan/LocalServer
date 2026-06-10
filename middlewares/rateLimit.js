// middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');


/**
 * Extrait une IP propre (sans port, sans préfixe IPv6-mapped).
 * Azure App Service transmet l'IP sous la forme "1.2.3.4:PORT" dans req.ip
 * quand app.set('trust proxy', 1) est actif — express-rate-limit rejette
 * ce format. On nettoie ici avant que le limiteur s'en serve.
 */
const getCleanIp = (req) => {
    // Priorité : x-forwarded-for (vrai IP client derrière le proxy Azure)
    let ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
          || req.ip
          || req.socket.remoteAddress
          || '127.0.0.1';

    // Retire le préfixe IPv6-mapped  ::ffff:1.2.3.4  →  1.2.3.4
    if (ip.startsWith('::ffff:')) ip = ip.slice(7);

    // Retire le port éventuel  1.2.3.4:56894  →  1.2.3.4
    // (ne touche pas les adresses IPv6 pures entre crochets)
    if (!ip.startsWith('[') && ip.includes(':')) {
        ip = ip.split(':')[0];
    }

    return ip || '127.0.0.1';
};

// ─────────────────────────────────────────────
// Rate limiter pour POST /api/collecte
// L'extension envoie toutes les 3 minutes → 30/min est très généreux
// ─────────────────────────────────────────────
const collecteLimiter = rateLimit({
    windowMs: 60 * 1000,               // fenêtre d'1 minute
    max: 30,                            // 30 requêtes max par IP par minute
    standardHeaders: true,              // Retourne les headers RateLimit-*
    legacyHeaders: false,               // Désactive X-RateLimit-* (obsolètes)
    keyGenerator: getCleanIp,           // ← corrige ERR_ERL_INVALID_IP_ADDRESS sur Azure
    validate: { trustProxy: false },    // on gère l'IP nous-mêmes, on désactive la vérif interne
    message: {
        erreur: "Trop de requêtes. Réessayez dans quelques instants.",
        retryAfterSeconds: 60
    }
});

// ─────────────────────────────────────────────
// Rate limiter pour les routes GET admin/export
// Plus strict : pas besoin de spammer les exports
// ─────────────────────────────────────────────
const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp,           // ← idem
    validate: { trustProxy: false },
    message: {
        erreur: "Trop de requêtes sur l'interface admin. Patientez."
    }
});

module.exports = { collecteLimiter, adminLimiter };