// server.js (Version corrigée Azure / Proxies)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { loadSecrets } = require('./config/keyVault');

const app = express();

// Indispensable sur Azure pour lire correctement l'IP derrière le proxy d'Azure
app.set('trust proxy', 1); 

// =========================================================
// CORRECTION AZURE RATE-LIMITER (Suppression du port de l'IP)
// =========================================================
/**
 * Nettoie et extrait uniquement l'adresse IP du client,
 * en éliminant le port dynamique ajouté par le proxy d'Azure.
 */
const getCleanIp = (req) => {
    let ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Si l'adresse est mappée en IPv6 (ex: ::ffff:132.203.213.224)
    if (ip.includes('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    
    // Si l'IP contient un port à la fin (ex: 132.203.213.224:56894)
    if (ip.includes(':') && !ip.includes('::')) {
        ip = ip.split(':')[0];
    }
    
    return ip;
};

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp // Correction du crash d'Azure
});

// =========================================================
// MIDDLEWARES GLOBAUX
// =========================================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api/', globalLimiter);

// =========================================================
// FICHIERS STATIQUES ET PAGES D'INFORMATION
// =========================================================
// Servir le dossier à la racine '/' permet d'accéder directement à /privacy.html, /consent.html, etc.
app.use('/', express.static(path.join(__dirname, 'pages')));

app.use('/questionnaire', express.static(path.join(__dirname, 'questionnaire')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Configuration des alias d'URL "propres" (sans extension .html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'homepage.html'));
});

app.get('/consent', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'consent.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'privacy.html'));
});

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

// =========================================================
// DÉMARRAGE ASYNCHRONE (Key Vault → MongoDB → Serveur)
// =========================================================
async function startServer() {
    try {
        const secrets = await loadSecrets();
        app.locals.secrets = secrets;

        await mongoose.connect(secrets.mongoUri, {
            dbName: secrets.mongoDbName,
            retryWrites: false,
            directConnection: true,
            tls: true,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log('✅ Connecté à Azure Cosmos DB !');

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

startServer();