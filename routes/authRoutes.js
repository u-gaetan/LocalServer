// routes/authRoutes.js
// ============================================================
// Route de login admin.
// Le mot de passe est vérifié contre un hash bcrypt stocké
// dans Key Vault (pas en clair nulle part !)
// ============================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/keyVault');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Récupérer les secrets depuis Key Vault
        const secrets = getSecrets();

        // Vérifier l'identifiant
        if (username !== secrets.adminUser) {
            return res.status(401).json({ erreur: 'Identifiant ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe contre le hash
        const match = await bcrypt.compare(password, secrets.adminPasswordHash);
        if (!match) {
            return res.status(401).json({ erreur: 'Identifiant ou mot de passe incorrect' });
        }

        // Générer un JWT (expire dans 8h)
        const token = jwt.sign(
            { user: username, role: 'admin' },
            secrets.jwtSecret,
            { expiresIn: '8h' }
        );

        res.json({ token, message: 'Connexion réussie' });

    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

module.exports = router;
