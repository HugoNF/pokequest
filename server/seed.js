const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Créer le dossier server s'il n'existe pas
if (!fs.existsSync('./server')) {
  fs.mkdirSync('./server', { recursive: true });
}

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('./server/uploads')) {
  fs.mkdirSync('./server/uploads', { recursive: true });
}

const db = new Database('./server/pokemon-quest.db');

console.log('🌱 Initialisation de la base de données...');

// CRÉER LES TABLES D'ABORD
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    pseudo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    points INTEGER NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(user_id, challenge_id)
  );
`);

console.log('✅ Tables créées avec succès');

// ENSUITE, créer les utilisateurs de test
try {
  // Créer un utilisateur admin de test
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const adminStmt = db.prepare('INSERT OR IGNORE INTO users (email, pseudo, password, admin) VALUES (?, ?, ?, 1)');
  adminStmt.run('admin@pokequest.com', 'admin', hashedPassword);

  // Créer un utilisateur normal de test
  const userStmt = db.prepare('INSERT OR IGNORE INTO users (email, pseudo, password, admin) VALUES (?, ?, ?, 0)');
  userStmt.run('user@pokequest.com', 'testuser', bcrypt.hashSync('user123', 10));

  console.log('✅ Utilisateurs créés:');
  console.log('   Admin: admin / admin123');
  console.log('   User:  testuser / user123');
} catch (error) {
  console.error('❌ Erreur lors de la création des utilisateurs:', error.message);
}

console.log('\n🎉 Base de données initialisée avec succès!');
console.log('📝 La base de données est vide - vous pouvez maintenant ajouter vos propres jeux via le panneau admin');
console.log('🚀 Vous pouvez maintenant lancer l\'application avec: npm run dev');

db.close();
