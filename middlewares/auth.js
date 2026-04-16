// middlewares/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // Route de santé : pas d'auth
    if (req.path === '/health') return next();

    // ──────────────────────────────────────────────
    // Option 1 : Clé API (pour l'extension Chrome)
    // ──────────────────────────────────────────────
    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey && apiKey === process.env.API_KEY) {
        return next();  // ✅ Extension autorisée
    }

    // ──────────────────────────────────────────────
    // Option 2 : JWT Bearer (pour le dashboard admin)
    // ──────────────────────────────────────────────
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();  // ✅ Admin autorisé
        } catch (err) {
            return res.status(401).json({ erreur: 'Token invalide ou expiré' });
        }
    }

    // ──────────────────────────────────────────────
    // Aucune auth valide
    // ──────────────────────────────────────────────
    console.warn('⚠️ Auth refusée |', req.method, req.originalUrl,
                 '| x-api-key:', apiKey ? 'présente mais invalide' : 'absente',
                 '| Bearer:', authHeader ? 'présent' : 'absent');

    return res.status(401).json({ erreur: 'Authentification requise' });
}

// ⚠️ UN SEUL module.exports !
module.exports = auth;
