// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 🆕 Import du module Key Vault
const { loadSecrets } = require('./config/keyVault');

const app = express();

app.set('trust proxy', 1); 

// =========================================================
// MIDDLEWARES GLOBAUX
// =========================================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', globalLimiter);

// =========================================================
// FICHIERS STATIQUES
// =========================================================
app.use('/questionnaire', express.static(path.join(__dirname, 'questionnaire')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// =========================================================
// ROUTES API
// =========================================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const questionnaireRoutes = require('./routes/questionnaire');
app.use('/api/questionnaire', questionnaireRoutes);

const collecteRoutes = require('./routes/collecte');
app.use('/api/collecte', collecteRoutes);

app.get('/questionnaire/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'questionnaire', 'index.html'));
});

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
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
// 🆕 DÉMARRAGE ASYNCHRONE (Key Vault → MongoDB → Serveur)
// =========================================================
async function startServer() {
    try {
        // 1. Charger les secrets depuis Key Vault (ou .env en local)
        const secrets = await loadSecrets();

        // 2. Rendre les secrets accessibles globalement via app.locals
        //    (pour que les middlewares puissent y accéder)
        app.locals.secrets = secrets;

        // 3. Connexion à Cosmos DB (compatible Mongoose !)
        await mongoose.connect(secrets.mongoUri, {
            dbName: secrets.mongoDbName,         // Force la DB "effort_cognitif_db"
            retryWrites: false,                  // Cosmos DB ne supporte pas retryWrites
            directConnection: true,              // Contourne la résolution DNS SRV
            tls: true,                           // Connexion chiffrée (obligatoire Cosmos)
            serverSelectionTimeoutMS: 15000,     // 15s timeout
            socketTimeoutMS: 45000,              // 45s timeout socket
            family: 4                            // Force IPv4
        });

        console.log('✅ Connecté à Azure Cosmos DB !');

        // 4. Démarrer le serveur HTTP
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`   📋 Questionnaire : /questionnaire/`);
            console.log(`   🌐 Admin         : /admin/`);
            console.log(`   📡 API Collecte  : /api/collecte`);
            console.log(`   📝 API Quest.    : /api/questionnaire\n`);
        });

    } catch (error) {
        console.error('❌ Erreur au démarrage :', error.message);
        process.exit(1);
    }
}

// Lancer !
startServer();
