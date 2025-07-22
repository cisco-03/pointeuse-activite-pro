import React, { useState } from 'react';
import { gsap } from 'gsap';

interface SlideFooterProps {
  // Pas de props pour le moment, tout est en dur
}

const SlideFooter: React.FC<SlideFooterProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour basculer l'état du footer
  const toggleFooter = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Animation GSAP pour le slide
    const footerContent = document.querySelector('.footer-content');

    if (footerContent) {
      if (newState) {
        // Ouvrir le footer
        gsap.to(footerContent, {
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      } else {
        // Fermer le footer
        gsap.to(footerContent, {
          y: '100%',
          duration: 0.4,
          ease: "power2.in"
        });
      }
    }
  };

  // Année actuelle pour le copyright
  const currentYear = new Date().getFullYear();

  // Fonction pour gérer les erreurs de chargement d'images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`🖼️ Erreur de chargement de l'image: ${e.currentTarget.src}`);
    // Optionnel: remplacer par une image par défaut
    // e.currentTarget.src = '/default-icon.png';
  };

  return (
    <>
      {/* Contenu du footer slide avec languette intégrée */}
      <div
        className="footer-content fixed bottom-0 left-0 right-0 z-40 transform translate-y-full"
        style={{ willChange: 'transform' }}
      >
        {/* Languette pour ouvrir/fermer - Maintenant à l'intérieur du footer */}
        <div
          className="footer-tab absolute left-1/2 transform -translate-x-1/2 -top-[40px] z-10 cursor-pointer"
          onClick={toggleFooter}
        >
          <div className="bg-gray-800/95 backdrop-blur-md border-l border-r border-t border-gray-600 rounded-t-lg px-4 py-2 shadow-lg hover:bg-gray-700/95 transition-colors duration-300">
            <div className="flex items-center space-x-2">
              {/* Icône de flèche qui tourne selon l'état */}
              <svg
                className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm text-gray-300 font-medium">
                {isOpen ? 'Fermer' : 'Liens'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/95 backdrop-blur-md border-t border-gray-600 shadow-2xl">
          {/* Section des icônes sociales */}
          <div className="p-6">
            <div className="flex justify-center items-center space-x-8">
              
              {/* Lien Portfolio FlexoDiv */}
              <a 
                href="https://flexodiv.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-transform duration-300 hover:scale-110 group"
                aria-label="Portfolio de FlexoDiv"
              >
                <div className="relative">
                  <img
                    src="/02-Logo-FlexoDiv.png"
                    alt="Logo FlexoDiv"
                    className="h-12 w-12 rounded-full object-cover shadow-lg"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-300 group-hover:text-purple-300 transition-colors duration-300">Portfolio</span>
                </div>
              </a>

              {/* Lien Gmail */}
              <a 
                href="mailto:flexodiv@gmail.com?subject=Prise%20de%20contact" 
                className="transition-transform duration-300 hover:scale-110 group"
                aria-label="Envoyer un email"
              >
                <div className="relative">
                  <img
                    src="/gmail.png"
                    alt="Logo Gmail"
                    className="h-12 w-12 shadow-lg rounded-lg"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-300 group-hover:text-red-300 transition-colors duration-300">Email</span>
                </div>
              </a>

              {/* Lien LinkedIn */}
              <a
                href="https://www.linkedin.com/in/flexodiv-engineering-prompting-982582203"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-110 group"
                aria-label="Voir le profil LinkedIn"
              >
                <div className="relative">
                  <img
                    src="/Linkedin.png"
                    alt="Logo LinkedIn"
                    className="h-12 w-12 shadow-lg rounded-lg"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-300 group-hover:text-blue-300 transition-colors duration-300">LinkedIn</span>
                </div>
              </a>

              {/* Lien YouTube */}
              <a
                href="https://www.youtube.com/@flexodiv"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-110 group"
                aria-label="Visiter la chaîne YouTube"
              >
                <div className="relative">
                  <img
                    src="/youtube.png"
                    alt="Logo YouTube"
                    className="h-12 w-12 object-contain shadow-lg rounded-lg"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-300 group-hover:text-red-300 transition-colors duration-300">YouTube</span>
                </div>
              </a>

            </div>
          </div>

          {/* Section copyright */}
          <div className="border-t border-gray-600 px-6 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                © {currentYear} FlexoDiv - Tous droits réservés
              </p>
              <p className="text-xs text-gray-500 mt-1">
                TimeTracker V4 - Application de suivi du temps professionnel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer en cliquant à côté (optionnel) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={toggleFooter}
        />
      )}
    </>
  );
};

export default SlideFooter;
