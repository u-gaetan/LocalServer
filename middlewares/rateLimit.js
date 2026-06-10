// middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

/**
 * Nettoie et extrait uniquement l'adresse IP du client,
 * en éliminant le port dynamique ajouté par le proxy d'Azure.
 */
const getCleanIp = (req) => {
    let ipHeader = req.headers['x-forwarded-for'];
    let ip = '127.0.0.1';

    if (ipHeader) {
        ip = ipHeader.split(',')[0].trim();
    } else {
        ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    }

    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    if (ip.startsWith('[')) {
        const closeBracketIndex = ip.indexOf(']');
        if (closeBracketIndex !== -1) {
            ip = ip.substring(1, closeBracketIndex);
        }
    } else {
        const colons = ip.split(':');
        if (colons.length === 2) {
            ip = colons[0];
        } else if (colons.length > 2) {
            const lastColon = ip.lastIndexOf(':');
            const lastPart = ip.substring(lastColon + 1);
            if (!isNaN(lastPart) && ip.includes('.')) {
                ip = ip.substring(0, lastColon);
            }
        }
    }

    return ip || '127.0.0.1';
};

// ─────────────────────────────────────────────
// Rate limiter pour POST /api/collecte
// ─────────────────────────────────────────────
const collecteLimiter = rateLimit({
    windowMs: 60 * 1000,               // fenêtre d'1 minute
    max: 30,                            // 30 requêtes max par IP par minute
    standardHeaders: true,              // Retourne les headers RateLimit-*
    legacyHeaders: false,               // Désactive X-RateLimit-*
    keyGenerator: getCleanIp,           
    validate: { trustProxy: false },    // Désactive la validation de proxy interne
    message: {
        erreur: "Trop de requêtes. Réessayez dans quelques instants.",
        retryAfterSeconds: 60
    }
});

// ─────────────────────────────────────────────
// Rate limiter pour les routes GET admin/export
// ─────────────────────────────────────────────
const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp,           
    validate: { trustProxy: false },    // Désactive la validation de proxy interne
    message: {
        erreur: "Trop de requêtes sur l'interface admin. Patientez."
    }
});

module.exports = { collecteLimiter, adminLimiter };