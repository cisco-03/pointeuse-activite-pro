import React from 'react';

// Interface pour les props du composant
interface LoginBackgroundProps {
  children: React.ReactNode;
}

const LoginBackground: React.FC<LoginBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image de fond responsive avec optimisations */}
      <div
        className="login-bg-fixed fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/login-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed', // Effet parallax sur desktop
          willChange: 'transform', // Optimisation GPU
        }}
      />

      {/* Overlay dégradé pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60" />

      {/* Effet de vignette subtil */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Contenu de la page */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>

      {/* Styles pour optimisation mobile */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .login-bg-fixed {
              background-attachment: scroll !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default LoginBackground;
