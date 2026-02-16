const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

console.log('🔍 Diagnostic des utilisateurs admin\n');

try {
  const users = db.prepare('SELECT id, pseudo, email, admin FROM users ORDER BY admin DESC, pseudo ASC').all();
  
  if (users.length === 0) {
    console.log('❌ Aucun utilisateur trouvé');
    db.close();
    process.exit(0);
  }

  console.log(`📊 ${users.length} utilisateur(s) trouvé(s):\n`);

  users.forEach(user => {
    console.log(`👤 ${user.pseudo}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Admin (valeur brute): ${user.admin} (type: ${typeof user.admin})`);
    console.log(`   Admin (booléen): ${user.admin ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Admin === 1: ${user.admin === 1 ? '✅' : '❌'}`);
    console.log(`   Admin === true: ${user.admin === true ? '✅' : '❌'}`);
    console.log('');
  });

  // Conseils
  console.log('💡 Conseils:');
  console.log('');
  
  const admins = users.filter(u => u.admin === 1 || u.admin === true);
  const nonAdmins = users.filter(u => !u.admin && u.admin !== 1);

  if (admins.length > 0) {
    console.log(`✅ ${admins.length} admin(s) détecté(s):`);
    admins.forEach(u => console.log(`   - ${u.pseudo}`));
    console.log('');
  }

  if (nonAdmins.length > 0) {
    console.log(`👤 ${nonAdmins.length} utilisateur(s) normal/normaux:`);
    nonAdmins.forEach(u => console.log(`   - ${u.pseudo}`));
    console.log('');
    console.log('Pour passer un utilisateur en admin:');
    console.log(`   node admin-tools.js make-admin <pseudo>`);
    console.log('');
  }

  // Vérifier la structure de la table
  console.log('📋 Structure de la table users:');
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const adminColumn = tableInfo.find(col => col.name === 'admin');
  
  if (adminColumn) {
    console.log(`   Colonne 'admin': ${adminColumn.type}`);
    console.log(`   Valeur par défaut: ${adminColumn.dflt_value || '0'}`);
  }

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  db.close();
}
