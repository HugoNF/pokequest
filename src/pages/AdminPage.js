import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Upload, Save, Sparkles, Edit, X, Image as ImageIcon, Trophy, User, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  
  // États pour l'ajout de jeu
  const [formData, setFormData] = useState({
    name: '',
    type: 'romhack',
    difficulty: 'Moyen',
    image: null
  });
  
  const [challenges, setChallenges] = useState([
    { title: '', difficulty: 'medium', points: 100 }
  ]);

  // États pour la gestion des jeux
  const [games, setGames] = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    difficulty: '',
    image: null
  });
  
  // États pour la gestion des défis
  const [editingChallenges, setEditingChallenges] = useState([]);
  const [newChallenges, setNewChallenges] = useState([]);
  
  // États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchGames();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users?page=${currentPage}&limit=${usersPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const toggleAdmin = async (userId, currentAdminStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Statut admin modifié avec succès !');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors de la modification');
      }
    } catch (error) {
      setMessage('Erreur lors de la modification');
      console.error(error);
    }
  };

  const deleteUser = async (userId, pseudo) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${pseudo}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Utilisateur supprimé avec succès !');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors de la suppression');
      }
    } catch (error) {
      setMessage('Erreur lors de la suppression');
      console.error(error);
    }
  };

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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(svg\+xml|png)$/)) {
        setMessage('Seuls les fichiers SVG et PNG sont acceptés');
        return;
      }
      setFormData({
        ...formData,
        image: file
      });
    }
  };

  const handleChallengeChange = (index, field, value) => {
    const newChallenges = [...challenges];
    newChallenges[index][field] = value;
    setChallenges(newChallenges);
  };

  const addChallenge = () => {
    setChallenges([...challenges, { title: '', difficulty: 'medium', points: 100 }]);
  };

  const removeChallenge = (index) => {
    if (challenges.length > 1) {
      setChallenges(challenges.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('challenges', JSON.stringify(challenges));
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/admin/games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        setMessage('Jeu ajouté avec succès !');
        setFormData({
          name: '',
          type: 'romhack',
          difficulty: 'Moyen',
          image: null
        });
        setChallenges([{ title: '', difficulty: 'medium', points: 100 }]);
        
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('Erreur lors de l\'ajout du jeu');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'ajout du jeu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'édition du jeu
  const startEditingGame = (game) => {
    setEditingGame(game);
    setEditForm({
      name: game.name,
      type: game.type,
      difficulty: game.difficulty,
      image: null
    });
    setEditingChallenges([...game.challenges]);
    setNewChallenges([]);
  };

  const cancelEditing = () => {
    setEditingGame(null);
    setEditForm({
      name: '',
      type: '',
      difficulty: '',
      image: null
    });
    setEditingChallenges([]);
    setNewChallenges([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(svg\+xml|png)$/)) {
        setMessage('Seuls les fichiers SVG et PNG sont acceptés');
        return;
      }
      setEditForm({
        ...editForm,
        image: file
      });
    }
  };

  // Gestion des défis existants
  const handleExistingChallengeChange = (index, field, value) => {
    const updated = [...editingChallenges];
    updated[index][field] = value;
    setEditingChallenges(updated);
  };

  const deleteExistingChallenge = async (challengeId, index) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updated = editingChallenges.filter((_, i) => i !== index);
        setEditingChallenges(updated);
        setMessage('Défi supprimé avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors de la suppression du défi');
      }
    } catch (error) {
      setMessage('Erreur lors de la suppression du défi');
      console.error(error);
    }
  };

  // Gestion des nouveaux défis
  const handleNewChallengeChange = (index, field, value) => {
    const updated = [...newChallenges];
    updated[index][field] = value;
    setNewChallenges(updated);
  };

  const addNewChallenge = () => {
    setNewChallenges([...newChallenges, { title: '', difficulty: 'medium', points: 100 }]);
  };

  const removeNewChallenge = (index) => {
    setNewChallenges(newChallenges.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Mettre à jour le jeu
      const formDataToSend = new FormData();
      formDataToSend.append('name', editForm.name);
      formDataToSend.append('type', editForm.type);
      formDataToSend.append('difficulty', editForm.difficulty);
      
      if (editForm.image) {
        formDataToSend.append('image', editForm.image);
      }

      const gameResponse = await fetch(`${API_URL}/admin/games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!gameResponse.ok) {
        const errorData = await gameResponse.json();
        console.error('Erreur backend:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la modification du jeu');
      }

      // 2. Mettre à jour les défis existants
      for (const challenge of editingChallenges) {
        const challengeResponse = await fetch(`${API_URL}/admin/challenges/${challenge.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: challenge.title,
            difficulty: challenge.difficulty,
            points: challenge.points
          })
        });
        
        if (!challengeResponse.ok) {
          console.error('Erreur mise à jour défi:', await challengeResponse.json());
        }
      }

      // 3. Ajouter les nouveaux défis
      for (const challenge of newChallenges) {
        if (challenge.title.trim()) {
          const newChallengeResponse = await fetch(`${API_URL}/admin/challenges`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              game_id: editingGame.id,
              title: challenge.title,
              difficulty: challenge.difficulty,
              points: challenge.points
            })
          });
          
          if (!newChallengeResponse.ok) {
            console.error('Erreur ajout défi:', await newChallengeResponse.json());
          }
        }
      }

      setMessage('Jeu et défis modifiés avec succès !');
      cancelEditing();
      fetchGames();
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage(`Erreur lors de la modification: ${error.message}`);
      console.error('Erreur complète:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce jeu ? Tous ses défis seront aussi supprimés.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Jeu supprimé avec succès !');
        fetchGames();
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('Erreur lors de la suppression du jeu');
      }
    } catch (error) {
      setMessage('Erreur lors de la suppression du jeu');
      console.error(error);
    }
  };

  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    extreme: 'Extrême'
  };

  // Filtrer les jeux
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || game.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!user?.admin && user?.admin !== 1) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white border border-slate-200 px-8 py-6 rounded-2xl shadow-lg">
          <div className="text-red-600 text-xl font-semibold">Accès non autorisé</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-slate-900">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/games')}
            className="bg-white border border-slate-200 p-3 rounded-xl hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-4xl lg:text-5xl font-black gradient-text-admin flex items-center gap-3">
            <Sparkles className="w-10 h-10" />
            PANNEAU ADMIN
          </h1>
        </div>

        {message && (
          <div className={`mb-8 bg-white border-2 p-5 rounded-2xl shadow-sm ${
            message.includes('succès') 
              ? 'border-emerald-300 bg-emerald-50' 
              : 'border-red-300 bg-red-50'
          }`}>
            <div className={`font-semibold ${
              message.includes('succès') ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {message}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('add')}
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          >
            <Plus className="w-5 h-5" />
            Ajouter un Jeu
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
          >
            <Edit className="w-5 h-5" />
            Gérer les Jeux
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          >
            <User className="w-5 h-5" />
            Utilisateurs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'add' ? (
          /* FORMULAIRE D'AJOUT */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Game Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Informations du Jeu
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Nom du jeu *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-modern"
                    placeholder="ex: Pokémon Émeraude"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="input-modern"
                    >
                      <option value="romhack">ROM Hack</option>
                      <option value="fangame">Fan Game</option>
                      <option value="officiel">Jeu Officiel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Difficulté *
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="input-modern"
                    >
                      <option value="Facile">Facile</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Difficile">Difficile</option>
                      <option value="Très Difficile">Très Difficile</option>
                      <option value="Extrême">Extrême</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Image du jeu (SVG ou PNG) - Optionnel
                  </label>
                  <input
                    type="file"
                    accept=".svg,.png"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="file-input-label"
                  >
                    <Upload className="w-5 h-5" />
                    {formData.image ? formData.image.name : 'Choisir une image'}
                  </label>
                </div>
              </div>
            </div>

            {/* Challenges */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                  <Trophy className="w-6 h-6 text-amber-600" />
                  Défis
                </h2>
                <button
                  type="button"
                  onClick={addChallenge}
                  className="button-add"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <div key={index} className="challenge-item">
                    {challenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChallenge(index)}
                        className="button-delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}

                    <div className="space-y-4 pr-12">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Titre du défi *
                        </label>
                        <input
                          type="text"
                          value={challenge.title}
                          onChange={(e) => handleChallengeChange(index, 'title', e.target.value)}
                          required
                          className="input-modern"
                          placeholder="ex: Terminer le Nuzlocke"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Difficulté *
                          </label>
                          <select
                            value={challenge.difficulty}
                            onChange={(e) => handleChallengeChange(index, 'difficulty', e.target.value)}
                            className="input-modern"
                          >
                            <option value="easy">Facile</option>
                            <option value="medium">Moyen</option>
                            <option value="hard">Difficile</option>
                            <option value="extreme">Extrême</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Points *
                          </label>
                          <input
                            type="number"
                            value={challenge.points}
                            onChange={(e) => handleChallengeChange(index, 'points', parseInt(e.target.value))}
                            required
                            min="1"
                            className="input-modern"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              <Save className="w-6 h-6" />
              {loading ? 'Envoi en cours...' : 'Créer le jeu'}
            </button>
          </form>
        ) : activeTab === 'manage' ? (
          /* GESTION DES JEUX */
          <div className="space-y-6">
            {editingGame ? (
              /* FORMULAIRE D'ÉDITION COMPLET */
              <div className="space-y-6">
                {/* Info du jeu */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Modifier : {editingGame.name}
                    </h2>
                    <button
                      onClick={cancelEditing}
                      className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-700" />
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Nom du jeu *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          required
                          className="input-modern"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Type *
                          </label>
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditChange}
                            className="input-modern"
                          >
                            <option value="romhack">ROM Hack</option>
                            <option value="fangame">Fan Game</option>
                            <option value="officiel">Jeu Officiel</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Difficulté *
                          </label>
                          <select
                            name="difficulty"
                            value={editForm.difficulty}
                            onChange={handleEditChange}
                            className="input-modern"
                          >
                            <option value="Facile">Facile</option>
                            <option value="Moyen">Moyen</option>
                            <option value="Difficile">Difficile</option>
                            <option value="Très Difficile">Très Difficile</option>
                            <option value="Extrême">Extrême</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Changer l'image (optionnel)
                        </label>
                        {editingGame.image && (
                          <div className="mb-3 flex items-center gap-3">
                            <img 
                              src={`http://localhost:5000${editingGame.image}`} 
                              alt={editingGame.name}
                              className="w-20 h-20 object-contain bg-slate-100 rounded-lg p-2"
                            />
                            <span className="text-sm text-slate-600">Image actuelle</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".svg,.png"
                          onChange={handleEditImageChange}
                          className="hidden"
                          id="edit-image-upload"
                        />
                        <label
                          htmlFor="edit-image-upload"
                          className="file-input-label"
                        >
                          <ImageIcon className="w-5 h-5" />
                          {editForm.image ? editForm.image.name : 'Choisir une nouvelle image'}
                        </label>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Défis existants */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Trophy className="w-6 h-6 text-amber-600" />
                    Défis Existants ({editingChallenges.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {editingChallenges.map((challenge, index) => (
                      <div key={challenge.id} className="challenge-item">
                        <button
                          type="button"
                          onClick={() => deleteExistingChallenge(challenge.id, index)}
                          className="button-delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="space-y-4 pr-12">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Titre du défi *
                            </label>
                            <input
                              type="text"
                              value={challenge.title}
                              onChange={(e) => handleExistingChallengeChange(index, 'title', e.target.value)}
                              className="input-modern"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Difficulté *
                              </label>
                              <select
                                value={challenge.difficulty}
                                onChange={(e) => handleExistingChallengeChange(index, 'difficulty', e.target.value)}
                                className="input-modern"
                              >
                                <option value="easy">Facile</option>
                                <option value="medium">Moyen</option>
                                <option value="hard">Difficile</option>
                                <option value="extreme">Extrême</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Points *
                              </label>
                              <input
                                type="number"
                                value={challenge.points}
                                onChange={(e) => handleExistingChallengeChange(index, 'points', parseInt(e.target.value))}
                                min="1"
                                className="input-modern"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nouveaux défis */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                      <Plus className="w-6 h-6 text-green-600" />
                      Ajouter de Nouveaux Défis
                    </h3>
                    <button
                      type="button"
                      onClick={addNewChallenge}
                      className="button-add"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter un défi
                    </button>
                  </div>

                  {newChallenges.length > 0 && (
                    <div className="space-y-4">
                      {newChallenges.map((challenge, index) => (
                        <div key={index} className="challenge-item bg-green-50 border-green-200">
                          <button
                            type="button"
                            onClick={() => removeNewChallenge(index)}
                            className="button-delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <div className="space-y-4 pr-12">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Titre du défi *
                              </label>
                              <input
                                type="text"
                                value={challenge.title}
                                onChange={(e) => handleNewChallengeChange(index, 'title', e.target.value)}
                                className="input-modern"
                                placeholder="ex: Battre la Ligue sans objets"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Difficulté *
                                </label>
                                <select
                                  value={challenge.difficulty}
                                  onChange={(e) => handleNewChallengeChange(index, 'difficulty', e.target.value)}
                                  className="input-modern"
                                >
                                  <option value="easy">Facile</option>
                                  <option value="medium">Moyen</option>
                                  <option value="hard">Difficile</option>
                                  <option value="extreme">Extrême</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Points *
                                </label>
                                <input
                                  type="number"
                                  value={challenge.points}
                                  onChange={(e) => handleNewChallengeChange(index, 'points', parseInt(e.target.value))}
                                  min="1"
                                  className="input-modern"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {newChallenges.length === 0 && (
                    <p className="text-slate-500 text-center py-8">
                      Cliquez sur "Ajouter un défi" pour créer de nouveaux défis
                    </p>
                  )}
                </div>

                {/* Boutons de sauvegarde */}
                <div className="flex gap-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={loading}
                    className="submit-button flex-1"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Sauvegarde...' : 'Sauvegarder Tout'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-8 py-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              /* LISTE DES JEUX */
              <div className="space-y-6">
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
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
                        className={`filter-button-admin ${filterType === key ? 'active' : ''}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compteur de résultats */}
                <div className="text-sm text-slate-600">
                  {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé{filteredGames.length > 1 ? 's' : ''}
                </div>

                {/* Grille des jeux */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game) => (
                  <div key={game.id} className="game-manage-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {game.image ? (
                          <img 
                            src={`http://localhost:5000${game.image}`} 
                            alt={game.name}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className={`badge ${
                        game.type === 'officiel' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        game.type === 'romhack' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                        'bg-pink-50 border-pink-200 text-pink-700'
                      }`}>
                        {game.type === 'officiel' ? 'OFFICIEL' : game.type === 'romhack' ? 'ROM HACK' : 'FAN GAME'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight min-h-[3rem]">
                      {game.name}
                    </h3>

                    <div className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold">Difficulté:</span> {game.difficulty}
                    </div>

                    <div className="text-sm text-slate-600 mb-6">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      {game.challenges?.length || 0} défis
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingGame(game)}
                        className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteGame(game.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          /* GESTION DES UTILISATEURS */
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Gestion des Utilisateurs
                </h2>
                <div className="text-sm text-slate-600">
                  Page {currentPage} sur {totalPages} • {users.length} utilisateur(s)
                </div>
              </div>

              {/* Liste des utilisateurs */}
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                        {user.pseudo.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{user.pseudo}</div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Admin */}
                      <button
                        onClick={() => toggleAdmin(user.id, user.admin)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          user.admin
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        {user.admin ? 'Admin' : 'User'}
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => deleteUser(user.id, user.pseudo)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                          : 'bg-white border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        
        .gradient-bg {
          background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
        }
        
        .gradient-text-admin {
          font-family: 'Orbitron', sans-serif;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.05em;
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          font-weight: 600;
          color: #475569;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .tab-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .tab-button.active {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        .input-modern {
          width: 100%;
          padding: 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        .input-modern:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .file-input-label {
          display: flex;
          align-items: center;
          justify-center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border: 2px dashed rgba(245, 158, 11, 0.3);
          border-radius: 0.75rem;
          color: #d97706;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .file-input-label:hover {
          background: rgba(251, 191, 36, 0.15);
          border-color: rgba(245, 158, 11, 0.5);
        }
        
        .button-add {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        
        .button-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        .challenge-item {
          position: relative;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.2s;
        }
        
        .challenge-item:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .button-delete {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          color: #dc2626;
          transition: all 0.2s;
        }
        
        .button-delete:hover {
          background: rgba(239, 68, 68, 0.15);
          transform: scale(1.05);
        }
        
        .submit-button {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: none;
          border-radius: 1rem;
          color: white;
          font-size: 1.125rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-center;
          gap: 0.75rem;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(245, 158, 11, 0.5);
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .game-manage-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          padding: 1.5rem;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .game-manage-card:hover {
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
        
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          color: #1e293b;
          font-size: 1rem;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 1rem center;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .filter-button-admin {
          padding: 0.875rem 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          color: #475569;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .filter-button-admin:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .filter-button-admin.active {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
