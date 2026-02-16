const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

console.log('🔧 Migration: Suppression de cartridgeColor et color\n');

try {
  // SQLite ne permet pas de DROP COLUMN directement
  // On doit recréer la table sans ces colonnes
  
  console.log('1️⃣  Création de la nouvelle table games...');
  
  db.exec(`
    -- Créer la nouvelle table sans cartridgeColor et color
    CREATE TABLE games_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('2️⃣  Copie des données...');
  
  db.exec(`
    -- Copier les données de l'ancienne table vers la nouvelle
    INSERT INTO games_new (id, name, type, difficulty, image, created_at)
    SELECT id, name, type, difficulty, image, created_at
    FROM games;
  `);
  
  console.log('3️⃣  Suppression de l\'ancienne table...');
  
  db.exec(`
    -- Supprimer l'ancienne table
    DROP TABLE games;
  `);
  
  console.log('4️⃣  Renommage de la nouvelle table...');
  
  db.exec(`
    -- Renommer la nouvelle table
    ALTER TABLE games_new RENAME TO games;
  `);
  
  console.log('\n✅ Migration terminée avec succès !');
  console.log('📊 Vérification de la structure...\n');
  
  // Vérifier la nouvelle structure
  const tableInfo = db.prepare("PRAGMA table_info(games)").all();
  console.log('Colonnes de la table games:');
  tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type}${col.notnull ? ', NOT NULL' : ''})`);
  });
  
  // Vérifier le nombre de jeux
  const count = db.prepare('SELECT COUNT(*) as count FROM games').get();
  console.log(`\n🎮 ${count.count} jeu(x) conservé(s)`);
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  console.error(error);
} finally {
  db.close();
}
