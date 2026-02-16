const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

console.log('🏆 Script: Ajouter un défi "Nuzlocke" à tous les jeux\n');

const CHALLENGE = {
  title: 'Terminer en Nuzlocke',
  difficulty: 'medium',
  points: 75
};

try {
  // Récupérer tous les jeux
  const games = db.prepare('SELECT id, name FROM games ORDER BY name').all();
  
  console.log(`📋 ${games.length} jeu(x) trouvé(s)\n`);
  
  const insertStmt = db.prepare(`
    INSERT INTO challenges (game_id, title, difficulty, points) 
    VALUES (?, ?, ?, ?)
  `);
  
  let added = 0;
  let skipped = 0;
  
  games.forEach(game => {
    // Vérifier si le jeu a déjà un défi similaire
    const existing = db.prepare(`
      SELECT * FROM challenges 
      WHERE game_id = ? AND title LIKE '%Nuzlocke%'
    `).get(game.id);
    
    if (existing) {
      console.log(`⏭️  ${game.name.padEnd(40)} | Défi Nuzlocke existe déjà`);
      skipped++;
    } else {
      insertStmt.run(game.id, CHALLENGE.title, CHALLENGE.difficulty, CHALLENGE.points);
      console.log(`✅ ${game.name.padEnd(40)} | Défi ajouté`);
      added++;
    }
  });
  
  console.log('\n📊 RÉSUMÉ:');
  console.log(`   ✅ ${added} défi(s) ajouté(s)`);
  console.log(`   ⏭️  ${skipped} jeu(x) déjà avec un Nuzlocke`);
  console.log(`   📈 Total: ${games.length} jeu(x)`);
  
  // Vérification finale
  console.log('\n🔍 VÉRIFICATION:');
  const verification = db.prepare(`
    SELECT 
      g.name,
      COUNT(c.id) as total_challenges,
      SUM(CASE WHEN c.title LIKE '%Nuzlocke%' THEN 1 ELSE 0 END) as nuzlocke_count
    FROM games g
    LEFT JOIN challenges c ON g.id = c.game_id
    GROUP BY g.id, g.name
    ORDER BY g.name
  `).all();
  
  verification.forEach(row => {
    const nuzIcon = row.nuzlocke_count > 0 ? '✅' : '❌';
    console.log(`   ${nuzIcon} ${row.name.padEnd(40)} | ${row.total_challenges} défis dont ${row.nuzlocke_count} Nuzlocke`);
  });
  
  console.log('\n🎉 Terminé !');
  console.log(`💡 Chaque jeu a maintenant un défi "${CHALLENGE.title}" (${CHALLENGE.difficulty}, ${CHALLENGE.points} pts)`);
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error(error);
} finally {
  db.close();
}
