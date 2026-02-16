import React, { useState, useEffect } from 'react';
import { X, Mail, User, Lock, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [resetMode, setResetMode] = useState(false); // Mode réinitialisation
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    pseudo: '',
    password: '',
    honeypot: '', // Champ caché pour piéger les bots
    mathAnswer: ''
  });
  
  // Math CAPTCHA
  const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  // Générer une nouvelle question mathématique
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathQuestion({ num1, num2, answer: num1 + num2 });
  };

  // Générer question au chargement et au changement d'onglet
  useEffect(() => {
    if (activeTab === 'register') {
      generateMathQuestion();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (resetMode) {
        // Mode réinitialisation de mot de passe
        const response = await fetch('http://localhost:5000/api/auth/reset-password-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail })
        });

        if (response.ok) {
          const data = await response.json();
          // Afficher le nouveau mot de passe (dev only)
          if (data.devMode) {
            setError("⚠️ Email non configuré. Consultez la console serveur.");
          } else {
            setError(`✅ Email envoyé à ${resetEmail} ! Consultez votre boîte mail.`);
          }
          setTimeout(() => {
            setResetMode(false);
            setResetEmail('');
            setError('');
          }, 8000);
        } else {
          const data = await response.json();
          
          // Gestion spécifique de l'erreur 429 (Rate Limiting)
          if (response.status === 429) {
            const minutesText = data.minutesLeft === 1 ? 'minute' : 'minutes';
            setError(`⏱️ ${data.error || `Trop de demandes. Réessayez dans ${data.minutesLeft} ${minutesText}.`}`);
          } else {
            setError(data.error || 'Email introuvable');
          }
        }
      } else if (activeTab === 'login') {
        await login(formData.pseudo, formData.password);
        onClose();
      } else {
        // Validation inscription
        if (!formData.email || !formData.pseudo || !formData.password) {
          setError('Tous les champs sont requis');
          setLoading(false);
          return;
        }

        // Vérification CAPTCHA
        if (parseInt(formData.mathAnswer) !== mathQuestion.answer) {
          setError('Réponse incorrecte au calcul');
          setLoading(false);
          generateMathQuestion(); // Nouvelle question
          return;
        }

        // Appel API avec les champs anti-bot
        await register(
          formData.email, 
          formData.pseudo, 
          formData.password,
          formData.mathAnswer,
          mathQuestion.answer,
          formData.honeypot
        );
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      if (activeTab === 'register') {
        generateMathQuestion(); // Nouvelle question en cas d'erreur
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-10
                     p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-center text-slate-900 mb-2">
              {resetMode ? 'Mot de passe oublié' : activeTab === 'login' ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-center text-slate-600 text-sm">
              {resetMode 
                ? 'Entrez votre email pour réinitialiser' 
                : activeTab === 'login' 
                  ? 'Ravis de vous revoir !' 
                  : 'Commencez votre aventure Pokémon'}
            </p>
          </div>

          {!resetMode && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                  setFormData({ ...formData, mathAnswer: '' });
                }}
                className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                  setFormData({ ...formData, mathAnswer: '' });
                }}
                className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
              >
                Inscription
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={`flex items-center gap-2 p-4 border rounded-xl text-sm ${
                error.includes('âœ…' && 'Email envoyé') 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetMode ? (
              /* Mode Réinitialisation */
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="input-field"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(false);
                      setResetEmail('');
                      setError('');
                    }}
                    className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    â† Retour Ã  la connexion
                  </button>
                </div>
              </>
            ) : (
              /* Mode Login/Register normal */
              <>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="votre@email.com"
                    required={activeTab === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Pseudo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VotrePseudo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  required
                  minLength={6}
                />
              </div>
              {activeTab === 'register' && (
                <p className="text-xs text-slate-500 mt-2">Au moins 6 caractères</p>
              )}
            </div>

            {/* HONEYPOT - Champ caché */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
              />
            </div>

            {/* MATH CAPTCHA - Compact */}
            {activeTab === 'register' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-amber-900">🧮 Vérification :</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg font-bold text-amber-900">
                      {mathQuestion.num1} + {mathQuestion.num2} =
                    </span>
                    <input
                      type="number"
                      name="mathAnswer"
                      value={formData.mathAnswer}
                      onChange={handleChange}
                      className="w-16 px-2 py-1 text-center border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="?"
                      required={activeTab === 'register'}
                      min="0"
                      max="20"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Chargement...' : activeTab === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>

            {/* Bouton Mot de passe oublié - Seulement en mode login */}
            {activeTab === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setError('');
                  }}
                  className="text-sm text-slate-500 hover:text-amber-600 transition-colors underline decoration-dotted"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 mt-4">
              {activeTab === 'login' 
                ? "Pas encore de compte ? Cliquez sur Inscription" 
                : "DéjÃ  un compte ? Cliquez sur Connexion"}
            </p>
            </>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .tab-button {
          flex: 1;
          padding: 0.875rem;
          font-weight: 600;
          border-radius: 0.75rem;
          transition: all 0.2s;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        
        .tab-button:hover {
          color: #334155;
          background: #f1f5f9;
        }
        
        .tab-button.active {
          color: white;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        
        .input-field {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .input-field::placeholder {
          color: #cbd5e1;
        }
        
        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
};

export default AuthPopup;
