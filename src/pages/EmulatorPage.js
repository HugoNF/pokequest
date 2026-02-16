import React, { useState, useRef, useEffect } from 'react';
import { Upload, Home, AlertCircle, Gamepad2, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmulatorPage = () => {
  const navigate = useNavigate();
  const [romLoaded, setRomLoaded] = useState(false);
  const [romName, setRomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const gameContainerRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.nds') && !file.name.endsWith('.gba')) {
      setError('Veuillez sélectionner un fichier .nds ou .gba');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Lire le fichier comme Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const romData = event.target.result;
        
        // Déterminer le type de console
        const core = file.name.endsWith('.nds') ? 'nds' : 'gba';
        
        // Initialiser EmulatorJS
        initEmulator(romData, core);
        
        setRomName(file.name);
        setRomLoaded(true);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du chargement: ' + err.message);
      setIsLoading(false);
    }
  };

  const initEmulator = (romUrl, core) => {
    // Nettoyer le conteneur
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = '<div id="game"></div>';
    }

    // Configuration EmulatorJS
    window.EJS_player = '#game';
    window.EJS_core = core; // 'nds' ou 'gba'
    window.EJS_gameUrl = romUrl;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    
    // Options
    window.EJS_startOnLoaded = true;
    window.EJS_volume = 0.5;
    window.EJS_color = '#3b82f6';
    window.EJS_backgroundColor = '#0f172a';
    
    // Callbacks
    window.EJS_onGameStart = () => {
      console.log('✅ Jeu démarré');
    };
    
    window.EJS_onLoadState = () => {
      console.log('✅ Sauvegarde chargée');
    };

    // Charger le script EmulatorJS
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const resetEmulator = () => {
    setRomLoaded(false);
    setRomName('');
    setError('');
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = '';
    }
    // Recharger la page pour nettoyer EmulatorJS
    window.location.reload();
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/games')}
              className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Home className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <Gamepad2 className="w-10 h-10 text-blue-600" />
                Émulateur Nintendo DS / GBA
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                EmulatorJS - Jouez à vos jeux Pokémon favoris
              </p>
            </div>
          </div>
          
          {romLoaded && (
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                <p className="text-xs text-slate-600">ROM chargée :</p>
                <p className="font-bold text-slate-900 truncate max-w-xs">{romName}</p>
              </div>
              <button
                onClick={resetEmulator}
                className="bg-red-50 border border-red-200 p-3 rounded-xl hover:bg-red-100 transition-colors"
                title="Charger une autre ROM"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer légal */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">⚖️ Avertissement légal</p>
            <p>Utilisez uniquement des ROMs que vous possédez légalement. Cet émulateur est fourni à des fins éducatives uniquement.</p>
          </div>
        </div>

        {/* Conteneur principal */}
        <div className="emulator-container bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Zone d'émulation */}
          <div className="emulator-screens bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            {!romLoaded ? (
              /* Zone d'upload */
              <div 
                className="rom-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-white/70 mb-4" />
                <p className="text-xl font-bold text-white mb-2">
                  Chargez votre ROM
                </p>
                <p className="text-white/70 mb-4">Fichiers .nds ou .gba acceptés</p>
                <p className="text-xs text-white/50 mb-6">
                  Pokémon Black/White, HeartGold/SoulSilver, Platinum, Diamond/Pearl, Ruby/Sapphire/Emerald...
                </p>
                <button className="upload-button" disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Parcourir'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nds,.gba"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              /* Conteneur EmulatorJS */
              <div 
                ref={gameContainerRef}
                className="emulator-game-container"
              >
                <div id="game"></div>
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-t border-red-200 px-6 py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          {romLoaded && (
            <div className="instructions-section">
              <p className="text-xs font-bold text-slate-700 mb-3">⌨️ Contrôles</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">D-Pad</p>
                  <p className="text-xs text-slate-600">↑ ↓ ← →</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Boutons</p>
                  <p className="text-xs text-slate-600">Z (B) · X (A)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Gâchettes</p>
                  <p className="text-xs text-slate-600">A (L) · S (R)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Menu</p>
                  <p className="text-xs text-slate-600">Enter · Shift</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                💾 Les sauvegardes sont automatiques. Utilisez le menu EmulatorJS (☰) pour sauvegarder/charger.
              </p>
            </div>
          )}
        </div>

        {/* Instructions d'utilisation */}
        {!romLoaded && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-blue-600" />
              Comment utiliser
            </h3>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>Cliquez sur "Parcourir" pour charger votre ROM (.nds pour DS, .gba pour Game Boy Advance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>L'émulateur se charge automatiquement (peut prendre 10-15 secondes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Utilisez les contrôles clavier ou cliquez sur le menu ☰ pour configurer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>Les sauvegardes se font automatiquement dans votre navigateur</span>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-900 mb-2">🎮 Jeux Pokémon compatibles :</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div>
                  <p className="font-semibold mb-1">Nintendo DS (.nds)</p>
                  <ul className="space-y-0.5">
                    <li>• Diamond / Pearl / Platinum</li>
                    <li>• HeartGold / SoulSilver</li>
                    <li>• Black / White 1 & 2</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Game Boy Advance (.gba)</p>
                  <ul className="space-y-0.5">
                    <li>• Ruby / Sapphire / Emerald</li>
                    <li>• FireRed / LeafGreen</li>
                    <li>• Mystery Dungeon</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gradient-bg {
          background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
          min-height: 100vh;
        }

        .emulator-screens {
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rom-upload-zone {
          text-align: center;
          padding: 4rem 2rem;
          border: 3px dashed rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          max-width: 500px;
        }

        .rom-upload-zone:hover {
          border-color: rgba(96, 165, 250, 0.6);
          background: rgba(96, 165, 250, 0.1);
        }

        .upload-button {
          padding: 0.875rem 2.5rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .upload-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .upload-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .emulator-game-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        #game {
          width: 100%;
          height: 600px;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .instructions-section {
          padding: 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default EmulatorPage;
