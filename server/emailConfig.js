const nodemailer = require('nodemailer');

// Configuration de l'email
// IMPORTANT : Remplacez ces valeurs par vos vraies informations
const emailConfig = {
  service: 'gmail', // ou 'outlook', 'yahoo', etc.
  auth: {
    user: 'hugortlv2@gmail.com', // Votre adresse email
    pass: 'ebhk ekhj hnvm fuwe' // Mot de passe d'application Gmail
  }
};

// Créer le transporteur
const transporter = nodemailer.createTransport(emailConfig);

// Fonction pour envoyer le mot de passe par email
const sendPasswordResetEmail = async (toEmail, pseudo, newPassword) => {
  const mailOptions = {
    from: emailConfig.auth.user,
    to: toEmail,
    subject: '🔑 Réinitialisation de votre mot de passe - PokéQuest',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: white;
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 20px;
          }
          .password-box {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 30px 0;
          }
          .password-label {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            color: #d97706;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .password {
            font-size: 28px;
            font-weight: 900;
            color: #1e293b;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
          }
          .warning {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .warning-title {
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 8px;
          }
          .warning-text {
            color: #7f1d1d;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer {
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #f97316);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 POKÉQUEST</h1>
          </div>
          <div class="content">
            <p class="greeting">Bonjour <strong>${pseudo}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            
            <div class="password-box">
              <div class="password-label">Votre nouveau mot de passe</div>
              <div class="password">${newPassword}</div>
            </div>

            <div class="warning">
              <div class="warning-title">⚠️ Important - Sécurité</div>
              <div class="warning-text">
                • Connectez-vous immédiatement et changez ce mot de passe<br>
                • Ne partagez jamais ce mot de passe avec personne<br>
                • Supprimez cet email après avoir changé votre mot de passe
              </div>
            </div>

            <p style="text-align: center;">
              <a href="http://localhost:3000" class="button">Se connecter maintenant</a>
            </p>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 PokéQuest - Système de gestion de défis Pokémon</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };
