import React, { useState } from 'react';
import { Trophy, Flame, Star, Zap, Sparkles, Target, Award, Users, TrendingUp, Shield } from 'lucide-react';
import AuthPopup from '../components/AuthPopup';

const LandingPage = () => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const stats = [
    { number: '500+', label: 'Défis disponibles', icon: Target },
    { number: '100+', label: 'Jeux répertoriés', icon: Trophy },
    { number: '1000+', label: 'Joueurs actifs', icon: Users }
  ];

  const features = [
    {
      icon: Star,
      title: 'Système de Points',
      description: 'Gagnez des points et suivez votre progression en temps réel'
    },
    {
      icon: Zap,
      title: 'Suivi Automatique',
      description: 'Sauvegarde cloud instantanée de tous vos accomplissements'
    },
    {
      icon: Award,
      title: 'Badges & Récompenses',
      description: 'Débloquez des badges exclusifs en complétant vos objectifs'
    },
    {
      icon: TrendingUp,
      title: 'Classements',
      description: 'Comparez vos scores avec la communauté de joueurs'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-2xl font-black logo-text">
                POKÉQUEST
              </h1>
            </div>
            <button
              onClick={() => setShowAuthPopup(true)}
              className="btn-primary"
            >
              Commencer
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-16">
              {/* Left Content */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200
                              rounded-full text-amber-900 text-sm font-semibold mb-6 w-fit">
                  <Sparkles className="w-4 h-4" />
                  Nouveau système de points
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Obtenez 100% de satisfaction avec
                  <span className="block mt-2 gradient-title">
                    PokéQuest
                  </span>
                </h2>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Suivez votre progression, relevez des défis épiques et devenez un maître 
                  sur tous les ROM hacks et fan games Pokémon.
                </p>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Nuzlocke', 'Speedrun', 'Shiny Hunt', 'Complétion', 'Monotype'].map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 
                               hover:bg-slate-50 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAuthPopup(true)}
                  className="btn-cta group w-fit"
                >
                  commencer
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>

              {/* Right Image */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  {/* Main icon */}
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="glass-card rounded-full p-16 shadow-2xl">
                      <Trophy className="w-32 h-32 text-amber-500" />
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="floating-badge badge-1">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="floating-badge badge-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="floating-badge badge-3">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="glass-card rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                                bg-amber-50 border border-amber-200 mb-4">
                    <stat.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              Pourquoi choisir PokéQuest ?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une plateforme complète pour suivre et partager vos accomplissements Pokémon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-50 border border-amber-200
                                flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      
        {/* CTA Section */}
        {/*
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="glass-card rounded-3xl p-8 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200
                            rounded-full text-emerald-900 text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                100% Gratuit, sans engagement
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6">
                Prêt à commencer votre aventure ?
              </h2>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Rejoignez des milliers de dresseurs qui suivent leur progression 
                et partagent leurs accomplissements chaque jour.
              </p>

              <button
                onClick={() => setShowAuthPopup(true)}
                className="btn-cta-large group"
              >
                commencer
                <Trophy className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>

              <p className="text-sm text-slate-500 mt-6">
                Aucune carte bancaire requise • Inscription en 30 secondes
              </p>
            </div>
          </div>
        </section>
        */}
      </div>
      

      {/* Auth Popup */}
      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
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
          position: relative;
        }
        
        .gradient-title {
          font-family: 'Rajdhani', sans-serif;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .glass-nav {
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
        
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
          white-space: nowrap;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-radius: 1rem;
          font-weight: 700;
          font-size: 1.125rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
          white-space: nowrap;
        }
        
        .btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5);
        }
        
        .btn-cta-large {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2.5rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          border-radius: 1.25rem;
          font-weight: 700;
          font-size: 1.25rem;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
          white-space: nowrap;
        }
        
        .btn-cta-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(245, 158, 11, 0.5);
        }
        
        .floating-badge {
          position: absolute;
          padding: 0.75rem;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
        
        .badge-1 {
          top: 10%;
          right: 10%;
        }
        
        .badge-2 {
          bottom: 20%;
          left: 5%;
        }
        
        .badge-3 {
          top: 50%;
          right: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
