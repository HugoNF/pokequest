import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Download, Maximize2, Volume2, VolumeX, X } from 'lucide-react';

const EmulatorDS = () => {
  const [romLoaded, setRomLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialiser l'émulateur
  useEffect(() => {
    // Ici on initialiserait l'émulateur
    // Pour l'instant, c'est un placeholder
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.nds') || file.name.endsWith('.gba'))) {
      // Charger la ROM
      console.log('ROM chargée:', file.name);
      setRomLoaded(true);
    } else {
      alert('Veuillez sélectionner un fichier .nds ou .gba');
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    // Reset l'émulateur
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      canvasRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const downloadSave = () => {
    // Télécharger la sauvegarde
    console.log('Téléchargement de la sauvegarde...');
  };

  return (
    <div className="emulator-container">
      <div className="emulator-wrapper">
        {/* Header */}
        <div className="emulator-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
              <img src="/ds-icon.png" alt="DS" className="w-6 h-6" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Émulateur Nintendo DS</h3>
              <p className="text-xs text-slate-600">Compatible .nds et .gba</p>
            </div>
          </div>
        </div>

        {/* Écrans DS */}
        <div className="emulator-screens">
          {!romLoaded ? (
            /* Zone de drop pour la ROM */
            <div className="rom-upload-zone" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-lg font-bold text-slate-700 mb-2">Chargez votre ROM</p>
              <p className="text-sm text-slate-500 mb-4">Cliquez ou glissez un fichier .nds ou .gba</p>
              <button className="upload-button">
                Parcourir
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
            /* Écrans de l'émulateur */
            <div className="ds-screens">
              {/* Écran du haut */}
              <div className="screen-top">
                <canvas ref={canvasRef} width="256" height="192" className="ds-canvas">
                  Votre navigateur ne supporte pas Canvas
                </canvas>
              </div>
              
              {/* Écran du bas (tactile) */}
              <div className="screen-bottom">
                <canvas width="256" height="192" className="ds-canvas touchscreen">
                  Votre navigateur ne supporte pas Canvas
                </canvas>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles */}
        {romLoaded && (
          <div className="emulator-controls">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="control-button primary">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={reset} className="control-button">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={toggleMute} className="control-button">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={downloadSave} className="control-button">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} className="control-button">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button onClick={() => setRomLoaded(false)} className="control-button danger">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Instructions clavier */}
        {romLoaded && (
          <div className="keyboard-info">
            <p className="text-xs text-slate-600 font-semibold mb-2">Contrôles clavier :</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>↑↓←→ : D-Pad</div>
              <div>Z/X : B/A</div>
              <div>A/S : L/R</div>
              <div>Enter : Start</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .emulator-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .emulator-wrapper {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .emulator-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .emulator-screens {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: 2rem;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rom-upload-zone {
          text-align: center;
          padding: 3rem 2rem;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          color: white;
        }

        .rom-upload-zone:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.1);
        }

        .upload-button {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .ds-screens {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .screen-top,
        .screen-bottom {
          background: #000;
          border-radius: 0.5rem;
          padding: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .ds-canvas {
          width: 100%;
          height: auto;
          display: block;
          image-rendering: pixelated;
          background: #111;
        }

        .touchscreen {
          cursor: crosshair;
        }

        .emulator-controls {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .control-button {
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .control-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #334155;
        }

        .control-button.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .control-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .control-button.danger {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .control-button.danger:hover {
          background: #fee2e2;
        }

        .keyboard-info {
          padding: 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default EmulatorDS;
