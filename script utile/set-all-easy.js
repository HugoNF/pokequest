const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

console.log('🎯 Script: Mettre tous les jeux en difficulté "Facile"\n');

try {
  // Compter les jeux avant
  const beforeCount = db.prepare(`
    SELECT 
      difficulty, 
      COUNT(*) as count 
    FROM games 
    GROUP BY difficulty
  `).all();
  
  console.log('📊 Répartition AVANT:');
  beforeCount.forEach(row => {
    console.log(`   ${row.difficulty}: ${row.count} jeu(x)`);
  });
  
  // Mettre à jour tous les jeux
  const updateStmt = db.prepare('UPDATE games SET difficulty = ?');
  const result = updateStmt.run('Facile');
  
  console.log(`\n✅ ${result.changes} jeu(x) modifié(s) !`);
  
  // Vérifier après
  const afterCount = db.prepare(`
    SELECT 
      difficulty, 
      COUNT(*) as count 
    FROM games 
    GROUP BY difficulty
  `).all();
  
  console.log('\n📊 Répartition APRÈS:');
  afterCount.forEach(row => {
    console.log(`   ${row.difficulty}: ${row.count} jeu(x)`);
  });
  
  // Liste des jeux modifiés
  console.log('\n📋 Liste des jeux:');
  const games = db.prepare('SELECT id, name, difficulty FROM games ORDER BY name').all();
  games.forEach(game => {
    console.log(`   🟢 ${game.id.toString().padStart(2)} | ${game.name.padEnd(40)} | ${game.difficulty}`);
  });
  
  console.log('\n🎉 Terminé ! Tous les jeux sont maintenant en difficulté "Facile"');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error(error);
} finally {
  db.close();
}
