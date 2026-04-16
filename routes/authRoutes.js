// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Vérifier l'identifiant
        if (username !== process.env.ADMIN_USER) {
            return res.status(401).json({ erreur: 'Identifiant ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe contre le hash
        const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!match) {
            return res.status(401).json({ erreur: 'Identifiant ou mot de passe incorrect' });
        }

        // Générer un JWT (expire dans 8h)
        const token = jwt.sign(
            { user: username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, message: 'Connexion réussie' });

    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

module.exports = router;
