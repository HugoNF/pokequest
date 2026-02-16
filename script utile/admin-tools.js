const Database = require('better-sqlite3');
const db = new Database('./server/pokemon-quest.db');

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

console.log('🔧 PokéQuest - Outils d\'administration\n');

switch(command) {
  case 'make-admin':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js make-admin <pseudo>');
      break;
    }
    try {
      const result = db.prepare('UPDATE users SET admin = 1 WHERE pseudo = ?').run(param);
      if (result.changes > 0) {
        console.log(`✅ ${param} est maintenant administrateur !`);
        const user = db.prepare('SELECT pseudo, email, admin FROM users WHERE pseudo = ?').get(param);
        console.log('\nDétails:');
        console.table([user]);
      } else {
        console.log(`❌ Utilisateur "${param}" non trouvé`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'remove-admin':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js remove-admin <pseudo>');
      break;
    }
    try {
      const res = db.prepare('UPDATE users SET admin = 0 WHERE pseudo = ?').run(param);
      if (res.changes > 0) {
        console.log(`✅ ${param} n'est plus administrateur`);
      } else {
        console.log(`❌ Utilisateur "${param}" non trouvé`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'list-users':
    try {
      const users = db.prepare(`
        SELECT 
          id, 
          pseudo, 
          email, 
          CASE WHEN admin = 1 THEN '✅ Admin' ELSE '❌ User' END as role,
          created_at
        FROM users
        ORDER BY admin DESC, pseudo ASC
      `).all();
      
      if (users.length === 0) {
        console.log('❌ Aucun utilisateur trouvé');
      } else {
        console.log(`📊 ${users.length} utilisateur(s) :\n`);
        console.table(users);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'list-games':
    try {
      const games = db.prepare(`
        SELECT 
          id, 
          name, 
          type,
          difficulty,
          (SELECT COUNT(*) FROM challenges WHERE game_id = games.id) as nb_defis
        FROM games
        ORDER BY created_at DESC
      `).all();
      
      if (games.length === 0) {
        console.log('❌ Aucun jeu trouvé');
      } else {
        console.log(`🎮 ${games.length} jeu(x) :\n`);
        console.table(games);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'user-score':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js user-score <pseudo>');
      break;
    }
    try {
      const user = db.prepare('SELECT id, pseudo FROM users WHERE pseudo = ?').get(param);
      if (!user) {
        console.log(`❌ Utilisateur "${param}" non trouvé`);
        break;
      }
      
      const stats = db.prepare(`
        SELECT 
          COUNT(CASE WHEN uc.completed = 1 THEN 1 END) as defis_completes,
          COUNT(*) as defis_total,
          SUM(CASE WHEN uc.completed = 1 THEN c.points ELSE 0 END) as score_total
        FROM user_challenges uc
        JOIN challenges c ON uc.challenge_id = c.id
        WHERE uc.user_id = ?
      `).get(user.id);
      
      console.log(`📊 Statistiques de ${param} :\n`);
      console.log(`✅ Défis complétés : ${stats.defis_completes || 0}/${stats.defis_total || 0}`);
      console.log(`⭐ Score total : ${stats.score_total || 0} points`);
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'reset-password':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js reset-password <pseudo>');
      break;
    }
    try {
      const bcrypt = require('bcrypt');
      const newPassword = 'password123';
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      
      const result = db.prepare('UPDATE users SET password = ? WHERE pseudo = ?').run(hashedPassword, param);
      if (result.changes > 0) {
        console.log(`✅ Mot de passe de ${param} réinitialisé !`);
        console.log(`🔑 Nouveau mot de passe : ${newPassword}`);
      } else {
        console.log(`❌ Utilisateur "${param}" non trouvé`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'delete-user':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js delete-user <pseudo>');
      break;
    }
    try {
      const result = db.prepare('DELETE FROM users WHERE pseudo = ?').run(param);
      if (result.changes > 0) {
        console.log(`✅ Utilisateur "${param}" supprimé`);
      } else {
        console.log(`❌ Utilisateur "${param}" non trouvé`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  case 'delete-game':
    if (!param) {
      console.log('❌ Usage: node admin-tools.js delete-game <id>');
      break;
    }
    try {
      const result = db.prepare('DELETE FROM games WHERE id = ?').run(parseInt(param));
      if (result.changes > 0) {
        console.log(`✅ Jeu #${param} supprimé`);
      } else {
        console.log(`❌ Jeu #${param} non trouvé`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
    break;
    
  default:
    console.log(`
📖 Commandes disponibles :

👤 UTILISATEURS
  list-users                        - Lister tous les utilisateurs
  make-admin <pseudo>               - Rendre un utilisateur admin
  remove-admin <pseudo>             - Retirer les droits admin
  user-score <pseudo>               - Voir les stats d'un utilisateur
  reset-password <pseudo>           - Réinitialiser le mot de passe
  delete-user <pseudo>              - Supprimer un utilisateur

🎮 JEUX
  list-games                        - Lister tous les jeux
  delete-game <id>                  - Supprimer un jeu

📝 EXEMPLES
  node admin-tools.js make-admin test
  node admin-tools.js list-users
  node admin-tools.js user-score testuser
  node admin-tools.js reset-password test

⚠️  ATTENTION : Fermez l'application avant d'utiliser ces outils !
    `);
}

db.close();
