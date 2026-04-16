const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            family: 4
        });
        console.log("✅ Connecté à MongoDB Atlas !");
    } catch (err) {
        console.error("❌ Erreur MongoDB :", err.message);
        // En production : ne pas crasher, réessayer
        setTimeout(connectDB, 5000);
    }

    // Reconnexion automatique si déconnecté
    mongoose.connection.on('disconnected', () => {
        console.warn("⚠️ MongoDB déconnecté. Reconnexion...");
        setTimeout(connectDB, 5000);
    });
}

module.exports = connectDB;
