const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

// Récupérer le pseudo depuis les arguments
const pseudo = process.argv[2];

if (!pseudo) {
  console.log('❌ Usage: node delete-user.js <pseudo>');
  console.log('\nExemple:');
  console.log('  node delete-user.js testuser');
  db.close();
  process.exit(1);
}

console.log(`\n🗑️  Suppression de l'utilisateur "${pseudo}"...\n`);

try {
  // Vérifier si l'utilisateur existe
  const user = db.prepare('SELECT id, pseudo, email, admin FROM users WHERE pseudo = ?').get(pseudo);
  
  if (!user) {
    console.log(`❌ Utilisateur "${pseudo}" non trouvé\n`);
    console.log('📋 Utilisateurs disponibles:');
    const allUsers = db.prepare('SELECT pseudo, email FROM users').all();
    allUsers.forEach(u => console.log(`   - ${u.pseudo} (${u.email})`));
    db.close();
    process.exit(1);
  }

  console.log('📊 Informations de l\'utilisateur:');
  console.log(`   Pseudo: ${user.pseudo}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Admin: ${user.admin ? '✅ Oui' : '❌ Non'}`);

  // Compter les défis complétés
  const stats = db.prepare(`
    SELECT COUNT(*) as total
    FROM user_challenges 
    WHERE user_id = ? AND completed = 1
  `).get(user.id);

  console.log(`   Défis complétés: ${stats.total}`);
  console.log('');

  // Supprimer l'utilisateur (CASCADE supprimera aussi ses user_challenges)
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

  if (result.changes > 0) {
    console.log(`✅ Utilisateur "${pseudo}" supprimé avec succès !`);
    console.log(`   ${stats.total} progression(s) de défis supprimée(s)\n`);
  } else {
    console.log(`❌ Erreur lors de la suppression\n`);
  }

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  db.close();
}
