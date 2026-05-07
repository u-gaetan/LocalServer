// config/keyVault.js
// ============================================================
// Ce module récupère les secrets depuis Azure Key Vault.
// En production : utilise Managed Identity (aucun mot de passe !)
// En local : utilise vos identifiants Azure CLI (az login)
// ============================================================

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

// L'URL de votre Key Vault (configurée dans les App Settings d'Azure)
const keyVaultUrl = process.env.KEY_VAULT_URL;

let secrets = {};

async function loadSecrets() {
    // Si on est en développement local SANS Key Vault, on utilise le .env
    if (!keyVaultUrl) {
        console.log("⚠️  KEY_VAULT_URL non défini → utilisation du .env local");
        return {
            mongoUri: process.env.MONGO_URI,
            apiKey: process.env.API_KEY,
            jwtSecret: process.env.JWT_SECRET,
            adminUser: process.env.ADMIN_USER,
            adminPasswordHash: process.env.ADMIN_PASSWORD_HASH
        };
    }

    console.log("🔐 Connexion à Azure Key Vault...");
    
    // DefaultAzureCredential essaie plusieurs méthodes d'auth :
    // 1. Managed Identity (en production sur App Service) ← automatique !
    // 2. Azure CLI (en dev local si vous avez fait "az login")
    // 3. Variables d'environnement (si configurées)
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(keyVaultUrl, credential);

    try {
        // Récupérer chaque secret depuis Key Vault
        const cosmosSecret = await client.getSecret("CosmosDBConnectionString");
        const apiKeySecret = await client.getSecret("ApiKey");
        const jwtSecret = await client.getSecret("JwtSecret");
        const adminUserSecret = await client.getSecret("AdminUser");
        const adminPassHashSecret = await client.getSecret("AdminPasswordHash");

        secrets = {
            mongoUri: cosmosSecret.value,
            apiKey: apiKeySecret.value,
            jwtSecret: jwtSecret.value,
            adminUser: adminUserSecret.value,
            adminPasswordHash: adminPassHashSecret.value
        };

        console.log("✅ Secrets chargés depuis Key Vault !");
        return secrets;

    } catch (error) {
        console.error("❌ Erreur Key Vault :", error.message);
        throw error;
    }
}

// Permet d'accéder aux secrets une fois chargés
function getSecrets() {
    return secrets;
}

module.exports = { loadSecrets, getSecrets };
