# PokéQuest - Défis Pokémon 🎮

Application complète React + Node.js avec authentification, base de données et panneau admin pour suivre vos défis et objectifs sur les jeux Pokémon officiels, ROM hacks et fan games.

## 🚀 Démarrage rapide

### Installation des dépendances

```bash
npm install
```

### Lancement de l'application complète (Frontend + Backend)

```bash
npm run dev
```

Cela va démarrer :
- Le serveur backend sur http://localhost:5000
- L'application React sur http://localhost:3000

### Lancement séparé

**Backend seulement :**
```bash
npm run server
```

**Frontend seulement :**
```bash
npm start
```

## ✨ Fonctionnalités

### Authentification
- 🔐 Système d'inscription/connexion complet
- 🔑 JWT pour la sécurité
- 👤 Gestion des profils utilisateurs
- 🛡️ Rôles admin

### Pour les utilisateurs
- 🎯 Liste de jeux Pokémon (ROM hacks et fan games)
- 🏆 Système de défis avec points
- ✅ Marquer les défis comme complétés
- 📊 Suivi de progression personnalisé
- 🔍 Recherche et filtres
- 📱 Design responsive (mobile, tablette, desktop)
- 🎨 Interface moderne avec effets visuels
- 💾 Sauvegarde automatique en base de données

### Pour les admins
- ➕ Ajouter de nouveaux jeux
- 📝 Créer des défis personnalisés
- 🖼️ Upload d'images (SVG/PNG)
- 🎨 Configuration des couleurs et thèmes
- 🗑️ Gestion complète des jeux

## 🛠️ Technologies utilisées

### Frontend
- React 18
- React Router v6
- Context API (gestion d'état)
- Tailwind CSS
- Lucide React (icônes)
- Google Fonts (Orbitron, Rajdhani)

### Backend
- Node.js + Express
- SQLite (base de données)
- JWT (authentification)
- bcrypt (hachage des mots de passe)
- Multer (upload de fichiers)

## 📁 Structure du projet

```
pokemon-quest/
├── public/
│   └── index.html
├── server/
│   ├── index.js           # Serveur Express
│   ├── uploads/           # Images uploadées
│   └── pokemon-quest.db   # Base de données SQLite
├── src/
│   ├── components/
│   │   └── AuthPopup.js   # Popup connexion/inscription
│   ├── contexts/
│   │   └── AuthContext.js # Contexte d'authentification
│   ├── pages/
│   │   ├── LandingPage.js # Page d'accueil
│   │   ├── GamesPage.js   # Page des jeux
│   │   └── AdminPage.js   # Panneau admin
│   ├── App.js             # Router principal
│   ├── index.js           # Point d'entrée
│   └── index.css          # Styles globaux
├── package.json
└── README.md
```

## 🗃️ Base de données

La base de données SQLite contient 4 tables :

### users
- id, email, pseudo, password (haché), admin, created_at

### games
- id, name, type, difficulty, cartridgeColor, color, image, created_at

### challenges
- id, game_id, title, difficulty, points

### user_challenges
- id, user_id, challenge_id, completed, completed_at

## 👨‍💼 Créer un compte admin

Par défaut, tous les utilisateurs ont `admin = false`. Pour créer un admin :

1. Créez un compte normalement via l'interface
2. Ouvrez la base de données : `server/pokemon-quest.db`
3. Mettez à jour : `UPDATE users SET admin = 1 WHERE pseudo = 'votre_pseudo';`

Ou utilisez un outil SQLite comme DB Browser for SQLite.

## 🎮 Utilisation

### En tant qu'utilisateur
1. Créez un compte ou connectez-vous
2. Parcourez les jeux disponibles
3. Cliquez sur un jeu pour voir ses défis
4. Cliquez sur un défi pour le marquer comme complété
5. Suivez votre progression et vos points

### En tant qu'admin
1. Connectez-vous avec un compte admin
2. Cliquez sur le bouton "Admin" en haut à droite
3. Remplissez le formulaire pour ajouter un jeu
4. Ajoutez autant de défis que nécessaire
5. (Optionnel) Uploadez une image SVG ou PNG
6. Cliquez sur "Envoyer"

## 🎨 Personnalisation

### Ajouter des couleurs de cartouche
Éditez `src/pages/AdminPage.js` et `src/pages/GamesPage.js` pour ajouter de nouvelles options de couleurs.

### Modifier le thème
Les couleurs utilisent Tailwind CSS. Modifiez les classes dans les composants.

## 🔒 Sécurité

- Mots de passe hachés avec bcrypt
- Tokens JWT pour l'authentification
- Protection des routes admin
- Validation des fichiers uploadés (SVG/PNG uniquement, 5MB max)

## 📝 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token

### Jeux
- `GET /api/games` - Récupérer tous les jeux (authentifié)
- `POST /api/challenges/:id/toggle` - Marquer un défi (authentifié)

### Admin
- `POST /api/admin/games` - Ajouter un jeu (admin)
- `DELETE /api/admin/games/:id` - Supprimer un jeu (admin)

## 🛠️ Résolution de problèmes

### Erreur de connexion à la base de données
```bash
# Supprimez la base de données et redémarrez
rm server/pokemon-quest.db
npm run dev
```

### Port déjà utilisé
Modifiez le port dans `server/index.js` (ligne 8) si le port 5000 est utilisé.

### Problèmes d'upload d'images
Vérifiez que le dossier `server/uploads` existe et a les permissions d'écriture.

## 📞 Support

En cas de problème, vérifiez :
1. Que Node.js est bien installé (`node --version`)
2. Que les dépendances sont installées (`npm install`)
3. Que le serveur backend est démarré
4. Les logs dans la console pour les erreurs

Bon développement ! 🚀
