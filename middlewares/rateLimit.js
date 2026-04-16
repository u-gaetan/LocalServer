// middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

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
