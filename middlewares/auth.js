// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/keyVault');

function auth(req, res, next) {
    if (req.path === '/health') return next();

    const secrets = getSecrets();
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, secrets.jwtSecret);
            req.user = decoded;

            // 1. Si c'est un Administrateur
            if (decoded.role === 'admin') {
                return next();
            }

            // 2. Si c'est un Participant de l'étude
            if (decoded.role === 'participant') {
                // On s'assure que le participantId du jeton correspond à celui de la requête
                const reqParticipantId = req.body.participantId || req.query.participantId || req.validatedParticipantId;
                if (reqParticipantId && reqParticipantId !== decoded.participantId) {
                    return res.status(403).json({ erreur: 'Accès non autorisé pour ce profil participant.' });
                }
                return next();
            }
        } catch (err) {
            return res.status(401).json({ erreur: 'Jeton invalide ou expiré.' });
        }
    }

    // Protection de secours pour les scripts d'administration locaux (si configurés)
    const apiKey = req.headers['x-api-key'] || req.query.key;
    if (apiKey && apiKey === secrets.apiKey) {
        return next();
    }

    return res.status(401).json({ erreur: 'Authentification requise.' });
}

module.exports = auth;