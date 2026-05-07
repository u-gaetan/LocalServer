// middlewares/auth.js
// ============================================================
// Middleware d'authentification à double mode :
//   1. Clé API (x-api-key) → pour l'extension Chrome
//   2. JWT Bearer → pour le dashboard admin
//
// Les secrets (API_KEY, JWT_SECRET) viennent de Key Vault,
// récupérés via getSecrets() au lieu de process.env
// ============================================================

const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/keyVault');

function auth(req, res, next) {
    // Route de santé : pas d'auth
    if (req.path === '/health') return next();

    // Récupérer les secrets (déjà chargés au démarrage)
    const secrets = getSecrets();

    // ──────────────────────────────────────────────
    // Option 1 : Clé API (pour l'extension Chrome)
    // ──────────────────────────────────────────────
    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey && apiKey === secrets.apiKey) {
        return next();  // ✅ Extension autorisée
    }

    // ──────────────────────────────────────────────
    // Option 2 : JWT Bearer (pour le dashboard admin)
    // ──────────────────────────────────────────────
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, secrets.jwtSecret);
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

module.exports = auth;
