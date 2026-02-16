const Database = require('better-sqlite3');
const readline = require('readline');

const db = new Database('./server/pokemon-quest.db');

// Interface pour input utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 Script de Modification de Difficulté\n');

// Difficultés disponibles
const difficulties = ['Facile', 'Moyen', 'Difficile', 'Très Difficile', 'Extrême'];

// Fonction pour lister tous les jeux
function listAllGames() {
  const games = db.prepare('SELECT id, name, type, difficulty FROM games ORDER BY difficulty, name').all();
  
  console.log('📋 Liste des jeux par difficulté:\n');
  
  // Grouper par difficulté
  const byDifficulty = {};
  games.forEach(game => {
    if (!byDifficulty[game.difficulty]) {
      byDifficulty[game.difficulty] = [];
    }
    byDifficulty[game.difficulty].push(game);
  });
  
  // Afficher
  difficulties.forEach(diff => {
    if (byDifficulty[diff]) {
      console.log(`\n${getDifficultyIcon(diff)} ${diff.toUpperCase()}`);
      console.log('─'.repeat(50));
      byDifficulty[diff].forEach(game => {
        const type = game.type === 'officiel' ? '🎮' : game.type === 'romhack' ? '🔧' : '🎨';
        console.log(`  ${type} ID: ${game.id.toString().padStart(2)} | ${game.name}`);
      });
    }
  });
  
  console.log('\n');
}

// Icônes de difficulté
function getDifficultyIcon(difficulty) {
  switch(difficulty) {
    case 'Facile': return '🟢';
    case 'Moyen': return '🟡';
    case 'Difficile': return '🟠';
    case 'Très Difficile': return '🔴';
    case 'Extrême': return '💀';
    default: return '⚪';
  }
}

// Fonction pour changer la difficulté
function changeDifficulty(gameId, newDifficulty) {
  // Vérifier que la difficulté est valide
  if (!difficulties.includes(newDifficulty)) {
    console.log(`❌ Difficulté invalide. Choix possibles: ${difficulties.join(', ')}`);
    return false;
  }
  
  // Récupérer le jeu
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  
  if (!game) {
    console.log(`❌ Jeu ID ${gameId} introuvable`);
    return false;
  }
  
  // Mettre à jour
  const updateStmt = db.prepare('UPDATE games SET difficulty = ? WHERE id = ?');
  const result = updateStmt.run(newDifficulty, gameId);
  
  if (result.changes > 0) {
    console.log(`\n✅ Difficulté modifiée avec succès !`);
    console.log(`   Jeu: ${game.name}`);
    console.log(`   ${game.difficulty} → ${newDifficulty}`);
    return true;
  }
  
  return false;
}

// Fonction pour modifier en masse
function batchChangeDifficulty(gameIds, newDifficulty) {
  if (!difficulties.includes(newDifficulty)) {
    console.log(`❌ Difficulté invalide. Choix possibles: ${difficulties.join(', ')}`);
    return;
  }
  
  const updateStmt = db.prepare('UPDATE games SET difficulty = ? WHERE id = ?');
  let updated = 0;
  
  gameIds.forEach(id => {
    const game = db.prepare('SELECT name FROM games WHERE id = ?').get(id);
    if (game) {
      updateStmt.run(newDifficulty, id);
      console.log(`✅ ${game.name} → ${newDifficulty}`);
      updated++;
    } else {
      console.log(`⚠️  Jeu ID ${id} introuvable`);
    }
  });
  
  console.log(`\n🎉 ${updated} jeu(x) modifié(s) !`);
}

// Fonction interactive
function interactiveMode() {
  console.log('🎮 MODE INTERACTIF\n');
  
  listAllGames();
  
  rl.question('📝 Entrez l\'ID du jeu à modifier (ou "exit" pour quitter): ', (gameIdInput) => {
    if (gameIdInput.toLowerCase() === 'exit') {
      console.log('👋 Au revoir !');
      rl.close();
      db.close();
      return;
    }
    
    const gameId = parseInt(gameIdInput);
    if (isNaN(gameId)) {
      console.log('❌ ID invalide');
      rl.close();
      db.close();
      return;
    }
    
    // Afficher le jeu sélectionné
    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (!game) {
      console.log(`❌ Jeu ID ${gameId} introuvable`);
      rl.close();
      db.close();
      return;
    }
    
    console.log(`\n✨ Jeu sélectionné: ${game.name}`);
    console.log(`📊 Difficulté actuelle: ${game.difficulty}\n`);
    console.log('🎯 Choisissez la nouvelle difficulté:');
    difficulties.forEach((diff, index) => {
      console.log(`   ${index + 1}. ${getDifficultyIcon(diff)} ${diff}`);
    });
    
    rl.question('\n📝 Votre choix (1-5): ', (choice) => {
      const diffIndex = parseInt(choice) - 1;
      
      if (diffIndex >= 0 && diffIndex < difficulties.length) {
        changeDifficulty(gameId, difficulties[diffIndex]);
      } else {
        console.log('❌ Choix invalide');
      }
      
      rl.close();
      db.close();
    });
  });
}

// MENU PRINCIPAL
const action = process.argv[2];

switch(action) {
  case 'list':
    listAllGames();
    db.close();
    break;
    
  case 'change':
    const gameId = parseInt(process.argv[3]);
    const newDifficulty = process.argv[4];
    
    if (!gameId || !newDifficulty) {
      console.log('❌ Usage: node change-difficulty.js change <gameId> <difficulté>');
      console.log(`📋 Difficultés: ${difficulties.join(', ')}`);
    } else {
      changeDifficulty(gameId, newDifficulty);
    }
    db.close();
    break;
    
  case 'batch':
    const idsString = process.argv[3];
    const batchDifficulty = process.argv[4];
    
    if (!idsString || !batchDifficulty) {
      console.log('❌ Usage: node change-difficulty.js batch <id1,id2,id3> <difficulté>');
      console.log('📝 Exemple: node change-difficulty.js batch "1,2,3" Extrême');
    } else {
      const gameIds = idsString.split(',').map(id => parseInt(id.trim()));
      batchChangeDifficulty(gameIds, batchDifficulty);
    }
    db.close();
    break;
    
  case 'interactive':
  case 'i':
    interactiveMode();
    break;
    
  case 'stats':
    const stats = db.prepare(`
      SELECT difficulty, COUNT(*) as count 
      FROM games 
      GROUP BY difficulty 
      ORDER BY 
        CASE difficulty
          WHEN 'Facile' THEN 1
          WHEN 'Moyen' THEN 2
          WHEN 'Difficile' THEN 3
          WHEN 'Très Difficile' THEN 4
          WHEN 'Extrême' THEN 5
          ELSE 6
        END
    `).all();
    
    console.log('📊 STATISTIQUES DES DIFFICULTÉS\n');
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    
    stats.forEach(stat => {
      const percentage = ((stat.count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(stat.count / 2));
      console.log(`${getDifficultyIcon(stat.difficulty)} ${stat.difficulty.padEnd(20)} ${bar} ${stat.count} (${percentage}%)`);
    });
    
    console.log(`\n📈 Total: ${total} jeux`);
    db.close();
    break;
    
  default:
    console.log('📖 GUIDE D\'UTILISATION\n');
    console.log('🎯 COMMANDES DISPONIBLES:\n');
    
    console.log('1️⃣  LISTER TOUS LES JEUX (par difficulté):');
    console.log('   node change-difficulty.js list\n');
    
    console.log('2️⃣  MODIFIER LA DIFFICULTÉ D\'UN JEU:');
    console.log('   node change-difficulty.js change <gameId> <difficulté>');
    console.log('   Exemple: node change-difficulty.js change 5 Extrême\n');
    
    console.log('3️⃣  MODIFIER PLUSIEURS JEUX EN MASSE:');
    console.log('   node change-difficulty.js batch <id1,id2,id3> <difficulté>');
    console.log('   Exemple: node change-difficulty.js batch "1,2,3" "Très Difficile"\n');
    
    console.log('4️⃣  MODE INTERACTIF (recommandé):');
    console.log('   node change-difficulty.js interactive');
    console.log('   ou: node change-difficulty.js i\n');
    
    console.log('5️⃣  VOIR LES STATISTIQUES:');
    console.log('   node change-difficulty.js stats\n');
    
    console.log('🎯 DIFFICULTÉS DISPONIBLES:');
    difficulties.forEach((diff, index) => {
      console.log(`   ${index + 1}. ${getDifficultyIcon(diff)} ${diff}`);
    });
    
    console.log('\n💡 EXEMPLES PRATIQUES:\n');
    console.log('# Voir tous les jeux');
    console.log('node change-difficulty.js list\n');
    
    console.log('# Mode interactif (plus facile)');
    console.log('node change-difficulty.js i\n');
    
    console.log('# Changer un jeu en Extrême');
    console.log('node change-difficulty.js change 5 Extrême\n');
    
    console.log('# Mettre plusieurs jeux en Facile');
    console.log('node change-difficulty.js batch "1,4,7" Facile\n');
    
    console.log('# Voir la répartition des difficultés');
    console.log('node change-difficulty.js stats\n');
    
    db.close();
}
