📁 Fichiers TSX concernés par les problèmes d'éclairage et d'étoiles :
1.  DynamicBackground.tsx - Fichier principal
Responsabilité : Gestion du dégradé de ciel, luminosité du paysage, phases solaires
Problèmes identifiés :
❌ Ligne 470-474 : Application directe de la luminosité sans animation (contourne le système GSAP)
❌ Ligne 426 : Évitement des mises à jour si les couleurs n'ont pas changé (peut bloquer les transitions)
2.  AstronomicalLayer.tsx - Gestion des étoiles et de la lune
Responsabilité : Affichage progressif des étoiles, calcul de visibilité selon les phases solaires
Problèmes identifiés :
❌ Lignes 95-102 : Logique de crépuscule qui ne démarre qu'APRÈS le coucher de soleil
❌ Lignes 113-117 : Condition de nuit complète trop restrictive
❌ Lignes 330-340 : Masquage complet des étoiles (display: none) au lieu d'une transition douce
3.  TimeContext.tsx - Gestion du temps
Responsabilité : Fournir le temps actuel (réel ou simulé)
État : ✅ Fonctionne correctement
4.  TimeSimulator.tsx - Outil de test
Responsabilité : Simuler différentes heures pour tester les transitions
État : ✅ Fonctionne correctement