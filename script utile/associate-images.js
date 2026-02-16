const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./server/pokemon-quest.db');

console.log('🖼️  Script d\'association d\'images aux jeux\n');

// Configuration : Associer ID du jeu → Nom du fichier image
// Les images doivent être placées dans server/uploads/
const imageAssociations = {
  // Exemple d'utilisation :
  1: 'yellow.png',        
  2: 'crystal.png',
  3: 'emerald.png',
  4: 'firered.png',
  5: 'platinum.png',
  6: 'heartgold.png',
  7: 'black.png',
  8: 'black-2.png',
  9: 'x.png',
  10: 'omega-ruby.png',
  11: 'sun.png',
  12: 'ultra-sun.png',
  13: 'pika.png',
  14: 'sword.png',
  15: 'bdiamond.png',
  16: 'legends-arceus.png',
  17: 'scarlet.png',
  
 
};

// Fonction pour lister tous les jeux
function listAllGames() {
  const games = db.prepare('SELECT id, name, type, image FROM games ORDER BY id').all();
  
  console.log('📋 Liste des jeux dans la base de données:\n');
  games.forEach(game => {
    const hasImage = game.image ? '✅' : '❌';
    const imagePath = game.image || 'Aucune image';
    console.log(`${hasImage} ID: ${game.id.toString().padStart(2)} | ${game.name.padEnd(40)} | ${imagePath}`);
  });
  console.log('\n');
}

// Fonction pour associer les images
function associateImages() {
  const updateStmt = db.prepare('UPDATE games SET image = ? WHERE id = ?');
  let updated = 0;
  
  for (const [gameId, imageName] of Object.entries(imageAssociations)) {
    const imagePath = `/uploads/${imageName}`;
    
    try {
      const result = updateStmt.run(imagePath, parseInt(gameId));
      if (result.changes > 0) {
        console.log(`✅ Jeu ID ${gameId} → ${imageName}`);
        updated++;
      } else {
        console.log(`⚠️  Jeu ID ${gameId} introuvable`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour le jeu ID ${gameId}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 ${updated} image(s) associée(s) avec succès !`);
}

// Fonction pour supprimer l'image d'un jeu
function removeImage(gameId) {
  const updateStmt = db.prepare('UPDATE games SET image = NULL WHERE id = ?');
  const result = updateStmt.run(gameId);
  
  if (result.changes > 0) {
    console.log(`✅ Image supprimée pour le jeu ID ${gameId}`);
  } else {
    console.log(`⚠️  Jeu ID ${gameId} introuvable`);
  }
}

// MENU PRINCIPAL
const action = process.argv[2];

switch(action) {
  case 'list':
    listAllGames();
    break;
    
  case 'associate':
    if (Object.keys(imageAssociations).length === 0) {
      console.log('⚠️  Aucune association définie !');
      console.log('📝 Éditez le fichier et ajoutez les associations dans imageAssociations\n');
      console.log('Exemple:');
      console.log('const imageAssociations = {');
      console.log('  1: "pokemon-rouge.png",');
      console.log('  2: "pokemon-or.svg",');
      console.log('};\n');
    } else {
      console.log('🚀 Association des images...\n');
      associateImages();
    }
    break;
    
  case 'remove':
    const gameId = parseInt(process.argv[3]);
    if (!gameId) {
      console.log('❌ Usage: node associate-images.js remove <gameId>');
    } else {
      removeImage(gameId);
    }
    break;
    
  default:
    console.log('📖 GUIDE D\'UTILISATION\n');
    console.log('1️⃣  LISTER TOUS LES JEUX:');
    console.log('   node associate-images.js list\n');
    
    console.log('2️⃣  ASSOCIER DES IMAGES:');
    console.log('   a) Placez vos images dans: server/uploads/');
    console.log('   b) Éditez ce fichier et remplissez imageAssociations');
    console.log('   c) Lancez: node associate-images.js associate\n');
    
    console.log('3️⃣  SUPPRIMER UNE IMAGE:');
    console.log('   node associate-images.js remove <gameId>\n');
    
    console.log('💡 EXEMPLES:');
    console.log('   node associate-images.js list');
    console.log('   node associate-images.js associate');
    console.log('   node associate-images.js remove 5\n');
}

db.close();
