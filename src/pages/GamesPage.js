import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trophy, Flame, Star, Zap, ChevronRight, Filter, Check, LogOut, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePopup from '../components/ProfilePopup';

const GamesPage = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  const getTotalScore = useCallback(() => {
    return games.reduce((total, game) => {
      const gameScore = game.challenges.reduce((sum, challenge) => {
        return sum + (challenge.completed ? challenge.points : 0);
      }, 0);
      return total + gameScore;
    }, 0);
  }, [games]);

  const DSCartridge = ({ image }) => {
    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow">
          {image && (
            <img src={`http://localhost:5000${image}`} alt="" className="w-full h-full object-contain" />
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/games`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChallenge = useCallback((challengeId, currentCompleted) => {
    const newCompleted = currentCompleted ? 0 : 1;
    
    // MISE À JOUR IMMÉDIATE - Synchrone
    setGames(prevGames => {
      const updatedGames = prevGames.map(game => ({
        ...game,
        challenges: game.challenges.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, completed: newCompleted }
            : challenge
        )
      }));
      
      // Mettre à jour selectedGame aussi pour sync immédiate
      if (selectedGame) {
        const updatedSelectedGame = updatedGames.find(g => g.id === selectedGame.id);
        if (updatedSelectedGame) {
          setSelectedGame(updatedSelectedGame);
        }
      }
      
      return updatedGames;
    });

    // Appel API en arrière-plan sans bloquer
    fetch(`${API_URL}/challenges/${challengeId}/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(error => {
      console.error('Erreur:', error);
    });
  }, [API_URL, token, selectedGame]);

  const difficultyColors = {
    easy: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    hard: 'bg-rose-50 border-rose-200 text-rose-700',
    extreme: 'bg-red-50 border-red-200 text-red-700'
  };

  const difficultyText = {
    easy: 'FACILE',
    medium: 'MOYEN',
    hard: 'DIFFICILE',
    extreme: 'EXTRÊME'
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'romhack': return 'ROM HACK';
      case 'fangame': return 'FAN GAME';
      case 'officiel': return 'JEU OFFICIEL';
      default: return type.toUpperCase();
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch(type) {
      case 'romhack': return 'bg-cyan-50 border-cyan-200 text-cyan-700';
      case 'fangame': return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'officiel': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-purple-50 border-purple-200 text-purple-700';
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || game.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white border border-slate-200 px-8 py-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-200 border-t-amber-600"></div>
            <span className="text-slate-700 font-medium">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-slate-900">
      {/* Bouton Pikachu Profile */}
      <button
        onClick={() => setShowProfile(true)}
        className="fixed bottom-4 left-4 z-50 w-16 h-16 bg-white border-2 border-amber-400 rounded-full 
                   flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-12 
                   transition-all duration-200"
        aria-label="Mon profil"
      >
        <img src="/pikachu.png" alt="Pikachu" className="w-12 h-12 object-contain" />
      </button>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Trophy className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-black logo-text">
                    POKÉQUEST
                  </h1>
                  <p className="text-sm text-slate-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Bienvenue, {user.pseudo}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Score Total</div>
                      <div className="text-2xl font-black text-slate-900">{getTotalScore()}</div>
                    </div>
                  </div>
                </div>

                {(user.admin === 1 || user.admin === true) && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                )}

                {/* Bouton Émulateur DS - Discret */}
                <button
                  onClick={() => navigate('/emulator')}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 px-5 py-3 rounded-xl 
                           text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center gap-2 shadow-sm
                           hover:shadow-md group"
                  title="Émulateur Nintendo DS"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🎮</span>
                  <span className="hidden sm:inline font-semibold">DS</span>
                </button>
                
                <button
                  onClick={logout}
                  className="bg-white border border-slate-200 px-5 py-3 rounded-xl text-slate-700 hover:text-slate-900 
                           hover:border-slate-300 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'romhack', label: 'ROM Hacks' },
                { key: 'fangame', label: 'Fan Games' },
                { key: 'officiel', label: 'Officiels' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`filter-button ${filterType === key ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          {!selectedGame ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => setSelectedGame(game)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <DSCartridge image={game.image} />
                    <span className={`badge ${getTypeBadgeStyle(game.type)}`}>
                      {getTypeLabel(game.type)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-slate-900 leading-tight min-h-[3.5rem]">
                    {game.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-slate-600 font-medium">{game.difficulty}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{game.challenges.filter(c => c.completed).length}/{game.challenges.length} défis</span>
                      <span className="font-bold text-amber-600">{game.challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0)} pts</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(game.challenges.filter(c => c.completed).length / game.challenges.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center text-slate-600 group-hover:text-slate-900 transition-colors">
                    <span className="text-sm font-semibold">Voir les défis</span>
                    <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedGame(null)}
                className="mb-8 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-700 hover:text-slate-900 
                         hover:border-slate-300 transition-colors flex items-center gap-2 group shadow-sm"
              >
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-2 transition-transform" />
                Retour aux jeux
              </button>
              
              <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-lg">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <DSCartridge image={selectedGame.image} />
                    <div>
                      <h2 className="text-4xl font-black mb-3 text-slate-900">
                        {selectedGame.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`badge ${getTypeBadgeStyle(selectedGame.type)}`}>
                          {getTypeLabel(selectedGame.type)}
                        </span>
                        <span className="text-slate-600 font-medium">{selectedGame.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl text-center shadow-sm">
                    <div className="text-4xl font-black text-slate-900 mb-1">
                      {selectedGame.challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 uppercase font-bold tracking-wider">points</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedGame.challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
                      onClick={() => toggleChallenge(challenge.id, challenge.completed)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`icon-container ${challenge.completed ? 'completed' : ''}`}>
                          {challenge.completed ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <Trophy className="w-6 h-6" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                            <h3 className="text-xl font-bold text-slate-900">
                              {challenge.title}
                            </h3>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`badge ${difficultyColors[challenge.difficulty]}`}>
                                {difficultyText[challenge.difficulty]}
                              </span>
                              <span className="text-amber-600 font-black text-lg whitespace-nowrap">
                                {challenge.points} pts
                              </span>
                            </div>
                          </div>
                          
                          {challenge.completed ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                              <Zap className="w-4 h-4" />
                              <span>Défi complété !</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Popup */}
      {showProfile && <ProfilePopup onClose={() => setShowProfile(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .logo-text {
          font-family: 'Orbitron', sans-serif;
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.05em;
        }
        
        .gradient-bg {
          background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          min-height: 100vh;
        }
        
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          color: #1e293b;
          font-size: 1rem;
          transition: border-color 0.1s, box-shadow 0.1s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .search-input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .filter-button {
          padding: 0.875rem 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          color: #475569;
          font-weight: 600;
          transition: all 0.1s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .filter-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .filter-button.active {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        
        .game-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          padding: 2rem;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .badge {
          padding: 0.5rem 1rem;
          border: 1px solid;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #f97316);
          border-radius: 9999px;
          transition: width 0.3s;
        }
        
        .challenge-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.1s;
        }
        
        .challenge-card:hover {
          background: #fafafa;
          transform: translateX(4px);
        }
        
        .challenge-card.completed {
          background: #f0fdf4;
          border-color: #86efac;
        }
        
        .challenge-card.completed:hover {
          background: #dcfce7;
        }
        
        .icon-container {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #d97706;
          transition: all 0.1s;
        }
        
        .icon-container.completed {
          background: #d1fae5;
          border-color: #a7f3d0;
          color: #059669;
        }
      `}</style>
    </div>
  );
};

export default GamesPage;
