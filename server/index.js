const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendPasswordResetEmail } = require('./emailConfig');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'pokemon-quest-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer le dossier uploads
if (!fs.existsSync('./server/uploads')) {
  fs.mkdirSync('./server/uploads', { recursive: true });
}

// ===== ANTI-BOT: RATE LIMITING =====
const rateLimitStore = new Map();
const passwordResetLimitStore = new Map(); // Rate limit spécifique pour reset password

const rateLimit = (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  if (record.count >= maxAttempts) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000 / 60);
    return { allowed: false, resetIn };
  }
  
  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Rate limit spécifique pour reset password : 1 fois toutes les 30 minutes par IP
const passwordResetRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = 30 * 60 * 1000; // 30 minutes
  const record = passwordResetLimitStore.get(ip);
  
  if (!record) {
    passwordResetLimitStore.set(ip, { lastAttempt: now, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (now > record.resetTime) {
    passwordResetLimitStore.set(ip, { lastAttempt: now, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  const minutesLeft = Math.ceil((record.resetTime - now) / 1000 / 60);
  return { allowed: false, minutesLeft };
};

// Nettoyage du store de reset password toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of passwordResetLimitStore.entries()) {
    if (now > value.resetTime) {
      passwordResetLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Configuration Multer
const storage = multer.diskStorage({
  destination: './server/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /svg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seulement les fichiers SVG et PNG sont autorisés!'));
  }
});

// Base de données
const db = new Database('./server/pokemon-quest.db');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    pseudo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    points INTEGER NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(user_id, challenge_id)
  );
`);

console.log('✅ Base de données initialisée');

// Créer admin par défaut si pas d'users
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, pseudo, password, admin) VALUES (?, ?, ?, ?)').run(
    'admin@pokequest.com',
    'admin',
    hashedPassword,
    1
  );
  console.log('✅ Compte admin créé : admin / admin123');
}

// Middleware auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Accès admin requis' });
  }
  next();
};

// ===== ROUTES AUTH =====

// Inscription avec ANTI-BOT
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, pseudo, password, mathAnswer, expectedAnswer, honeypot } = req.body;

    // 1️⃣ HONEYPOT
    if (honeypot) {
      console.log('🤖 Bot détecté (honeypot):', email);
      return res.status(400).json({ error: 'Erreur de validation' });
    }

    // 2️⃣ RATE LIMITING
    const ip = req.ip || req.connection.remoteAddress;
    const rateLimitResult = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    
    if (!rateLimitResult.allowed) {
      console.log('⏱️  Rate limit dépassé:', ip);
      return res.status(429).json({ 
        error: `Trop de tentatives. Réessayez dans ${rateLimitResult.resetIn} minute(s)` 
      });
    }

    // 3️⃣ MATH CAPTCHA
    if (!mathAnswer || !expectedAnswer || parseInt(mathAnswer) !== parseInt(expectedAnswer)) {
      console.log('🧮 Mauvaise réponse CAPTCHA');
      return res.status(400).json({ error: 'Réponse incorrecte au calcul' });
    }

    // 4️⃣ VALIDATION
    if (!email || !pseudo || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, pseudo, password) VALUES (?, ?, ?)');
    const result = stmt.run(email, pseudo, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, pseudo, admin: false }, JWT_SECRET);

    console.log('✅ Inscription réussie:', pseudo);
    res.json({ 
      token, 
      user: { id: result.lastInsertRowid, pseudo, email, admin: false }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email ou pseudo déjà utilisé' });
    } else {
      console.error('Erreur inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE pseudo = ?').get(pseudo);
    
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: user.id, pseudo: user.pseudo, admin: user.admin }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user.id, pseudo: user.pseudo, email: user.email, admin: user.admin }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Vérifier token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, pseudo, admin FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// Reset password
app.post('/api/auth/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // ⚡ RATE LIMITING PAR IP : 1 fois toutes les 30 minutes
    const clientIp = req.ip || req.connection.remoteAddress;
    const rateLimitCheck = passwordResetRateLimit(clientIp);
    
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: `Trop de demandes. Réessayez dans ${rateLimitCheck.minutesLeft} minute${rateLimitCheck.minutesLeft > 1 ? 's' : ''}.`,
        minutesLeft: rateLimitCheck.minutesLeft
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Email introuvable' });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);

    // Essayer d'envoyer l'email
    const emailResult = await sendPasswordResetEmail(user.email, user.pseudo, newPassword);

    if (emailResult.success) {
      console.log('✅ Email envoyé à:', user.email);
      res.json({ 
        success: true, 
        message: `Un email a été envoyé à ${user.email} avec votre nouveau mot de passe.`
      });
    } else {
      // Si l'email échoue, afficher le mot de passe (mode dev)
      console.log('⚠️  Échec envoi email, affichage en console:');
      console.log('═══════════════════════════════════════');
      console.log('🔑 MOT DE PASSE RÉINITIALISÉ (MODE DEV)');
      console.log('═══════════════════════════════════════');
      console.log(`Utilisateur: ${user.pseudo}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nouveau mot de passe: ${newPassword}`);
      console.log('═══════════════════════════════════════');
      
      res.json({ 
        success: true, 
        message: 'Configuration email non définie. Mot de passe affiché dans la console serveur.',
        devPassword: newPassword,
        devMode: true
      });
    }
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES GAMES =====

app.get('/api/games', authenticateToken, (req, res) => {
  const games = db.prepare(`
    SELECT g.*, 
    (SELECT COUNT(*) FROM challenges WHERE game_id = g.id) as challenge_count
    FROM games g
    ORDER BY g.created_at DESC
  `).all();

  const gamesWithChallenges = games.map(game => {
    const challenges = db.prepare('SELECT * FROM challenges WHERE game_id = ?').all(game.id);
    return { ...game, challenges };
  });

  res.json(gamesWithChallenges);
});

// ===== ROUTES USER CHALLENGES =====

app.get('/api/user/challenges', authenticateToken, (req, res) => {
  const completedChallenges = db.prepare(`
    SELECT challenge_id FROM user_challenges 
    WHERE user_id = ? AND completed = 1
  `).all(req.user.id);

  res.json(completedChallenges.map(c => c.challenge_id));
});

app.post('/api/user/challenges/toggle', authenticateToken, (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.id;

    const existing = db.prepare('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?')
      .get(userId, challengeId);

    if (existing) {
      const newCompleted = existing.completed ? 0 : 1;
      const completedAt = newCompleted ? new Date().toISOString() : null;
      
      db.prepare('UPDATE user_challenges SET completed = ?, completed_at = ? WHERE user_id = ? AND challenge_id = ?')
        .run(newCompleted, completedAt, userId, challengeId);
    } else {
      db.prepare('INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at) VALUES (?, ?, ?, ?)')
        .run(userId, challengeId, 1, new Date().toISOString());
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES PROFIL =====

app.put('/api/user/update-pseudo', authenticateToken, async (req, res) => {
  try {
    const { newPseudo } = req.body;
    const userId = req.user.id;

    if (!newPseudo || newPseudo.trim().length === 0) {
      return res.status(400).json({ error: 'Le pseudo ne peut pas être vide' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE pseudo = ? AND id != ?').get(newPseudo, userId);
    if (existing) {
      return res.status(400).json({ error: 'Ce pseudo est déjà utilisé' });
    }

    db.prepare('UPDATE users SET pseudo = ? WHERE id = ?').run(newPseudo, userId);

    console.log(`✅ Pseudo modifié: ${req.user.pseudo} → ${newPseudo}`);
    res.json({ success: true, newPseudo });
  } catch (error) {
    console.error('Erreur modification pseudo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/user/update-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

    console.log(`✅ Mot de passe modifié pour: ${user.pseudo}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur modification mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES ADMIN GAMES =====

app.post('/api/admin/games', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, type, difficulty, challenges } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const gameStmt = db.prepare('INSERT INTO games (name, type, difficulty, image) VALUES (?, ?, ?, ?)');
    const gameResult = gameStmt.run(name, type, difficulty, imagePath);
    const gameId = gameResult.lastInsertRowid;

    const parsedChallenges = JSON.parse(challenges);
    const challengeStmt = db.prepare('INSERT INTO challenges (game_id, title, difficulty, points) VALUES (?, ?, ?, ?)');

    parsedChallenges.forEach(challenge => {
      challengeStmt.run(gameId, challenge.title, challenge.difficulty, challenge.points);
    });

    res.json({ success: true, gameId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/games/:id', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, type, difficulty } = req.body;
    const gameId = req.params.id;
    
    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Jeu introuvable' });
    }
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : game.image;
    
    const updateStmt = db.prepare('UPDATE games SET name = ?, type = ?, difficulty = ?, image = ? WHERE id = ?');
    updateStmt.run(name, type, difficulty, imagePath, gameId);
    
    res.json({ success: true, gameId });
  } catch (error) {
    console.error('Erreur PUT /api/admin/games/:id:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

app.delete('/api/admin/games/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES ADMIN CHALLENGES =====

app.post('/api/admin/challenges', authenticateToken, isAdmin, (req, res) => {
  try {
    const { game_id, title, difficulty, points } = req.body;
    
    const stmt = db.prepare('INSERT INTO challenges (game_id, title, difficulty, points) VALUES (?, ?, ?, ?)');
    const result = stmt.run(game_id, title, difficulty, points);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/challenges/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { title, difficulty, points } = req.body;
    
    db.prepare('UPDATE challenges SET title = ?, difficulty = ?, points = ? WHERE id = ?')
      .run(title, difficulty, points, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/challenges/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM challenges WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES ADMIN USERS =====

app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = db.prepare('SELECT COUNT(*) as total FROM users').get();
    const totalUsers = countResult.total;
    const totalPages = Math.ceil(totalUsers / limit);

    const users = db.prepare(`
      SELECT id, email, pseudo, admin, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/users/:id/toggle-admin', authenticateToken, isAdmin, (req, res) => {
  try {
    const userId = req.params.id;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas modifier vos propres droits admin' });
    }

    const newAdminStatus = user.admin ? 0 : 1;
    db.prepare('UPDATE users SET admin = ? WHERE id = ?').run(newAdminStatus, userId);

    console.log(`✅ Admin status modifié: ${user.pseudo} → ${newAdminStatus ? 'Admin' : 'User'}`);
    res.json({ success: true, admin: newAdminStatus });
  } catch (error) {
    console.error('Erreur toggle admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const userId = req.params.id;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    console.log(`🗑️  Utilisateur supprimé: ${user.pseudo}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Base de données : ${path.resolve('./server/pokemon-quest.db')}`);
});
