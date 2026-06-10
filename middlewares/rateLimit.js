// middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');


const getCleanIp = (req) => {
    let ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');
    if (ip.includes(':') && !ip.includes('::')) ip = ip.split(':')[0];
    return ip;
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
    message: {
        erreur: "Trop de requêtes sur l'interface admin. Patientez."
    }
});

module.exports = { collecteLimiter, adminLimiter };
