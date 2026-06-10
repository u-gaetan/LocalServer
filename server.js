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
    let ipHeader = req.headers['x-forwarded-for'];
    let ip = '127.0.0.1';

    if (ipHeader) {
        // Prend la première IP si plusieurs sont transmises
        ip = ipHeader.split(',')[0].trim();
    } else {
        ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    }

    // Retrait du préfixe IPv6-mapped (ex: ::ffff:132.203.213.224)
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    // Gestion du port pour les formats IPv4 et IPv6 entre crochets
    if (ip.startsWith('[')) {
        const closeBracketIndex = ip.indexOf(']');
        if (closeBracketIndex !== -1) {
            ip = ip.substring(1, closeBracketIndex);
        }
    } else {
        const colons = ip.split(':');
        if (colons.length === 2) {
            // Format standard IPv4:port
            ip = colons[0];
        } else if (colons.length > 2) {
            // Cas d'IPv6 complexe sans crochets avec port à la fin
            const lastColon = ip.lastIndexOf(':');
            const lastPart = ip.substring(lastColon + 1);
            if (!isNaN(lastPart) && ip.includes('.')) {
                ip = ip.substring(0, lastColon);
            }
        }
    }

    return ip || '127.0.0.1';
};

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getCleanIp,
    validate: { trustProxy: false } // Indispensable pour éviter le crash de validation d'express-rate-limit sur Azure
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