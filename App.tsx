import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as SunCalc from 'suncalc';
import DynamicBackground from './Components/Background/DynamicBackground';
import LoginBackground from './Components/Background/LoginBackground';
import BackgroundInfo from './Components/UI/BackgroundInfo';
import ControlButtonsWrapper from './Components/UI/ControlButtonsWrapper';
import SlideFooter from './Components/UI/SlideFooter';
import AmbientSoundManager from './Components/Audio/AmbientSoundManager';
import TimerSoundEffects from './Components/Audio/TimerSoundEffects';
import MultiTabManager from './Components/Utils/MultiTabManager';

import { TimeProvider, useTime } from './Components/Context/TimeContext';
import { LocationProvider, useLocation } from './Components/Context/LocationContext';
import { auth, db, googleProvider } from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';

// SVG Icons (as React Components)
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.082,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// Composant wrapper pour utiliser le hook useTime avec les contrôles
const ControlButtonsWrapperWithTime: React.FC<{
  audioEnabled: boolean;
  audioVolume: number;
  onToggleEnabled: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onSetMode: (mode: string) => void;
  onResetToAuto: () => void;
  lang: Lang;
}> = ({ audioEnabled, audioVolume, onToggleEnabled, onVolumeChange, onSetMode, onResetToAuto, lang }) => {
  const { getCurrentTime, setSimulatedTime } = useTime();

  return (
    <ControlButtonsWrapper
      currentSimulatedTime={getCurrentTime()}
      onTimeChange={setSimulatedTime}
      audioEnabled={audioEnabled}
      audioVolume={audioVolume}
      onToggleEnabled={onToggleEnabled}
      onVolumeChange={onVolumeChange}
      onSetMode={onSetMode}
      onResetToAuto={onResetToAuto}
      lang={lang}
    />
  );
};


// ========= TYPES =========
type Lang = 'fr' | 'en';
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
interface Agency {
  id: string;
  name: string;
}
interface LogEntry {
  timestamp: Timestamp;
  note: string;
}
interface Session {
  id?: string;
  userId: string;
  agencyId: string;
  agencyName: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  totalDurationSeconds: number;
  logs: LogEntry[];
}
interface Translations {
  [key: string]: string | { [key:string]: string };
}


// ========= CONSTANTS & TRANSLATIONS =========
const DEFAULT_AGENCIES: Omit<Agency, 'id'>[] = [
  { name: "Randstad Digital" },
  { name: "Modis (Groupe Adecco)" },
  { name: "Manpower IT" },
  { name: "Hays Technology" },
  { name: "Urban Linker" },
  { name: "Externatic" },
  { name: "Seyos" },
  { name: "GetPro.io" },
  { name: "Michael Page Technology" },
];

const translations: { [key in Lang]: Translations } = {
  fr: {
    loginTitle: "TimeTracker V4",
    loginButton: "Se connecter avec Google",
    logout: "Déconnexion",
    welcome: "Bienvenue",
    selectAgency: "Sélectionnez une activité",
    addAgency: "Ajouter une nouvelle activité",
    agencyName: "Nom de l'activité",
    add: "Ajouter",
    firstTaskPrompt: "Décrivez votre première tâche pour commencer...",
    start: "Démarrer",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
    cancel: "Annuler",
    addNote: "Ajouter une note...",
    activityLog: "Journal d'activité",
    sessionHistory: "Historique des sessions",
    exportTxt: "Exporter en .txt",
    sendEmail: "Envoyer par Email",
    print: "Imprimer",
    clearHistory: "Vider l'historique",
    showAgencySelector: "Activités",
    showHistory: "Historique",
    deleteAgency: "Supprimer l'activité",
    confirmDeleteAgency: "Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.",
    showArchives: "Archives",
    archivedSessions: "Sessions archivées",
    noArchives: "Aucune session archivée trouvée.",
    confirmClearHistory: "Êtes-vous sûr de vouloir supprimer tout l'historique ? Cette action est irréversible.",
    noHistory: "Aucun historique de session trouvé.",
    help: "Aide",
    welcomeTitle: "Bienvenue dans TimeTracker V4 !",
    welcomeMessage: "Cette application vous permet de suivre votre temps de travail par activité. Consultez l'aide pour plus d'informations.",
    helpTitle: "Guide d'utilisation",
    helpContent: `
GUIDE D'UTILISATION COMPLET

═══════════════════════════════════════════════════════════════

DÉMARRAGE RAPIDE

1. Sélectionnez une activité dans la liste déroulante
2. Ajoutez une nouvelle activité avec le bouton "+"
3. Décrivez votre première tâche dans le champ de texte
4. Cliquez sur "Démarrer" pour lancer le chronomètre
5. Ajoutez des notes pendant votre session de travail
6. Cliquez sur "Arrêter" pour terminer la session

═══════════════════════════════════════════════════════════════

MODES DE FONCTIONNEMENT

MODE NORMAL
- Sélection d'activité obligatoire
- Description de tâche obligatoire
- Suivi précis par activité

MODE LIBRE
- Activez le toggle "Mode libre"
- Aucune contrainte de sélection
- Démarrage immédiat possible
- Idéal pour les sessions spontanées

CHRONOMÈTRE vs COMPTE À REBOURS
- Chronomètre : mesure le temps écoulé
- Compte à rebours : définissez une durée cible
- Basculez entre les modes selon vos besoins

═══════════════════════════════════════════════════════════════

FONCTIONNALITÉS AVANCÉES

GESTION DES SESSIONS
- Pause/reprise à tout moment
- Ajout de notes en temps réel
- Vérifications d'activité automatiques
- Sauvegarde automatique en temps réel

HISTORIQUE ET ARCHIVES
- Consultation de toutes vos sessions
- Suppression individuelle possible
- Archivage automatique des sessions anciennes
- Recherche et filtrage par activité

EXPORT ET PARTAGE
- Export JSON pour analyse technique
- Export CSV pour tableurs (Excel, Calc)
- Export TXT pour lecture simple
- Export PDF pour impression
- Envoi direct par email
- Archivage sélectif des sessions

═══════════════════════════════════════════════════════════════

INTERFACE ET NAVIGATION

MENU PRINCIPAL (toujours visible)
- Activités : gestion de vos activités
- Historique : consultation des sessions
- Archives : sessions archivées
- Export : outils d'export et archivage
- Aide : ce guide d'utilisation

CONTRÔLES AUDIO ET VISUELS
- Ambiances sonores adaptées à l'heure
- Contrôle du volume et activation/désactivation
- Arrière-plans dynamiques selon l'heure
- Mode manuel ou automatique

═══════════════════════════════════════════════════════════════

CONSEILS D'UTILISATION

PRODUCTIVITÉ
- Décrivez précisément vos tâches pour un suivi optimal
- Utilisez les notes pour documenter votre progression
- Profitez du mode libre pour les sessions courtes
- Archivez régulièrement vos anciennes sessions

ORGANISATION
- Créez des activités spécifiques à vos projets
- Utilisez des noms d'activités clairs et cohérents
- Exportez vos données régulièrement
- Consultez l'historique pour analyser votre temps

SÉCURITÉ
- Vos données sont sauvegardées automatiquement
- Connexion sécurisée via Google
- Données privées et chiffrées
- Aucune perte de données en cas de fermeture

═══════════════════════════════════════════════════════════════

SUPPORT ET LANGUES

L'application est disponible en français et anglais.
Basculez entre les langues via le sélecteur en haut à droite.
Toutes vos données sont préservées lors du changement de langue.
    `,
    closeHelp: "Fermer",
    gotIt: "J'ai compris",
    duration: "Durée",
    date: "Date",
    inactivityTitle: "Êtes-vous toujours là ?",
    inactivityText: "Le minuteur a été mis en pause pour inactivité.",
    randomCheckTitle: "Vérification d'activité",
    randomCheckText: "Veuillez décrire brièvement sur quoi vous travaillez actuellement. Le minuteur se mettra en pause dans 60 secondes si aucune réponse n'est donnée.",
    submit: "Soumettre",
    taskDescription: "Description de la tâche...",
    sessionPaused: "Session en pause",
    loading: "Chargement...",
    // Traductions pour les intermédiaires
    pauseReason: "Pourquoi vous arrêtez-vous ?",
    pauseReasonPlaceholder: "Décrivez la raison de cette pause...",
    addIntermediate: "Ajouter un intermédiaire",
    endSession: "Terminer la session",
    intermediate: "Intermédiaire",
    // Traductions pour le mode timer
    switchToCountdown: "Passer au compte à rebours",
    switchToStopwatch: "Passer au chronomètre",
    setDuration: "Définir la durée",
    minutes: "Minutes",
    // Traductions pour les notifications de fin de compte à rebours
    timeUp: "TEMPS ÉCOULÉ !",
    countdownFinished: "Votre compte à rebours est terminé.",
    sessionAutoSaved: "Session automatiquement sauvegardée",
    understood: "COMPRIS !",
    // Traductions pour les contrôles d'arrière-plan
    backgroundControl: "Contrôle Arrière-plan",
    simulatedTime: "Temps simulé:",
    backgroundModes: "Modes Arrière-plan:",
    hideControls: "Masquer contrôles",
    advancedControls: "Contrôles avancés",
    manualTime: "Heure manuelle:",
    refresh: "Actualiser",
    refreshTooltip: "Actualiser - Retour au temps réel et synchronisation de l'arrière-plan",
    backgroundControlTooltip: "Panneau de Contrôle Arrière-plan",
    ambientControls: "Contrôles d'Ambiance",
    changeTimeAtmosphere: "Changez l'heure et l'atmosphère",
    // Phases de transition
    deepNight: "Nuit profonde",
    dawn: "Aube",
    sunrise: "Lever du soleil",
    morning: "Matin",
    middayZenith: "Midi (zénith)",
    afternoon: "Après-midi",
    sunset: "Coucher du soleil",
    dusk: "Crépuscule",
    // Contrôles audio
    ambientAudio: "Ambiance Audio",
    ambientSounds: "Sons d'ambiance :",
    enabled: "Activé",
    enable: "Activer",
    volume: "Volume :",
    audioControlsTooltip: "Contrôles audio d'ambiance",
    audioEnabledTooltip: "Contrôles audio d'ambiance (Activé)",
    audioDisabledTooltip: "Contrôles audio d'ambiance (Désactivé - Cliquez pour activer)",
    ambientSoundsAvailable: "Sons d'ambiance disponibles",
    whyNotAutomatic: "Pourquoi l'audio n'est pas automatique ?",
    browserProtection: "Les navigateurs modernes bloquent la lecture automatique de sons pour protéger votre expérience de navigation.",
    howToActivate: "Comment activer :",
    activateInstructions: "Cliquez simplement sur \"Activer\" ci-dessous pour profiter des sons d'ambiance qui s'adaptent automatiquement au cycle jour/nuit de votre arrière-plan.",
  },
  en: {
    loginTitle: "Pro Activity Tracker",
    loginButton: "Sign in with Google",
    logout: "Logout",
    welcome: "Welcome",
    selectAgency: "Select an activity",
    addAgency: "Add new activity",
    agencyName: "Activity name",
    add: "Add",
    firstTaskPrompt: "Describe your first task to begin...",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    cancel: "Cancel",
    addNote: "Add a note...",
    activityLog: "Activity Log",
    sessionHistory: "Session History",
    exportTxt: "Export as .txt",
    sendEmail: "Send via Email",
    print: "Print",
    clearHistory: "Clear History",
    showAgencySelector: "Activities",
    showHistory: "History",
    deleteAgency: "Delete Activity",
    confirmDeleteAgency: "Are you sure you want to delete this activity? This action cannot be undone.",
    showArchives: "Archives",
    archivedSessions: "Archived Sessions (90+ days)",
    noArchives: "No archived sessions found.",
    confirmClearHistory: "Are you sure you want to delete all history? This action cannot be undone.",
    noHistory: "No session history found.",
    help: "Help",
    welcomeTitle: "Welcome to Activity Time Tracker Pro!",
    welcomeMessage: "This application helps you track your work time by activity. Check the help section for more information.",
    helpTitle: "User Guide",
    helpContent: `
COMPLETE USER GUIDE

═══════════════════════════════════════════════════════════════

QUICK START

1. Select an activity from the dropdown list
2. Add a new activity with the "+" button
3. Describe your first task in the text field
4. Click "Start" to begin the timer
5. Add notes during your work session
6. Click "Stop" to end the session

═══════════════════════════════════════════════════════════════

OPERATING MODES

NORMAL MODE
- Activity selection required
- Task description required
- Precise tracking by activity

FREE MODE
- Enable the "Free mode" toggle
- No selection constraints
- Immediate start possible
- Ideal for spontaneous sessions

STOPWATCH vs COUNTDOWN
- Stopwatch: measures elapsed time
- Countdown: set a target duration
- Switch between modes as needed

═══════════════════════════════════════════════════════════════

ADVANCED FEATURES

SESSION MANAGEMENT
- Pause/resume at any time
- Add notes in real time
- Automatic activity checks
- Real-time automatic saving

HISTORY AND ARCHIVES
- View all your sessions
- Individual deletion possible
- Automatic archiving of old sessions
- Search and filter by activity

EXPORT AND SHARING
- JSON export for technical analysis
- CSV export for spreadsheets (Excel, Calc)
- TXT export for simple reading
- PDF export for printing
- Direct email sending
- Selective session archiving

═══════════════════════════════════════════════════════════════

INTERFACE AND NAVIGATION

MAIN MENU (always visible)
- Activities: manage your activities
- History: view sessions
- Archives: archived sessions
- Export: export and archiving tools
- Help: this user guide

AUDIO AND VISUAL CONTROLS
- Ambient sounds adapted to time
- Volume control and enable/disable
- Dynamic backgrounds according to time
- Manual or automatic mode

═══════════════════════════════════════════════════════════════

USAGE TIPS

PRODUCTIVITY
- Describe your tasks precisely for optimal tracking
- Use notes to document your progress
- Take advantage of free mode for short sessions
- Archive your old sessions regularly

ORGANIZATION
- Create activities specific to your projects
- Use clear and consistent activity names
- Export your data regularly
- Check history to analyze your time

SECURITY
- Your data is automatically saved
- Secure connection via Google
- Private and encrypted data
- No data loss in case of closure

═══════════════════════════════════════════════════════════════

SUPPORT AND LANGUAGES

The application is available in French and English.
Switch between languages via the selector in the top right.
All your data is preserved when changing languages.
    `,
    closeHelp: "Close",
    gotIt: "Got it",
    duration: "Duration",
    date: "Date",
    inactivityTitle: "Are you still there?",
    inactivityText: "The timer has been paused due to inactivity.",
    randomCheckTitle: "Activity Check",
    randomCheckText: "Please briefly describe what you are currently working on. The timer will pause in 60 seconds if there is no response.",
    submit: "Submit",
    taskDescription: "Task description...",
    sessionPaused: "Session paused",
    loading: "Loading...",
    // Traductions pour les intermédiaires
    pauseReason: "Why are you stopping?",
    pauseReasonPlaceholder: "Describe the reason for this pause...",
    addIntermediate: "Add intermediate",
    endSession: "End session",
    intermediate: "Intermediate",
    // Traductions pour le mode timer
    switchToCountdown: "Switch to countdown",
    switchToStopwatch: "Switch to stopwatch",
    setDuration: "Set duration",
    minutes: "Minutes",
    // Traductions pour les notifications de fin de compte à rebours
    timeUp: "TIME'S UP!",
    countdownFinished: "Your countdown is finished.",
    sessionAutoSaved: "Session automatically saved",
    understood: "GOT IT!",
    // Traductions pour les contrôles d'arrière-plan
    backgroundControl: "Background Control",
    simulatedTime: "Simulated time:",
    backgroundModes: "Background Modes:",
    hideControls: "Hide controls",
    advancedControls: "Advanced controls",
    manualTime: "Manual time:",
    refresh: "Refresh",
    refreshTooltip: "Refresh - Return to real time and background synchronization",
    backgroundControlTooltip: "Background Control Panel",
    ambientControls: "Ambient Controls",
    changeTimeAtmosphere: "Change time and atmosphere",
    // Phases de transition
    deepNight: "Deep night",
    dawn: "Dawn",
    sunrise: "Sunrise",
    morning: "Morning",
    middayZenith: "Midday (zenith)",
    afternoon: "Afternoon",
    sunset: "Sunset",
    dusk: "Dusk",
    // Contrôles audio
    ambientAudio: "Ambient Audio",
    ambientSounds: "Ambient sounds:",
    enabled: "Enabled",
    enable: "Enable",
    volume: "Volume:",
    audioControlsTooltip: "Ambient audio controls",
    audioEnabledTooltip: "Ambient audio controls (Enabled)",
    audioDisabledTooltip: "Ambient audio controls (Disabled - Click to enable)",
    ambientSoundsAvailable: "Ambient sounds available",
    whyNotAutomatic: "Why isn't audio automatic?",
    browserProtection: "Modern browsers block automatic sound playback to protect your browsing experience.",
    howToActivate: "How to activate:",
    activateInstructions: "Simply click \"Enable\" below to enjoy ambient sounds that automatically adapt to your background's day/night cycle.",
  },
};


// ========= HELPER FUNCTIONS =========
export const formatTime = (totalMilliseconds: number): string => {
  // Formate une durée en HH:MM:SS (sans millisecondes pour l'affichage utilisateur)
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// 🔧 CISCO: Nouvelle fonction pour formater depuis des secondes (pour les sessions sauvegardées)
export const formatTimeFromSeconds = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

// Fonction pour l'affichage avec millisecondes (pour debug/export si nécessaire)
export const formatTimeWithMs = (totalMilliseconds: number): string => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor(totalMilliseconds % 1000).toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const formatTimestamp = (ts: Timestamp | Date, lang: Lang): string => {
  const date = ts instanceof Timestamp ? ts.toDate() : ts;
  return date.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDate = (ts: Timestamp | Date, lang: Lang): string => {
  const date = ts instanceof Timestamp ? ts.toDate() : ts;
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};


// ========= CUSTOM HOOKS =========

// --- useAuth Hook ---
const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔄 État d\'authentification changé:', firebaseUser ? firebaseUser.email : 'Déconnecté');

      if (firebaseUser && mounted) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        await checkAndCreateUserProfile(appUser);
        setUser(appUser);
      } else if (mounted) {
        setUser(null);
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      console.log('🔐 Tentative de connexion Google avec POPUP...');
      setIsLoading(true);

      // Configurer le provider pour forcer le popup
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🪟 Ouverture du popup d\'authentification...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Connexion réussie:', result.user.email);
      setIsLoading(false);

    } catch (error: any) {
      console.error("❌ Erreur lors de la connexion:", error);
      console.error("Code d'erreur:", error.code);
      console.error("Message:", error.message);
      console.error("Détails complets:", JSON.stringify(error, null, 2));
      setIsLoading(false);

      // Gestion spécifique des erreurs
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ Popup fermée par l\'utilisateur');
        // Ne pas afficher d'erreur, c'est normal
      } else if (error.code === 'auth/popup-blocked') {
        alert('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site et réessayer.');
      } else if (error.code === 'auth/invalid-api-key') {
        alert('Clé API invalide. Vérifiez la configuration Firebase.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(`Domaine non autorisé: ${window.location.hostname}. Ajoutez ce domaine dans Firebase Console → Authentication → Settings → Authorized domains`);
      } else {
        alert(`Erreur de connexion: ${error.message}\nCode: ${error.code}\nDomaine actuel: ${window.location.hostname}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const checkAndCreateUserProfile = async (user: AppUser) => {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
          try {
              const initialAgencies = DEFAULT_AGENCIES.map(agency => ({
                  ...agency,
                  id: `default-${Date.now()}-${Math.random()}`
              }));
              await setDoc(userDocRef, {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  createdAt: Timestamp.now(),
                  agencies: initialAgencies
              });
          } catch (error) {
              console.error("Error creating user profile:", error);
          }
      }
  };

  return { user, isLoading, login, logout };
};

// --- useFirestore Hook ---
const useFirestore = (userId: string | undefined) => {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [history, setHistory] = useState<Session[]>([]);
    const [archives, setArchives] = useState<Session[]>([]);

    const fetchAgencies = useCallback(async () => {
        if (!userId) return;

        // 🔐 CISCO: Vérification de l'authentification Firebase avant la requête
        if (!auth.currentUser) {
            console.log('⏳ Utilisateur non encore authentifié pour les agences, attente...');
            return;
        }

        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setAgencies(userDoc.data().agencies || []);
            }
        } catch (error: any) {
            console.error("❌ Erreur lors du chargement des agences:", error);
            if (error.code === 'permission-denied') {
                console.log('🔒 Permissions insuffisantes pour les agences');
                console.log('🔍 État d\'authentification:', auth.currentUser ? 'Connecté' : 'Non connecté');
            }
        }
    }, [userId]);

    const addAgency = async (agencyName: string): Promise<Agency | null> => {
        if (!userId) return null;
        const newAgency: Agency = { id: `custom-${Date.now()}`, name: agencyName };
        const userDocRef = doc(db, "users", userId);
        try {
            await updateDoc(userDocRef, {
                agencies: arrayUnion(newAgency)
            });
            setAgencies(prev => [...prev, newAgency]);
            return newAgency;
        } catch (error) {
            console.error("Error adding agency:", error);
            return null;
        }
    };

    const deleteAgency = async (agencyToDelete: Agency): Promise<boolean> => {
        if (!userId) return false;
        const userDocRef = doc(db, "users", userId);
        try {
            await updateDoc(userDocRef, {
                agencies: arrayRemove(agencyToDelete)
            });
            setAgencies(prev => prev.filter(agency => agency.id !== agencyToDelete.id));
            return true;
        } catch (error) {
            console.error("Error deleting agency:", error);
            return false;
        }
    };

    const saveSession = async (session: Omit<Session, 'id'>) => {
        if (!userId) {
            console.error("❌ Impossible de sauvegarder - userId manquant");
            return;
        }

        console.log('💾 Tentative de sauvegarde session:', {
            userId: session.userId,
            agencyName: session.agencyName,
            duration: session.totalDurationSeconds,
            logsCount: session.logs.length
        });

        try {
            const sessionsColRef = collection(db, 'sessions');
            const docRef = await addDoc(sessionsColRef, session);
            console.log('✅ Session sauvegardée avec ID:', docRef.id);

            // 🔧 CISCO: Ajouter directement la session à l'état local au lieu de recharger tout l'historique
            const newSession: Session = { ...session, id: docRef.id };
            setHistory(prev => [newSession, ...prev]);

            console.log('💾 Session ajoutée à l\'historique local - Export disponible via les boutons');
        } catch (error) {
            console.error("❌ Erreur lors de la sauvegarde de la session:", error);
        }
    };

    const clearHistory = async () => {
        if (!userId) return;

        try {
            console.log('🗑️ Suppression de l\'historique...');

            // Récupérer toutes les sessions de l'utilisateur
            const sessionsColRef = collection(db, 'sessions');
            const q = query(sessionsColRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);

            // Supprimer chaque document
            const deletePromises = querySnapshot.docs.map(doc =>
                deleteDoc(doc.ref)
            );

            await Promise.all(deletePromises);

            // Mettre à jour l'état local
            setHistory([]);
            console.log(`✅ ${querySnapshot.docs.length} sessions supprimées`);

        } catch (error) {
            console.error("❌ Erreur lors de la suppression de l'historique:", error);
        }
    };

    // FONCTION D'ARCHIVAGE TEMPORAIREMENT SUPPRIMÉE
    // Nécessite un index Firebase composite pour userId + startTime
    // const autoArchiveOldSessions = async () => { ... }

    const fetchHistory = useCallback(async () => {
        if (!userId) return;

        // 🔐 CISCO: Vérification de l'authentification Firebase avant la requête
        if (!auth.currentUser) {
            console.log('⏳ Utilisateur non encore authentifié, attente...');
            return;
        }

        console.log('📚 Chargement de l\'historique...');

        const sessionsColRef = collection(db, 'sessions');
        const q = query(sessionsColRef, where("userId", "==", userId), orderBy("startTime", "desc"));

        // Retry avec backoff linéaire (3 tentatives)
        let lastError: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const querySnapshot = await getDocs(q);
                const sessions: Session[] = [];
                querySnapshot.forEach((doc) => {
                    sessions.push({ id: doc.id, ...doc.data() } as Session);
                });
                setHistory(sessions);
                console.log(`✅ ${sessions.length} sessions chargées dans l'historique`);
                lastError = null;
                break;
            } catch (error: any) {
                console.error(`❌ Error fetching history (tentative ${attempt}/3):`, error);
                lastError = error;
                // Erreur permissions: ne pas réessayer
                if (error.code === 'permission-denied') {
                    console.log('🔒 Permissions Firebase insuffisantes. Vérifiez les règles de sécurité.');
                    console.log('🔍 État d\'authentification:', auth.currentUser ? 'Connecté' : 'Non connecté');
                    console.log('🆔 User ID:', userId);
                    setHistory([]);
                    return;
                }
                // Info index manquant
                if (error.code === 'failed-precondition' && error.message.includes('index')) {
                    console.log('🔗 Lien pour créer l\'index automatiquement détecté dans l\'erreur');
                    console.log('📋 Suivez le lien dans l\'erreur pour créer l\'index Firestore');
                }
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, attempt * 500));
                }
            }
        }
        if (lastError) {
            setHistory([]);
        }

    }, [userId]);

    const fetchArchives = useCallback(async () => {
        if (!userId) return;

        console.log('📚 Chargement des archives...');

        try {
            const archivesColRef = collection(db, 'archives');
            const q = query(archivesColRef, where("userId", "==", userId), orderBy("startTime", "desc"));
            const querySnapshot = await getDocs(q);

            const archivesList: Session[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Session));

            setArchives(archivesList);
            console.log(`✅ ${archivesList.length} sessions archivées chargées`);

        } catch (error) {
            console.error("❌ Erreur lors du chargement des archives:", error);
            setArchives([]);
        }
    }, [userId]);

    // 🔧 CISCO: Fonction pour détecter les sessions anciennes à archiver
    const getOldSessions = useCallback(() => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        return history.filter(session => {
            const sessionDate = session.startTime.toDate();
            return sessionDate < ninetyDaysAgo;
        });
    }, [history]);

    // Fonctions d'export multi-format
    const exportToJSON = (sessions: Session[], filename: string) => {
        const dataToExport = sessions.map(session => ({
            id: session.id,
            userId: session.userId,
            agencyId: session.agencyId,
            agencyName: session.agencyName,
            startTime: session.startTime.toDate().toISOString(),
            endTime: session.endTime?.toDate().toISOString() || null,
            totalDurationSeconds: session.totalDurationSeconds,
            logs: session.logs.map(log => ({
                timestamp: log.timestamp.toDate().toISOString(),
                note: log.note
            }))
        }));

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToCSV = (sessions: Session[], filename: string) => {
        const headers = ['Date', 'Agence', 'Durée (secondes)', 'Durée (formatée)', 'Nombre de logs', 'Premier log', 'Dernier log'];
        const csvContent = [
            headers.join(','),
            ...sessions.map(session => [
                `"${formatDate(session.startTime, 'fr')}"`,
                `"${session.agencyName}"`,
                session.totalDurationSeconds,
                `"${formatTimeFromSeconds(session.totalDurationSeconds)}"`,
                session.logs.length,
                `"${session.logs[0]?.note || ''}"`,
                `"${session.logs[session.logs.length - 1]?.note || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToTXT = (sessions: Session[], filename: string) => {
        let content = `Sessions archivées - Export du ${new Date().toLocaleDateString('fr-FR')}\n`;
        content += `==========================================\n\n`;

        sessions.forEach((session, index) => {
            content += `Session ${index + 1}\n`;
            content += `Date: ${formatDate(session.startTime, 'fr')}\n`;
            content += `Agence: ${session.agencyName}\n`;
            content += `Durée: ${formatTimeFromSeconds(session.totalDurationSeconds)}\n`;
            content += `Logs (${session.logs.length}):\n`;
            session.logs.forEach(log => {
                content += `  - [${formatTimestamp(log.timestamp, 'fr')}] ${log.note}\n`;
            });
            content += `\n------------------\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToPDF = (sessions: Session[], filename: string) => {
        // Pour le PDF, on va créer un contenu HTML et utiliser window.print()
        const printContent = `
            <html>
            <head>
                <title>Sessions archivées</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #0D9488; border-bottom: 2px solid #0D9488; }
                    .session { margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
                    .session-header { font-weight: bold; background: #f5f5f5; padding: 10px; margin: -15px -15px 10px -15px; }
                    .log { margin-left: 20px; margin-bottom: 5px; }
                    .timestamp { color: #666; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <h1>Sessions archivées - Export du ${new Date().toLocaleDateString('fr-FR')}</h1>
                ${sessions.map((session, index) => `
                    <div class="session">
                        <div class="session-header">
                            Session ${index + 1} - ${formatDate(session.startTime, 'fr')}
                        </div>
                        <p><strong>Agence:</strong> ${session.agencyName}</p>
                        <p><strong>Durée:</strong> ${formatTimeFromSeconds(session.totalDurationSeconds)}</p>
                        <p><strong>Logs (${session.logs.length}):</strong></p>
                        ${session.logs.map(log => `
                            <div class="log">
                                <span class="timestamp">[${formatTimestamp(log.timestamp, 'fr')}]</span> ${log.note}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    // 🔧 CISCO: Fonction pour archiver les sessions (déplacer de 'sessions' vers 'archives')
    const archiveSessions = async (sessionsToArchive: Session[]) => {
        if (!userId) return false;

        try {
            console.log(`📦 Archivage de ${sessionsToArchive.length} sessions...`);

            // 1. Ajouter les sessions à la collection 'archives'
            const archivesColRef = collection(db, 'archives');
            const archivePromises = sessionsToArchive.map(session => {
                const { id, ...sessionData } = session; // Retirer l'ID pour créer un nouveau document
                return addDoc(archivesColRef, sessionData);
            });

            await Promise.all(archivePromises);

            // 2. Supprimer les sessions de la collection 'sessions'
            const deletePromises: Promise<any>[] = [];
            for (const session of sessionsToArchive) {
                const sessionsColRef = collection(db, 'sessions');
                const q = query(sessionsColRef,
                    where('userId', '==', userId),
                    where('startTime', '==', session.startTime)
                );
                const snap = await getDocs(q);
                snap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
            }

            await Promise.all(deletePromises);

            // 3. Mettre à jour les états locaux
            const archivedIds = sessionsToArchive.map(s => s.id);
            setHistory(prev => prev.filter(s => !archivedIds.includes(s.id)));
            setArchives(prev => [...prev, ...sessionsToArchive]);

            console.log(`✅ ${sessionsToArchive.length} sessions archivées avec succès`);
            return true;

        } catch (error) {
            console.error("❌ Erreur lors de l'archivage:", error);
            return false;
        }
    };

    // 🔧 CISCO: Fonction pour supprimer une session individuelle de l'historique
    const deleteHistorySession = async (sessionToDelete: Session) => {
        if (!userId) return false;

        try {
            console.log(`🗑️ Suppression de la session: ${sessionToDelete.agencyName} - ${formatDate(sessionToDelete.startTime, 'fr')}`);

            // Supprimer de Firebase
            const sessionsColRef = collection(db, 'sessions');
            const q = query(sessionsColRef,
                where('userId', '==', userId),
                where('startTime', '==', sessionToDelete.startTime)
            );
            const snap = await getDocs(q);
            const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);

            // Mettre à jour l'état local
            setHistory(prev => prev.filter(s => s.id !== sessionToDelete.id));

            console.log(`✅ Session supprimée avec succès`);
            return true;

        } catch (error) {
            console.error("❌ Erreur lors de la suppression de la session:", error);
            return false;
        }
    };

    // Fonction pour supprimer les sessions ARCHIVÉES (collection 'archives') de Firebase
    // Conformément à la politique: l'historique ('sessions') est conservé ; on retire l'archive uniquement
    const deleteArchivedSessions = async (sessionsToDelete: Session[]) => {
        if (!userId) return false;

        try {
            console.log(`🗑️ Suppression de ${sessionsToDelete.length} enregistrements dans 'archives'...`);

            // Pour chaque session, trouver l'archive correspondante par userId + startTime
            const deletePromises: Promise<any>[] = [];
            for (const s of sessionsToDelete) {
                const archivesColRef = collection(db, 'archives');
                const q = query(archivesColRef,
                    where('userId', '==', userId),
                    where('startTime', '==', s.startTime)
                );
                const snap = await getDocs(q);
                snap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
            }

            await Promise.all(deletePromises);

            // Mettre à jour l'état local des archives
            const deletedIds = sessionsToDelete.map(s => s.id);
            setArchives(prev => prev.filter(s => !deletedIds.includes(s.id)));

            console.log(`✅ ${sessionsToDelete.length} archives supprimées avec succès`);
            return true;

        } catch (error) {
            console.error("❌ Erreur lors de la suppression des archives:", error);
            return false;
        }
    };

    // 🔧 CISCO: Fonction pour supprimer une session archivée individuelle
    const deleteArchivedSession = async (sessionToDelete: Session) => {
        if (!userId) return false;

        try {
            console.log(`🗑️ Suppression de l'archive: ${sessionToDelete.agencyName} - ${formatDate(sessionToDelete.startTime, 'fr')}`);

            // Supprimer de Firebase
            const archivesColRef = collection(db, 'archives');
            const q = query(archivesColRef,
                where('userId', '==', userId),
                where('startTime', '==', sessionToDelete.startTime)
            );
            const snap = await getDocs(q);
            const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);

            // Mettre à jour l'état local
            setArchives(prev => prev.filter(s => s.id !== sessionToDelete.id));

            console.log(`✅ Archive supprimée avec succès`);
            return true;

        } catch (error) {
            console.error("❌ Erreur lors de la suppression de l'archive:", error);
            return false;
        }
    };

    useEffect(() => {
        if(userId) {
            // 🔐 CISCO: Délai pour s'assurer que l'authentification Firebase est complète
            const timer = setTimeout(() => {
                fetchAgencies();
                fetchHistory();
            }, 1000); // 1000ms de délai pour laisser l'authentification se stabiliser

            return () => clearTimeout(timer);
        } else {
            setAgencies([]);
            setHistory([]);
            setArchives([]);
        }
    }, [userId, fetchAgencies, fetchHistory]);

    return {
        agencies,
        addAgency,
        deleteAgency,
        history,
        archives,
        saveSession,
        fetchHistory,
        clearHistory,
        fetchArchives,
        getOldSessions,
        exportToJSON,
        exportToCSV,
        exportToTXT,
        exportToPDF,
        archiveSessions,
        deleteHistorySession,
        deleteArchivedSessions,
        deleteArchivedSession
    };
};


// --- useTimer Hook ---
const useTimer = (onStop: (elapsedMilliseconds: number) => void) => {
    const [elapsedTime, setElapsedTime] = useState(0); // en millisecondes maintenant
    const [status, setStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);

    const start = () => {
        startTimeRef.current = Date.now() - elapsedTime;
        setStatus('running');
        intervalRef.current = window.setInterval(() => {
            setElapsedTime(Date.now() - startTimeRef.current);
        }, 10); // Mise à jour toutes les 10ms pour les millisecondes

        // 🔊 CISCO: Son de démarrage du chronomètre
        if (typeof (window as any).playTimerSound === 'function') {
            (window as any).playTimerSound('start');
        }
    };

    const pause = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            pauseTimeRef.current = Date.now();
            setStatus('paused');

            // 🔊 CISCO: Son de pause du chronomètre
            if (typeof (window as any).playTimerSound === 'function') {
                (window as any).playTimerSound('pause');
            }
        }
    };

    const resume = () => {
        if (status === 'paused') {
            const pausedDuration = Date.now() - pauseTimeRef.current;
            startTimeRef.current += pausedDuration;

            // 🔊 CISCO: Son de reprise du chronomètre (avant start() pour éviter double son)
            if (typeof (window as any).playTimerSound === 'function') {
                (window as any).playTimerSound('resume');
            }

            // Note: On n'appelle pas start() pour éviter le double son, on refait la logique
            setStatus('running');
            intervalRef.current = window.setInterval(() => {
                setElapsedTime(Date.now() - startTimeRef.current);
            }, 10);
        }
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // 🔊 CISCO: Son d'arrêt du chronomètre
        if (typeof (window as any).playTimerSound === 'function') {
            (window as any).playTimerSound('stop');
        }

        onStop(elapsedTime);
        setElapsedTime(0);
        setStatus('stopped');
    };

    const forcePause = useCallback(() => {
       if (status === 'running') {
           pause();
       }
    }, [status]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return { elapsedTime, status, start, pause, resume, stop, forcePause };
};

// --- useCountdown Hook simple ---
const useCountdown = (onFinish: () => void) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [status, setStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
    const [initialTime, setInitialTime] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);

    const start = (durationMs: number) => {
        setInitialTime(durationMs);
        setRemainingTime(durationMs);
        startTimeRef.current = Date.now();
        setStatus('running');
        intervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, durationMs - elapsed);
            setRemainingTime(remaining);

            if (remaining <= 0) {
                setStatus('stopped');
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                onFinish();
            }
        }, 10);
    };

    const pause = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            pauseTimeRef.current = Date.now();
            setStatus('paused');
        }
    };

    const resume = () => {
        if (status === 'paused' && remainingTime > 0) {
            const pausedDuration = Date.now() - pauseTimeRef.current;
            startTimeRef.current += pausedDuration;
            setStatus('running');
            intervalRef.current = window.setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, initialTime - elapsed);
                setRemainingTime(remaining);

                if (remaining <= 0) {
                    setStatus('stopped');
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    onFinish();
                }
            }, 10);
        }
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setRemainingTime(0);
        setStatus('stopped');
    };

    const forcePause = useCallback(() => {
        if (status === 'running') {
            pause();
        }
    }, [status]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return { remainingTime, status, start, pause, resume, stop, forcePause };
};



// --- Modal pour les intermédiaires ---
const IntermediateModal: React.FC<{
    t: Translations;
    onConfirm: (note: string) => void;
    onEndSession: (note: string) => void;
    onCancel: () => void;
}> = ({ t, onConfirm, onEndSession, onCancel }) => {
    const [note, setNote] = useState('');

    const handleAddIntermediate = () => {
        onConfirm(note);
        setNote('');
    };

    const handleEndSession = () => {
        onEndSession(note);
        setNote('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-4">{t.pauseReason as string}</h3>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.pauseReasonPlaceholder as string}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    rows={3}
                    autoFocus
                />
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {t.cancel as string}
                    </button>
                    <button
                        onClick={handleAddIntermediate}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {t.addIntermediate as string}
                    </button>
                    <button
                        onClick={handleEndSession}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {t.endSession as string}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- useInactivityDetector Hook - CISCO: Amélioré pour multi-onglets ---
const useInactivityDetector = (onInactive: () => void, timeout = 300000) => { // 5 minutes
    const timerRef = useRef<number | null>(null);
    const isTabVisibleRef = useRef(true);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 🔄 CISCO: Ne déclencher l'inactivité que si l'onglet est visible
        timerRef.current = window.setTimeout(() => {
            if (isTabVisibleRef.current) {
                onInactive();
            } else {
                console.log('🔄 Inactivité ignorée - onglet non visible');
                resetTimer(); // Relancer le timer si l'onglet n'est pas visible
            }
        }, timeout);
    }, [onInactive, timeout]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

        const handleActivity = () => {
            // 👁️ CISCO: Activité détectée seulement si onglet visible
            if (isTabVisibleRef.current) {
                resetTimer();
            }
        };

        // 👁️ CISCO: Gestion de la visibilité de l'onglet
        const handleVisibilityChange = () => {
            isTabVisibleRef.current = !document.hidden;
            console.log(`👁️ Onglet ${isTabVisibleRef.current ? 'visible' : 'masqué'} - Inactivité ${isTabVisibleRef.current ? 'active' : 'suspendue'}`);

            if (isTabVisibleRef.current) {
                resetTimer(); // Relancer le timer quand l'onglet redevient visible
            }
        };

        events.forEach(event => window.addEventListener(event, handleActivity));
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);
        window.addEventListener('blur', handleVisibilityChange);

        resetTimer();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
            window.removeEventListener('blur', handleVisibilityChange);
        };
    }, [resetTimer]);
};

// ========= UI COMPONENTS =========

const LoginScreen: React.FC<{ onLogin: () => void; lang: Lang }> = ({ onLogin, lang }) => {
    const t = translations[lang];
    return (
        <LoginBackground>
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8">
                {/* Conteneur principal avec fond semi-transparent */}
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 max-w-md w-full shadow-2xl border border-white/10">
                    {/* Logo/Titre */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            {t.loginTitle as string}
                        </h1>
                        <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed">
                            La solution moderne pour le suivi de temps des freelances et intérimaires.
                        </p>
                    </div>

                    {/* Bouton de connexion */}
                    <button
                        onClick={onLogin}
                        className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                        <GoogleIcon />
                        <span className="text-sm sm:text-base">{t.loginButton as string}</span>
                    </button>

                    {/* Indicateur de fonctionnalités */}
                    <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm text-gray-300">
                            <div className="text-center">
                                <div className="text-lg mb-1">⏱️</div>
                                <div>Chronomètre</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg mb-1">📊</div>
                                <div>Historique</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg mb-1">📤</div>
                                <div>Export</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg mb-1">🌐</div>
                                <div>Multi-langue</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer discret */}
                <div className="mt-8 text-center">
                    <p className="text-white/60 text-xs sm:text-sm">
                        Développé avec ❤️ pour les professionnels
                    </p>
                </div>
            </div>
        </LoginBackground>
    );
};

const Header: React.FC<{
    user: AppUser;
    onLogout: () => void;
    lang: Lang;
    setLang: (l: Lang) => void;
    t: Translations;
    onShowHelp: () => void;
    onShowAgencySelector: () => void;
    onShowHistory: () => void;
    onShowArchives: () => void;
    showAgencySelector: boolean;
    showHistory: boolean;
    showArchives: boolean;
}> = ({ user, onLogout, lang, setLang, t, onShowHelp, onShowAgencySelector, onShowHistory, onShowArchives, showAgencySelector, showHistory, showArchives }) => {
    return (
        <header className="bg-gray-800 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 print:hidden fixed top-0 left-0 right-0" style={{ zIndex: 50 }}>
            <h1 className="text-lg sm:text-xl font-bold text-teal-500 text-center sm:text-left">{t.loginTitle as string}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <button
                    onClick={onShowAgencySelector}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        showAgencySelector
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={showAgencySelector ? `Fermer ${t.showAgencySelector as string}` : `Ouvrir ${t.showAgencySelector as string}`}
                >
                    <span className="hidden sm:inline">{showAgencySelector ? '🏢 ' : '🏢 '}</span>{t.showAgencySelector as string}
                </button>
                <button
                    onClick={onShowHistory}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        showHistory
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={showHistory ? `Fermer ${t.showHistory as string}` : `Ouvrir ${t.showHistory as string}`}
                >
                    <span className="hidden sm:inline">{showHistory ? '📊 ' : '📊 '}</span>{t.showHistory as string}
                </button>
                <button
                    onClick={onShowArchives}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        showArchives
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={showArchives ? `Fermer ${t.showArchives as string}` : `Ouvrir ${t.showArchives as string}`}
                >
                    <span className="hidden sm:inline">{showArchives ? '📦 ' : '📦 '}</span>{t.showArchives as string}
                </button>

                <button
                    onClick={onShowHelp}
                    className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                    title={t.help as string}
                >
                    <span className="hidden sm:inline">❓ </span>{t.help as string}
                </button>
                <span className="text-gray-400 hidden md:block text-sm">{t.welcome as string}, {user.displayName?.split(' ')[0]}</span>
                <div className="flex items-center">
                    <button onClick={() => setLang('fr')} className={`px-2 py-1 text-xs sm:text-sm rounded-l-md ${lang === 'fr' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>FR</button>
                    <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs sm:text-sm rounded-r-md ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>EN</button>
                </div>

                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors">{t.logout as string}</button>
            </div>
        </header>
    );
};

const HistoryPanel: React.FC<{
    history: Session[],
    lang: Lang,
    t: Translations,
    onClearHistory: () => void,
    onDeleteSession: (session: Session) => Promise<boolean>
}> = ({ history, lang, t, onClearHistory, onDeleteSession }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const generateTxtContent = () => {
        let content = `${t.sessionHistory}\n==================\n\n`;
        history.forEach(session => {
            content += `${t.date as string}: ${formatDate(session.startTime, lang)}\n`;
            content += `${t.agencyName as string}: ${session.agencyName}\n`;
            content += `${t.duration as string}: ${formatTimeFromSeconds(session.totalDurationSeconds)}\n`;
            content += `Logs:\n`;
            session.logs.forEach(log => {
                content += `  - [${formatTimestamp(log.timestamp, lang)}] ${log.note}\n`;
            });
            content += `\n------------------\n\n`;
        });
        return content;
    };









    const sendEmail = () => {
        const subject = encodeURIComponent(t.sessionHistory as string);
        const body = encodeURIComponent(generateTxtContent());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const printReport = () => {
        window.print();
    };

    const handleClearHistory = () => {
        if (window.confirm(t.confirmClearHistory as string)) {
            onClearHistory();
        }
    };

    if (history.length === 0) {
        return <div className="p-4 text-center text-gray-500">{t.noHistory as string}</div>
    }

    return (
        <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 mt-8 border border-gray-700" style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">{t.sessionHistory as string}</h2>
                <div className="flex flex-wrap gap-2 print:hidden">
                    {/* 🔧 CISCO: Boutons historique - seulement Email, Imprimer, Vider */}
                    <button onClick={sendEmail} className="bg-gray-700 hover:bg-gray-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">✉️ Email</button>
                    <button onClick={printReport} className="bg-gray-700 hover:bg-gray-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">🖨️ Imprimer</button>
                    <button onClick={handleClearHistory} className="bg-red-700 hover:bg-red-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">🗑️ Vider</button>
                </div>
            </div>
            <div className="space-y-2">
                {history.map(session => (
                    <div key={session.id} className="bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <button
                                className="flex-1 flex justify-between items-center p-4 text-left"
                                onClick={() => setExpandedId(expandedId === session.id ? null : session.id!)}
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">{session.agencyName}</p>
                                    <p className="text-sm text-gray-400">{formatDate(session.startTime, lang)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-lg">{formatTimeFromSeconds(session.totalDurationSeconds)}</p>
                                    <p className="text-sm text-gray-400">{t.duration as string}</p>
                                </div>
                                <ChevronDownIcon />
                            </button>
                            {/* 🔧 CISCO: Bouton suppression individuelle */}
                            <button
                                onClick={() => onDeleteSession(session)}
                                className="p-2 m-2 bg-red-600 hover:bg-red-700 rounded text-xs"
                                title="Supprimer cette session"
                            >
                                🗑️
                            </button>
                        </div>
                        {expandedId === session.id && (
                            <div className="p-4 border-t border-gray-600">
                                <h4 className="font-bold mb-2">{t.activityLog as string}</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    {session.logs.map((log, index) => (
                                        <li key={index}>
                                            <span className="font-mono text-sm mr-2">[{formatTimestamp(log.timestamp, lang)}]</span>
                                            {log.note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


const RandomCheckModal: React.FC<{ t: Translations, onConfirm: (note: string) => void, onDismiss: () => void }> = ({ t, onConfirm, onDismiss }) => {
    const [note, setNote] = useState('');
    const dismissTimerRef = useRef<number | null>(null);

    useEffect(() => {
        dismissTimerRef.current = window.setTimeout(() => {
            onDismiss();
        }, 60000);

        return () => {
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        };
    }, [onDismiss]);

    const handleSubmit = () => {
        if(note.trim()){
            onConfirm(note);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.randomCheckTitle as string}</h2>
                <p className="text-gray-300 mb-6">{t.randomCheckText as string}</p>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.taskDescription as string}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!note.trim()}
                    className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {t.submit as string}
                </button>
            </div>
        </div>
    );
};








const ArchivesPanel: React.FC<{
    archives: Session[],
    lang: Lang,
    t: Translations,
    onDeleteSession: (session: Session) => Promise<boolean>,
    onExportJSON: (sessions: Session[], filename: string) => void,
    onExportCSV: (sessions: Session[], filename: string) => void,
    onExportTXT: (sessions: Session[], filename: string) => void,
    onExportPDF: (sessions: Session[], filename: string) => void
}> = ({ archives, lang, t, onDeleteSession, onExportJSON, onExportCSV, onExportTXT, onExportPDF }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedArchives, setSelectedArchives] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    // 🔧 CISCO: Fonctions de gestion de sélection (comme dans ArchiveManagerPanel)
    const handleArchiveToggle = (archiveId: string) => {
        setSelectedArchives(prev =>
            prev.includes(archiveId)
                ? prev.filter(id => id !== archiveId)
                : [...prev, archiveId]
        );
    };

    const handleSelectAll = () => {
        if (selectedArchives.length === archives.length) {
            setSelectedArchives([]);
        } else {
            setSelectedArchives(archives.map(a => a.id!));
        }
    };

    const getSelectedArchivesData = () => {
        return archives.filter(archive => selectedArchives.includes(archive.id!));
    };

    // 🔧 CISCO: Fonctions d'export avec sélection multiple
    const handleExport = async (format: 'json' | 'csv' | 'txt' | 'pdf') => {
        const archivesToExport = selectedArchives.length > 0 ? getSelectedArchivesData() : archives;
        if (archivesToExport.length === 0) return;

        setIsExporting(true);
        const filename = `archives_${new Date().toISOString().split('T')[0]}`;

        try {
            switch (format) {
                case 'json':
                    onExportJSON(archivesToExport, filename);
                    break;
                case 'csv':
                    onExportCSV(archivesToExport, filename);
                    break;
                case 'txt':
                    onExportTXT(archivesToExport, filename);
                    break;
                case 'pdf':
                    onExportPDF(archivesToExport, filename);
                    break;
            }
        } finally {
            setIsExporting(false);
        }
    };

    const generateTxtContent = () => {
        let content = `${t.archivedSessions}\n==================\n\n`;
        archives.forEach(session => {
            content += `${t.date as string}: ${formatDate(session.startTime, lang)}\n`;
            content += `${t.agencyName as string}: ${session.agencyName}\n`;
            content += `${t.duration as string}: ${formatTimeFromSeconds(session.totalDurationSeconds)}\n`;
            content += `Logs:\n`;
            session.logs.forEach(log => {
                content += `  - [${formatTimestamp(log.timestamp, lang)}] ${log.note}\n`;
            });
            content += `\n------------------\n\n`;
        });
        return content;
    };



    const sendEmail = () => {
        const subject = encodeURIComponent(t.archivedSessions as string);
        const body = encodeURIComponent(generateTxtContent());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const printReport = () => {
        window.print();
    };

    if (archives.length === 0) {
        return (
            <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 mt-8 border border-gray-700" style={{ position: 'relative', zIndex: 10 }}>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t.archivedSessions as string}</h2>
                <p className="text-gray-400 text-center py-8">{t.noArchives as string}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-6 mt-8 border border-gray-700" style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">{t.archivedSessions as string}</h2>

                {/* 🔧 CISCO: Nouvelle interface d'export avec sélection multiple */}
                <div className="flex flex-col gap-2 print:hidden">
                    {/* Contrôles de sélection */}
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={handleSelectAll}
                            className="bg-teal-600 hover:bg-teal-700 px-2 py-1 rounded text-xs"
                        >
                            {selectedArchives.length === archives.length ? '❌ Tout désélectionner' : '✅ Tout sélectionner'}
                        </button>
                        <span className="text-gray-400">
                            {selectedArchives.length > 0 ? `${selectedArchives.length} sélectionnée(s)` : 'Aucune sélection'}
                        </span>
                    </div>

                    {/* Boutons d'export */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleExport('json')}
                            disabled={isExporting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-1 px-2 rounded-lg text-xs"
                        >
                            📄 JSON
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 py-1 px-2 rounded-lg text-xs"
                        >
                            📊 CSV
                        </button>
                        <button
                            onClick={() => handleExport('txt')}
                            disabled={isExporting}
                            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 py-1 px-2 rounded-lg text-xs"
                        >
                            📝 TXT
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 py-1 px-2 rounded-lg text-xs"
                        >
                            📋 PDF
                        </button>
                        <button onClick={sendEmail} className="bg-purple-600 hover:bg-purple-700 py-1 px-2 rounded-lg text-xs">📧 Email</button>
                        <button onClick={printReport} className="bg-orange-600 hover:bg-orange-700 py-1 px-2 rounded-lg text-xs">🖨️ Print</button>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {archives.map(session => (
                    <div key={session.id} className="bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            {/* 🔧 CISCO: Checkbox de sélection */}
                            <input
                                type="checkbox"
                                checked={selectedArchives.includes(session.id!)}
                                onChange={() => handleArchiveToggle(session.id!)}
                                className="w-4 h-4 m-3 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                            />
                            <button
                                className="flex-1 flex justify-between items-center p-4 text-left"
                                onClick={() => setExpandedId(expandedId === session.id ? null : session.id!)}
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">{session.agencyName}</p>
                                    <p className="text-sm text-gray-400">{formatDate(session.startTime, lang)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-teal-400">{formatTimeFromSeconds(session.totalDurationSeconds)}</p>
                                    <p className="text-xs text-gray-500">📦 Archivé</p>
                                </div>
                            </button>
                            {/* 🔧 CISCO: Bouton suppression individuelle archive */}
                            <button
                                onClick={() => onDeleteSession(session)}
                                className="p-2 m-2 bg-red-600 hover:bg-red-700 rounded text-xs"
                                title="Supprimer cette archive"
                            >
                                🗑️
                            </button>
                        </div>
                        {expandedId === session.id && (
                            <div className="px-4 pb-4 border-t border-gray-600">
                                <h4 className="font-semibold mb-2 mt-3">{t.activityLog as string}:</h4>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {session.logs.map((log, index) => (
                                        <div key={index} className="text-sm bg-gray-800 p-2 rounded">
                                            <span className="font-mono text-gray-400 mr-2">[{formatTimestamp(log.timestamp, lang)}]</span>
                                            <span className="text-gray-300">{log.note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


// ========= INTERNAL APP COMPONENT WITH LOCATION CONTEXT =========
const AppWithLocation: React.FC<{
    user: AppUser;
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: any;
    agencies: Agency[];
    addAgency: (name: string) => Promise<Agency | null>;
    deleteAgency: (agency: Agency) => Promise<boolean>;
    history: Session[];
    archives: Session[];
    saveSession: (session: Session) => Promise<void>;
    clearHistory: () => Promise<void>;
    fetchArchives: () => Promise<void>;
    getOldSessions: () => Session[];
    exportToJSON: (sessions: Session[], filename: string) => void;
    exportToCSV: (sessions: Session[], filename: string) => void;
    exportToTXT: (sessions: Session[], filename: string) => void;
    exportToPDF: (sessions: Session[], filename: string) => void;
    archiveSessions: (sessions: Session[]) => Promise<boolean>;
    deleteHistorySession: (session: Session) => Promise<boolean>;
    deleteArchivedSessions: (sessions: Session[]) => Promise<boolean>;
    deleteArchivedSession: (session: Session) => Promise<boolean>;
    logout: () => Promise<void>;
}> = ({ user, lang, setLang, t, agencies, addAgency, deleteAgency, history, archives, saveSession, clearHistory, fetchArchives, getOldSessions, exportToJSON, exportToCSV, exportToTXT, exportToPDF, archiveSessions, deleteHistorySession, deleteArchivedSessions, deleteArchivedSession, logout }) => {
    const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
    const [newAgencyName, setNewAgencyName] = useState('');
    const [showAddAgency, setShowAddAgency] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAgencySelector, setShowAgencySelector] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [showArchives, setShowArchives] = useState(false);


    const [firstTask, setFirstTask] = useState('');
    const [currentNote, setCurrentNote] = useState('');
    const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([]);
    // Référence pour garantir la prise en compte immédiate des logs lors de la fin de session
    const currentLogsRef = useRef<LogEntry[]>([]);
    useEffect(() => { currentLogsRef.current = currentLogs; }, [currentLogs]);

    const [sessionStartTime, setSessionStartTime] = useState<Timestamp | null>(null);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [showRandomCheckModal, setShowRandomCheckModal] = useState(false);
    const randomCheckTimerRef = useRef<number | null>(null);

    // États pour le système d'intermédiaires
    const [showIntermediateModal, setShowIntermediateModal] = useState(false);

    // États pour le mode timer (chronomètre/compte à rebours)
    const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
    const [countdownDuration, setCountdownDuration] = useState(5 * 60 * 1000); // 5 minutes par défaut
    const [showCountdownFinished, setShowCountdownFinished] = useState(false);

    // État pour le mode libre (nouveau)
    const [freeMode, setFreeMode] = useState(false);

    // États pour le système audio d'ambiance
    const [audioEnabled, setAudioEnabled] = useState(false); // 🔧 CISCO: Audio désactivé par défaut - activation manuelle
    const [audioVolume, setAudioVolume] = useState(0.5);

    // 🔄 CISCO: États pour la gestion multi-onglets
    const [multiTabEnabled, setMultiTabEnabled] = useState(true);
    const [showMultiTabManager, setShowMultiTabManager] = useState(false);
    const [workingUrl, setWorkingUrl] = useState<string>('');

    const [currentBackgroundMode, setCurrentBackgroundMode] = useState('night');
    const [isManualMode, setIsManualMode] = useState(false);
    const { userLocation, locationReady } = useLocation(); // Get location from context

    // Centralized function to determine mode from time
    const getModeForTime = useCallback((date: Date) => {
        if (locationReady && userLocation) {
            const sunTimes = SunCalc.getTimes(date, userLocation.lat, userLocation.lon);
            const currentTime = date.getTime();
            if (currentTime < sunTimes.dawn.getTime()) return 'night';
            if (currentTime < sunTimes.sunrise.getTime()) return 'dawn';
            if (currentTime < sunTimes.sunrise.getTime() + (2 * 60 * 60 * 1000)) return 'sunrise';
            if (currentTime < sunTimes.solarNoon.getTime() - (1 * 60 * 60 * 1000)) return 'morning';
            if (currentTime < sunTimes.solarNoon.getTime() + (3 * 60 * 60 * 1000)) return 'midday';
            if (currentTime < sunTimes.sunset.getTime() - (1 * 60 * 60 * 1000)) return 'afternoon';
            if (currentTime < sunTimes.sunset.getTime()) return 'sunset';
            if (currentTime < sunTimes.dusk.getTime()) return 'dusk';
            return 'night';
        } else {
            const hour = date.getHours();
            if (hour >= 5 && hour < 6) return 'dawn';
            if (hour >= 6 && hour < 8) return 'sunrise';
            if (hour >= 8 && hour < 11) return 'morning';
            if (hour >= 11 && hour < 15) return 'midday';
            if (hour >= 15 && hour < 18) return 'afternoon';
            if (hour >= 18 && hour < 20) return 'sunset';
            if (hour >= 20 && hour < 22) return 'dusk';
            return 'night';
        }
    }, [locationReady, userLocation]);

    // Effect for automatic mode changes
    useEffect(() => {
        // Set initial mode
        setCurrentBackgroundMode(getModeForTime(new Date()));

        const interval = setInterval(() => {
            if (!isManualMode) {
                setCurrentBackgroundMode(prevMode => {
                    const newMode = getModeForTime(new Date());
                    return newMode !== prevMode ? newMode : prevMode;
                });
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isManualMode, getModeForTime]);


    // Manual mode change handler
    const handleSetMode = (mode: string) => {
        console.log(`🕹️ Manual mode override: ${mode}`);
        setIsManualMode(true);
        setCurrentBackgroundMode(mode);
    };

    // Reset to automatic mode
    const handleResetToAuto = () => {
        console.log('🔄 Resetting to automatic mode detection.');
        setIsManualMode(false);
        setCurrentBackgroundMode(getModeForTime(new Date()));
    };


    const handleStop = (elapsedMilliseconds: number) => {
        if (!user || !sessionStartTime) return;

        // En mode libre, si pas d'agence sélectionnée, utiliser l'agence "Libre"
        let agencyIdToUse = selectedAgencyId;
        let agencyNameToUse = 'Unknown';

        if (!selectedAgencyId && freeMode) {
            // Chercher l'agence "Libre" ou utiliser une valeur par défaut
            const freeAgency = agencies.find(a => a.name.toLowerCase() === 'libre');
            if (freeAgency) {
                agencyIdToUse = freeAgency.id;
                agencyNameToUse = freeAgency.name;
            } else {
                // Créer une session avec agence par défaut
                agencyIdToUse = 'libre-default';
                agencyNameToUse = 'Libre';
            }
        } else if (selectedAgencyId) {
            const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
            agencyNameToUse = selectedAgency?.name || 'Unknown';
        } else {
            // Mode normal sans agence sélectionnée - ne pas sauvegarder
            console.log('❌ Pas d\'agence sélectionnée en mode normal - session non sauvegardée');
            return;
        }

        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000); // Conversion pour la sauvegarde

        const sessionData: Omit<Session, 'id'> = {
            userId: user.uid,
            agencyId: agencyIdToUse,
            agencyName: agencyNameToUse,
            startTime: sessionStartTime,
            endTime: Timestamp.now(),
            totalDurationSeconds: elapsedSeconds,
            logs: currentLogsRef.current,
        };

        console.log('💾 Sauvegarde de la session:', sessionData);
        saveSession(sessionData);

        // Reset state
        setCurrentLogs([]);
        setSessionStartTime(null);
        setFirstTask('');
        setSelectedAgencyId('');
        if (randomCheckTimerRef.current) clearTimeout(randomCheckTimerRef.current);
    };

    // Nouvelle fonction pour gérer l'arrêt avec intermédiaire
    const handleStopWithIntermediate = () => {
        setShowIntermediateModal(true);
        if (timerMode === 'countdown') {
            countdown.pause();
        } else {
            pause();
        }
    };

    const handleIntermediateConfirm = (note: string) => {
        const intermediateLog: LogEntry = {
            timestamp: Timestamp.now(),
            note: `[${t.intermediate as string}] ${note || 'Pause sans description'}`
        };
        setCurrentLogs(prev => [...prev, intermediateLog]);
        setShowIntermediateModal(false);
        // Le timer reste en pause, l'utilisateur peut reprendre avec le bouton Resume
    };

    const handleIntermediateEndSession = (note: string) => {
        let finalLogs = currentLogsRef.current;
        if (note.trim()) {
            const finalLog: LogEntry = {
                timestamp: Timestamp.now(),
                note: `[${t.intermediate as string}] ${note}`
            };
            finalLogs = [...finalLogs, finalLog];
            setCurrentLogs(finalLogs);
            currentLogsRef.current = finalLogs;
        }
        setShowIntermediateModal(false);
        if (timerMode === 'countdown') {
            countdown.stop();
        } else {
            stop();
        }
    };

    const handleIntermediateCancel = () => {
        setShowIntermediateModal(false);
        if (timerMode === 'countdown') {
            countdown.resume();
        } else {
            resume();
        }
    };

    // Fonction pour demander la permission de notification
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    // Fonction pour jouer un son d'alerte
    const playAlertSound = () => {
        // Son d'alerte plus long et plus audible
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Créer une séquence de bips
        const playBeep = (frequency: number, duration: number, delay: number) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, delay);
        };

        // Séquence de 3 bips de plus en plus aigus
        playBeep(800, 0.2, 0);
        playBeep(1000, 0.2, 300);
        playBeep(1200, 0.3, 600);
    };

    // Gestion de la fin du compte à rebours avec notifications améliorées
    const handleCountdownFinish = () => {
        setShowCountdownFinished(true);

        // 🔊 CISCO: Son de fin de compte à rebours (priorité sur l'ancien système)
        if (typeof (window as any).playTimerSound === 'function') {
            (window as any).playTimerSound('countdown_finish');
        }

        // Notification navigateur améliorée
        if (Notification.permission === 'granted') {
            const notification = new Notification('⏰ Compte à rebours terminé !', {
                body: "Votre temps est écoulé. Cliquez pour revenir à l'application.",
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'countdown-finished',
                requireInteraction: true, // La notification reste jusqu'à interaction
                silent: false
            });

            // Fermer la notification après 10 secondes si pas d'interaction
            setTimeout(() => notification.close(), 10000);

            // Focus sur la fenêtre quand on clique sur la notification
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }

        // Son d'alerte amélioré
        try {
            playAlertSound();
        } catch (error) {
            // Fallback avec audio HTML5 si Web Audio API échoue
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {}); // Ignore les erreurs de lecture
        }

        // Faire clignoter l'onglet du navigateur
        let originalTitle = document.title;
        let isBlinking = true;
        const blinkInterval = setInterval(() => {
            document.title = isBlinking ? `⏰ ${t.timeUp as string}` : originalTitle;
            isBlinking = !isBlinking;
        }, 1000);

        // Arrêter le clignotement après 30 secondes ou quand la modal est fermée
        setTimeout(() => {
            clearInterval(blinkInterval);
            document.title = originalTitle;
        }, 30000);

        // Terminer la session comme un chronomètre normal
        handleStop(countdownDuration);
    };

    const { elapsedTime, status, start, pause, resume, stop, forcePause } = useTimer(handleStop);
    const countdown = useCountdown(handleCountdownFinish);

    // Vérifier si c'est la première visite et demander les permissions
    useEffect(() => {
        if (user) {
            const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${user.uid}`);
            if (!hasSeenWelcome) {
                setShowWelcome(true);
            }

            // Demander la permission de notification
            requestNotificationPermission();
        }
    }, [user]);

    const handleWelcomeClose = () => {
        if (user) {
            localStorage.setItem(`hasSeenWelcome_${user.uid}`, 'true');
        }
        setShowWelcome(false);
    };

    const setupRandomCheck = useCallback(() => {
       if (randomCheckTimerRef.current) clearTimeout(randomCheckTimerRef.current);
       const randomMinutes = Math.floor(Math.random() * (45 - 20 + 1) + 20);
       randomCheckTimerRef.current = window.setTimeout(() => {
           setShowRandomCheckModal(true);
           forcePause();
       }, randomMinutes * 60 * 1000);
    }, [forcePause]);

    const handleStart = () => {
        // Mode libre : permettre le démarrage sans validation stricte
        if (!freeMode && (!firstTask.trim() || !selectedAgencyId)) return;

        const startTime = Timestamp.now();
        setSessionStartTime(startTime);

        // Déterminer les valeurs à utiliser selon le mode
        const taskToLog = freeMode && !firstTask.trim() ? 'Session libre' : firstTask;

        // Si mode libre et pas d'agence sélectionnée, créer/utiliser l'agence "Libre"
        if (freeMode && !selectedAgencyId) {
            // Vérifier si l'agence "Libre" existe déjà
            const freeAgency = agencies.find(a => a.name.toLowerCase() === 'libre');
            if (!freeAgency) {
                // Créer l'agence "Libre" automatiquement
                addAgency('Libre').then(newAgency => {
                    if (newAgency) {
                        setSelectedAgencyId(newAgency.id);
                    }
                });
            } else {
                setSelectedAgencyId(freeAgency.id);
            }
        }

        const firstLog: LogEntry = { timestamp: startTime, note: taskToLog };
        setCurrentLogs([firstLog]);

        if (timerMode === 'countdown') {
            countdown.start(countdownDuration);
        } else {
            start();
        }
        setupRandomCheck();
    };

    const handleAddNote = () => {
        if (!currentNote.trim() || status === 'stopped') return;
        const newLog: LogEntry = { timestamp: Timestamp.now(), note: currentNote };
        setCurrentLogs(prev => [...prev, newLog]);
        setCurrentNote('');
    };

    const handleAddAgency = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newAgencyName.trim()) return;
        const newAgency = await addAgency(newAgencyName);
        if(newAgency) {
            setSelectedAgencyId(newAgency.id);
            setNewAgencyName('');
            setShowAddAgency(false);
               }
    }

    const handleDeleteAgency = async (agency: Agency) => {
        if (window.confirm(t.confirmDeleteAgency as string)) {
            const success = await deleteAgency(agency);
            if (success && selectedAgencyId === agency.id) {
                setSelectedAgencyId(''); // Désélectionner si c'était l'agence sélectionnée
            }
        }
    };

    const handleInactivity = useCallback(() => {
        if (status === 'running') {
            forcePause();
            setShowInactivityModal(true);
        }
    }, [status, forcePause]);

    // 🔄 CISCO: Gestionnaires pour la gestion multi-onglets
    const handleTabVisibilityChange = useCallback((isVisible: boolean) => {
        console.log(`👁️ Visibilité onglet changée: ${isVisible ? 'visible' : 'masqué'}`);

        if (!isVisible && status === 'running') {
            // Onglet masqué mais timer continue - notification optionnelle
            console.log('🔄 Timer continue en arrière-plan');
        } else if (isVisible && status === 'running') {
            // Onglet redevenu visible - synchronisation si nécessaire
            console.log('👁️ Retour sur onglet - timer toujours actif');
        }
    }, [status]);

    const handleWorkingUrlChange = useCallback((url: string) => {
        setWorkingUrl(url);
        console.log(`🔗 URL de travail mise à jour: ${url}`);
    }, []);

    useInactivityDetector(handleInactivity, 300000); // 5 minutes

    const handleResumeFromModal = () => {
        setShowInactivityModal(false);
        resume();
    };

    const handleRandomCheckConfirm = (note: string) => {
        const newLog: LogEntry = { timestamp: Timestamp.now(), note: `[Vérification] ${note}` };
        setCurrentLogs(prev => [...prev, newLog]);
        setShowRandomCheckModal(false);
        resume();
        setupRandomCheck(); // Reschedule next check
    };

    const handleRandomCheckDismiss = () => {
        const newLog: LogEntry = { timestamp: Timestamp.now(), note: `[Vérification] Aucune réponse - session mise en pause.` };
        setCurrentLogs(prev => [...prev, newLog]);
        setShowRandomCheckModal(false);
        // Timer is already paused by `forcePause` when modal opens
    };

    const canStart = freeMode || (firstTask.trim() !== '' && selectedAgencyId !== '');

    return (
        <TimeProvider>
            <DynamicBackground skyMode={currentBackgroundMode}>
                <div className="font-sans">

                    <Header
                        user={user}
                        onLogout={logout}
                        lang={lang}
                        setLang={setLang}
                        t={t}
                            onShowHelp={() => setShowHelp(true)}
                            onShowAgencySelector={() => {
                                setShowAgencySelector(!showAgencySelector);
                            }}
                            onShowHistory={() => {
                                setShowHistory(!showHistory);
                            }}
                            onShowArchives={() => {
                                setShowArchives(!showArchives);
                                if (!showArchives) {
                                    fetchArchives(); // Charger les archives quand on ouvre la section
                                }
                            }}
                            showAgencySelector={showAgencySelector}
                            showHistory={showHistory}
                            showArchives={showArchives}
                        />

            <main className="p-3 sm:p-4 lg:p-8 max-w-4xl mx-auto pt-48 sm:pt-52 md:pt-56">
                {/* Timer Dashboard - Affiché seulement si showAgencySelector est true */}
                {showAgencySelector && (
                <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-xl border border-gray-700 mt-8 sm:mt-12 md:mt-16" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                        {/* Left: Config */}
                        <div>
                            {/* Toggle Mode Libre */}
                            <div className="mb-4 flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={freeMode}
                                        onChange={(e) => setFreeMode(e.target.checked)}
                                        disabled={status !== 'stopped'}
                                        className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 focus:ring-2 disabled:opacity-50"
                                    />
                                    <span className="text-sm font-medium text-gray-300">
                                        🆓 Mode libre
                                    </span>
                                </label>
                                {freeMode && (
                                    <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded">
                                        Chronomètre sans contraintes
                                    </span>
                                )}
                            </div>

                           <label htmlFor="agency-select" className="block text-sm font-medium text-gray-400 mb-2">{t.selectAgency as string}</label>
                            <div className="flex space-x-2">
                                <select
                                    id="agency-select"
                                    value={selectedAgencyId}
                                    onChange={(e) => setSelectedAgencyId(e.target.value)}
                                    disabled={status !== 'stopped' || freeMode}
                                    className={`w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-700/50 disabled:cursor-not-allowed ${freeMode ? 'opacity-50' : ''}`}
                                >
                                    <option value="" disabled>{freeMode ? 'Mode libre activé' : t.selectAgency as string}</option>
                                    {agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
                                </select>
                                <button
                                    onClick={() => setShowAddAgency(!showAddAgency)}
                                    disabled={status !== 'stopped' || freeMode}
                                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                                    title={freeMode ? 'Désactivé en mode libre' : t.addAgency as string}
                                >
                                    <PlusIcon/>
                                </button>
                                {selectedAgencyId && (
                                    <button
                                        onClick={() => {
                                            const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
                                            if (selectedAgency) handleDeleteAgency(selectedAgency);
                                        }}
                                        disabled={status !== 'stopped' || freeMode}
                                        className="p-3 bg-red-700 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
                                        title={freeMode ? 'Désactivé en mode libre' : t.deleteAgency as string}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                            {showAddAgency && (
                                <form onSubmit={handleAddAgency} className="mt-4 flex space-x-2">
                                    <input
                                        type="text"
                                        value={newAgencyName}
                                        onChange={(e) => setNewAgencyName(e.target.value)}
                                        placeholder={t.agencyName as string}
                                        className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    />
                                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md">{t.add as string}</button>
                                </form>
                            )}
                            <textarea
                                value={firstTask}
                                onChange={(e) => setFirstTask(e.target.value)}
                                placeholder={freeMode ? "Tâche optionnelle (laissez vide pour 'Session libre')" : t.firstTaskPrompt as string}
                                disabled={status !== 'stopped'}
                                className={`mt-4 w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-700/50 disabled:cursor-not-allowed ${freeMode ? 'border-teal-500/50' : ''}`}
                                rows={3}
                            />
                        </div>
                        {/* Right: Timer and Controls */}
                        <div className="flex flex-col items-center justify-center h-full">
                            {/* Bouton de permutation de mode */}
                            <button
                                onClick={() => setTimerMode(timerMode === 'stopwatch' ? 'countdown' : 'stopwatch')}
                                disabled={status !== 'stopped'}
                                className="mb-3 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {timerMode === 'stopwatch' ? `⏰ ${t.switchToCountdown as string}` : `⏱️ ${t.switchToStopwatch as string}`}
                            </button>

                            {/* Configuration du compte à rebours */}
                            {timerMode === 'countdown' && status === 'stopped' && (
                                <div className="mb-4 flex items-center gap-2">
                                    <label className="text-sm text-gray-400">{t.setDuration as string}:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={Math.floor(countdownDuration / (60 * 1000))}
                                        onChange={(e) => setCountdownDuration(Math.max(1, parseInt(e.target.value) || 5) * 60 * 1000)}
                                        className="w-16 bg-gray-700 border border-gray-600 rounded-md p-1 text-center text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    />
                                    <span className="text-sm text-gray-400">{t.minutes as string}</span>
                                </div>
                            )}

                            <div className="font-mono text-gray-200 tracking-wider text-center">
                                <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                                    {timerMode === 'countdown'
                                        ? formatTime(countdown.remainingTime)
                                        : formatTime(elapsedTime)
                                    }
                                </span>
                            </div>
                            {(status === 'paused' || countdown.status === 'paused') && <p className="text-yellow-400 font-semibold animate-pulse text-sm sm:text-base">{t.sessionPaused as string}</p>}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 w-full sm:w-auto">
                                {(status === 'stopped' && countdown.status === 'stopped') && (
                                    <button onClick={handleStart} disabled={!canStart} className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"><PlayIcon /> <span>{t.start as string}</span></button>
                                )}
                                {(status === 'running' || countdown.status === 'running') && (
                                    <button onClick={timerMode === 'countdown' ? countdown.pause : pause} className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><PauseIcon /> <span>{t.pause as string}</span></button>
                                )}
                                {(status === 'paused' || countdown.status === 'paused') && (
                                    <button onClick={timerMode === 'countdown' ? countdown.resume : resume} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><PlayIcon /> <span>{t.resume as string}</span></button>
                                )}
                                {(status === 'running' || status === 'paused' || countdown.status === 'running' || countdown.status === 'paused') && (
                                    <button onClick={handleStopWithIntermediate} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><StopIcon/> <span>{t.stop as string}</span></button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Log for current session */}
                    {status !== 'stopped' && (
                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold mb-2">{t.activityLog as string}</h3>
                            <div className="flex space-x-2 mb-4">
                                <input
                                    type="text"
                                    value={currentNote}
                                    onChange={(e) => setCurrentNote(e.target.value)}
                                    placeholder={t.addNote as string}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                <button onClick={handleAddNote} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md">{t.add as string}</button>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                {currentLogs.slice().reverse().map((log, index) => (
                                    <div key={index} className="text-sm bg-gray-900/50 p-2 rounded-md">
                                        <span className="font-mono text-gray-400 mr-3">[{formatTimestamp(log.timestamp, lang)}]</span>
                                        <span className="text-gray-300">{log.note}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* Session History - Affiché seulement si showHistory est true */}
                {showHistory && (
                <div className="printable-area">
                    <HistoryPanel history={history} lang={lang} t={t} onClearHistory={clearHistory} onDeleteSession={deleteHistorySession} />
                </div>
                )}

                {/* Archives - Affiché seulement si showArchives est true */}
                {showArchives && (
                <div className="printable-area">
                    <ArchivesPanel
                        archives={archives}
                        lang={lang}
                        t={t}
                        onDeleteSession={deleteArchivedSession}
                        onExportJSON={exportToJSON}
                        onExportCSV={exportToCSV}
                        onExportTXT={exportToTXT}
                        onExportPDF={exportToPDF}
                    />
                </div>
                )}


            </main>

            {/* Modals */}
            {showInactivityModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-4 sm:p-8 max-w-md w-full text-center shadow-2xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">{t.inactivityTitle as string}</h2>
                        <p className="text-gray-300 mb-6 text-sm sm:text-base">{t.inactivityText as string}</p>
                        <button
                            onClick={handleResumeFromModal}
                            className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            {t.resume as string}
                        </button>
                    </div>
                </div>
            )}
            {showRandomCheckModal && (
                <RandomCheckModal
                    t={t}
                    onConfirm={handleRandomCheckConfirm}
                    onDismiss={handleRandomCheckDismiss}
                />
            )}

            {/* Welcome Modal */}
            {showWelcome && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg max-w-xl w-full">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-teal-400">{t.welcomeTitle as string}</h3>
                        <p className="text-gray-300 mb-6 text-sm sm:text-base">{t.welcomeMessage as string}</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <button
                                onClick={() => {
                                    handleWelcomeClose();
                                    setShowHelp(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex-1 text-sm sm:text-base"
                            >
                                {t.help as string}
                            </button>
                            <button
                                onClick={handleWelcomeClose}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex-1 text-sm sm:text-base"
                            >
                                {t.gotIt as string}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal des intermédiaires */}
            {showIntermediateModal && (
                <IntermediateModal
                    t={t}
                    onConfirm={handleIntermediateConfirm}
                    onEndSession={handleIntermediateEndSession}
                    onCancel={handleIntermediateCancel}
                />
            )}

            {/* Modal de fin de compte à rebours avec effets visuels améliorés */}
            {showCountdownFinished && (
                <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50 p-4 animate-pulse">
                    <div className="bg-gradient-to-br from-red-800 to-orange-800 rounded-lg p-8 max-w-md w-full text-center shadow-2xl border-4 border-red-500 animate-bounce">
                        <div className="text-8xl mb-6 animate-spin">⏰</div>
                        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
                            🚨 {t.timeUp as string} 🚨
                        </h2>
                        <p className="text-red-100 mb-6 text-lg font-semibold">
                            {t.countdownFinished as string}
                        </p>
                        <div className="mb-6">
                            <div className="text-yellow-300 text-sm mb-2">
                                ⚡ {t.sessionAutoSaved as string} ⚡
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowCountdownFinished(false);
                                // Arrêter le clignotement du titre
                                document.title = 'TimeTracker V4';
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg border-2 border-red-400 animate-pulse"
                        >
                            ✅ {t.understood as string}
                        </button>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-400">{t.helpTitle as string}</h3>
                        <div className="text-gray-300 mb-6 whitespace-pre-line text-sm sm:text-base">
                            {t.helpContent as string}
                        </div>
                        <button
                            onClick={() => setShowHelp(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg w-full text-sm sm:text-base"
                        >
                            {t.closeHelp as string}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                  .print\\:hidden { display: none; }
                  body { background-color: white; color: black; }
                  .printable-area {
                    color: black;
                    background-color: white;
                  }
                  .printable-area div, .printable-area button {
                    background-color: #f9fafb !important;
                    color: black !important;
                    border-color: #e5e7eb !important;
                  }
                  .printable-area h2, .printable-area p, .printable-area span, .printable-area li {
                    color: black !important;
                  }
                }

                /* 🌅 STYLES POUR L'ANIMATION DE LEVER DE SOLEIL - VERSION RÉALISTE CISCO */

                /*
                  Halo solaire ULTRA-DIFFUS - CISCO: BEAUCOUP plus lumineux sans cercle net
                  Lueur diffuse maximale pour tous les backgrounds
                */
                .sun-glow {
                  background: radial-gradient(circle,
                    rgba(255, 255, 255, 0.6) 0%,     /* CISCO: Centre plus lumineux */
                    rgba(255, 255, 200, 0.5) 5%,     /* CISCO: Transition ultra-douce */
                    rgba(255, 240, 120, 0.4) 10%,    /* CISCO: Jaune-blanc lumineux */
                    rgba(255, 220, 60, 0.35) 15%,    /* CISCO: Jaune doré plus intense */
                    rgba(255, 200, 20, 0.3) 25%,     /* CISCO: Jaune pur étendu */
                    rgba(255, 180, 0, 0.25) 35%,     /* CISCO: Orange diffus */
                    rgba(255, 160, 0, 0.2) 50%,      /* CISCO: Extension large */
                    rgba(255, 140, 0, 0.15) 65%,     /* CISCO: Bordure étendue */
                    rgba(255, 120, 0, 0.1) 80%,      /* CISCO: Très étendu */
                    rgba(255, 100, 0, 0.05) 90%,     /* CISCO: Extension maximale */
                    rgba(255, 80, 0, 0.02) 95%,      /* CISCO: Bordure ultra-diffuse */
                    transparent 100%);
                  border-radius: 50%;
                  transform-origin: center center;
                  filter: blur(25px) brightness(1.8) contrast(1.2); /* CISCO: Blur maximal pour diffusion totale, AUCUN cercle */
                }

                /*
                  🌟 LENS FLARE PNG - CISCO: Image réelle avec rotation très lente
                  Remplace le CSS par une vraie image de lens flare
                */

                /* Animation subtile pour le lens flare PNG (maintenue) */
                @keyframes lens-flare-shimmer {
                  0%, 100% {
                    opacity: 0.8;
                    transform: scale(1.0);
                  }
                  50% {
                    opacity: 1.0;
                    transform: scale(1.05);
                  }
                }
            `}</style>

                    {/* Système d'ambiance sonore - Connecté automatiquement */}
                    <AmbientSoundManager
                        skyMode={currentBackgroundMode}
                        enabled={audioEnabled}
                        volume={audioVolume}
                    />

                    {/* 🔊 Effets sonores du timer - CISCO */}
                    <TimerSoundEffects
                        enabled={audioEnabled}
                        volume={audioVolume}
                    />

                    {/* 🔄 CISCO: Gestionnaire multi-onglets */}
                    <MultiTabManager
                        enabled={multiTabEnabled}
                        onVisibilityChange={handleTabVisibilityChange}
                        onWorkingUrlChange={handleWorkingUrlChange}
                    />

                    <BackgroundInfo />

                    {/* Boutons de contrôle repositionnés avec flexbox */}
                    <ControlButtonsWrapperWithTime
                        audioEnabled={audioEnabled}
                        audioVolume={audioVolume}
                        onToggleEnabled={setAudioEnabled}
                        onVolumeChange={setAudioVolume}
                        onSetMode={handleSetMode}
                        onResetToAuto={handleResetToAuto}
                        lang={lang}
                    />

                    {/* Footer slide avec liens sociaux */}
                    <SlideFooter />
                </div>
            </DynamicBackground>
        </TimeProvider>
    );
};

// ========= MAIN APP COMPONENT =========
export default function App() {
    const { user, isLoading, login, logout } = useAuth();
    const [lang, setLang] = useState<Lang>('fr');
    const t = useMemo(() => translations[lang], [lang]);

    const {
        agencies,
        addAgency,
        deleteAgency,
        history,
        archives,
        saveSession,
        clearHistory,
        fetchArchives,
        getOldSessions,
        exportToJSON,
        exportToCSV,
        exportToTXT,
        exportToPDF,
        archiveSessions,
        deleteHistorySession,
        deleteArchivedSessions,
        deleteArchivedSession
    } = useFirestore(user?.uid);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">{t.loading as string}...</div>;
    }

    if (!user) {
        return <LoginScreen onLogin={login} lang={lang} />;
    }

    return (
        <LocationProvider>
            <AppWithLocation
                user={user}
                lang={lang}
                setLang={setLang}
                t={t}
                agencies={agencies}
                addAgency={addAgency}
                deleteAgency={deleteAgency}
                history={history}
                archives={archives}
                saveSession={saveSession}
                clearHistory={clearHistory}
                fetchArchives={fetchArchives}
                getOldSessions={getOldSessions}
                exportToJSON={exportToJSON}
                exportToCSV={exportToCSV}
                exportToTXT={exportToTXT}
                exportToPDF={exportToPDF}
                archiveSessions={archiveSessions}
                deleteHistorySession={deleteHistorySession}
                deleteArchivedSessions={deleteArchivedSessions}
                deleteArchivedSession={deleteArchivedSession}
                logout={logout}
            />
        </LocationProvider>
    );
}