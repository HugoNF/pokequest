import React, { useState } from 'react';
import { X, User, Lock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePopup = ({ onClose }) => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pseudo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pseudoData, setPseudoData] = useState({
    newPseudo: user?.pseudo || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const handlePseudoChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/update-pseudo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPseudo: pseudoData.newPseudo })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Pseudo modifié avec succès !');
        setTimeout(() => {
          window.location.reload(); // Recharger pour mettre à jour
        }, 1500);
      } else {
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/update-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Mot de passe modifié avec succès !');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
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
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-2xl">
                {user?.pseudo?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-3xl font-black text-center text-slate-900 mb-2">
              Mon Profil
            </h2>
            <p className="text-center text-slate-600 text-sm">
              {user?.email}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('pseudo');
                setError('');
                setSuccess('');
              }}
              className={`tab-button ${activeTab === 'pseudo' ? 'active' : ''}`}
            >
              Pseudo
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setError('');
                setSuccess('');
              }}
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            >
              Mot de passe
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-4">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {activeTab === 'pseudo' ? (
            <form onSubmit={handlePseudoChange} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nouveau pseudo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={pseudoData.newPseudo}
                    onChange={(e) => setPseudoData({ newPseudo: e.target.value })}
                    className="input-field"
                    placeholder="NouveauPseudo"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || pseudoData.newPseudo === user?.pseudo}
                className="submit-button"
              >
                {loading ? 'Modification...' : 'Modifier le pseudo'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Vous serez déconnecté après la modification
              </p>
            </form>
          )}
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

export default ProfilePopup;
