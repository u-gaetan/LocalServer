// ═══════════════════════════════════════════════════════════
// server.js — API Tracker ULaval v2.0
// Collecte navigation (extension) + réponses formulaires
// ═══════════════════════════════════════════════════════════


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');

// Routes
const collecteRoutes = require('./routes/collecte');
const authRoutes = require('./routes/authRoutes');

// Route publique (pas de middleware auth)




const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
// SÉCURITÉ
// ═══════════════════════════════════════════════════════════

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"]
        }
    }
}));

app.use(cors({
    origin: (origin, callback) => {
        // Autorise : pas d'origin (même serveur), extensions Chrome, localhost
        if (!origin
            || origin.startsWith('chrome-extension://')
            || origin.startsWith('http://localhost')
            || origin.startsWith('https://localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Origine non autorisée par CORS'));
        }
    }
}));



app.use(express.json({ limit: '50mb' }));

// ═══════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        const now = new Date().toISOString();
        console.log(`[${now}] ${req.method} ${req.path}`);
    }
    next();
});

app.use('/admin', express.static(path.join(__dirname, 'admin')));
// ═══════════════════════════════════════════════════════════
// ROUTES API
// ═══════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
// Route existante : collecte navigation (extension Chrome)
app.use('/api/collecte', collecteRoutes);


// ═══════════════════════════════════════════════════════════
// GESTION DES ERREURS
// ═══════════════════════════════════════════════════════════

// 404 pour les routes API non trouvées
app.use('/api/*', (req, res) => {
    res.status(404).json({
        erreur: 'Route non trouvée',
        chemin: req.originalUrl,
        methode: req.method
    });
});


// Erreurs globales
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.message);
    console.error(err.stack);
    res.status(500).json({
        erreur: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ═══════════════════════════════════════════════════════════
// DÉMARRAGE
// ═══════════════════════════════════════════════════════════

async function startServer() {
    try {
        // Connexion MongoDB
        await connectDB();
        console.log('✅ MongoDB connecté');

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════');
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log('═══════════════════════════════════════════');

        });
    } catch (err) {
        console.error('❌ Impossible de démarrer le serveur:', err.message);
        process.exit(1);
    }
}


startServer();
