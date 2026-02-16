const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./server/pokemon-quest.db');

console.log('🎮 Import des jeux Pokémon officiels...\n');

// Lire le fichier JSON
const jsonPath = path.join(__dirname, 'pokemon-officiels-defis.json');
const gamesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Préparer les statements
const gameStmt = db.prepare('INSERT INTO games (name, type, difficulty) VALUES (?, ?, ?)');
const challengeStmt = db.prepare('INSERT INTO challenges (game_id, title, difficulty, points) VALUES (?, ?, ?, ?)');

let totalGames = 0;
let totalChallenges = 0;

// Commencer une transaction pour de meilleures performances
const insertMany = db.transaction((games) => {
  games.forEach(game => {
    // Insérer le jeu
    const result = gameStmt.run(game.name, game.type, game.difficulty);
    const gameId = result.lastInsertRowid;
    totalGames++;
    
    console.log(`✅ ${game.name} (${game.challenges.length} défis)`);
    
    // Insérer les défis
    game.challenges.forEach(challenge => {
      challengeStmt.run(gameId, challenge.title, challenge.difficulty, challenge.points);
      totalChallenges++;
    });
  });
});

try {
  insertMany(gamesData);
  
  console.log('\n🎉 Import terminé avec succès !');
  console.log(`📊 ${totalGames} jeux ajoutés`);
  console.log(`🏆 ${totalChallenges} défis créés`);
  console.log('\n💡 Vous pouvez maintenant lancer l\'application avec: npm run dev');
  
} catch (error) {
  console.error('\n❌ Erreur lors de l\'import:', error.message);
  
  if (error.message.includes('UNIQUE constraint')) {
    console.log('\n⚠️  Certains jeux existent déjà dans la base de données.');
    console.log('💡 Pour réimporter, supprimez d\'abord la base :');
    console.log('   del server\\pokemon-quest.db');
    console.log('   npm run seed');
    console.log('   node import-pokemon-officiels.js');
  }
} finally {
  db.close();
}
