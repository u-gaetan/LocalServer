// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// =========================================================
// MIDDLEWARES GLOBAUX
// =========================================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logger global — toutes les requêtes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Rate limiter global (filet de sécurité)
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', globalLimiter);

// =========================================================
// FICHIERS STATIQUES (aucune auth)
// =========================================================
app.use('/questionnaire', express.static(path.join(__dirname, 'questionnaire')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// =========================================================
// ROUTES API
// =========================================================

// Auth (login admin) — pas de protection, c'est le point d'entrée
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Questionnaire — le POST /reponse est PUBLIC (participant)
//                  les GET /resultats sont protégés (admin, via auth dans le router)
const questionnaireRoutes = require('./routes/questionnaire');
app.use('/api/questionnaire', questionnaireRoutes);

// Collecte — TOUTES les routes sont protégées par auth (dans le router)
const collecteRoutes = require('./routes/collecte');
app.use('/api/collecte', collecteRoutes);

// =========================================================
// ROUTE PAR DÉFAUT
// =========================================================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        endpoints: {
            questionnaire: '/questionnaire/',
            admin: '/admin/',
            api_collecte: '/api/collecte/',
            api_questionnaire: '/api/questionnaire/',
            api_auth: '/api/auth/login'
        }
    });
});

// =========================================================
// CONNEXION MONGODB + DÉMARRAGE
// =========================================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connecté à MongoDB Atlas !');
        console.log('✅ MongoDB connecté');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`\n═══════════════════════════════════════════`);
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`   📋 Questionnaire : http://localhost:${PORT}/questionnaire/`);
            console.log(`   🔧 Admin         : http://localhost:${PORT}/admin/`);
            console.log(`   📡 API Collecte  : http://localhost:${PORT}/api/collecte`);
            console.log(`   📝 API Quest.    : http://localhost:${PORT}/api/questionnaire`);
            console.log(`═══════════════════════════════════════════\n`);
        });
    })
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB:', err.message);
        process.exit(1);
    });
