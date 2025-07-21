import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DynamicBackground from './DynamicBackground';
import LoginBackground from './LoginBackground';
import BackgroundInfo from './BackgroundInfo';
import LocationTestButton from './LocationTestButton';

import { TimeProvider } from './TimeContext';
import { LocationProvider } from './LocationContext';
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
    loginTitle: "Pointeuse d'Activité Pro",
    loginButton: "Se connecter avec Google",
    logout: "Déconnexion",
    welcome: "Bienvenue",
    selectAgency: "Sélectionnez une agence",
    addAgency: "Ajouter une nouvelle agence",
    agencyName: "Nom de l'agence",
    add: "Ajouter",
    firstTaskPrompt: "Décrivez votre première tâche pour commencer...",
    start: "Démarrer",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
    addNote: "Ajouter une note...",
    activityLog: "Journal d'activité",
    sessionHistory: "Historique des sessions",
    exportTxt: "Exporter en .txt",
    sendEmail: "Envoyer par Email",
    print: "Imprimer",
    clearHistory: "Vider l'historique",
    confirmClearHistory: "Êtes-vous sûr de vouloir supprimer tout l'historique ? Cette action est irréversible.",
    noHistory: "Aucun historique de session trouvé.",
    help: "Aide",
    welcomeTitle: "Bienvenue dans Pointeuse d'Activité Pro !",
    welcomeMessage: "Cette application vous permet de suivre votre temps de travail par agence. Consultez l'aide pour plus d'informations.",
    helpTitle: "Guide d'utilisation",
    helpContent: `
**Comment utiliser l'application :**

1. **Sélectionnez une agence** dans la liste déroulante
2. **Ajoutez une nouvelle agence** avec le bouton "+"
3. **Décrivez votre première tâche** dans le champ de texte
4. **Cliquez sur "Démarrer"** pour lancer le chronomètre
5. **Ajoutez des notes** pendant votre session de travail
6. **Cliquez sur "Arrêter"** pour terminer la session

**Fonctionnalités :**
- ⏱️ Chronomètre automatique avec pause/reprise
- 📝 Journal d'activité avec horodatage complet
- 📊 Historique des sessions par agence
- 📤 Export en .txt et envoi par email
- 🗑️ Archivage automatique après 90 jours
- 🌐 Interface multilingue (FR/EN)

**Conseils :**
- Décrivez précisément vos tâches pour un suivi optimal
- Utilisez les notes pour documenter votre progression
- L'historique est automatiquement sauvegardé
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
  },
  en: {
    loginTitle: "Pro Activity Tracker",
    loginButton: "Sign in with Google",
    logout: "Logout",
    welcome: "Welcome",
    selectAgency: "Select an agency",
    addAgency: "Add new agency",
    agencyName: "Agency name",
    add: "Add",
    firstTaskPrompt: "Describe your first task to begin...",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    addNote: "Add a note...",
    activityLog: "Activity Log",
    sessionHistory: "Session History",
    exportTxt: "Export as .txt",
    sendEmail: "Send via Email",
    print: "Print",
    clearHistory: "Clear History",
    confirmClearHistory: "Are you sure you want to delete all history? This action cannot be undone.",
    noHistory: "No session history found.",
    help: "Help",
    welcomeTitle: "Welcome to Activity Time Tracker Pro!",
    welcomeMessage: "This application helps you track your work time by agency. Check the help section for more information.",
    helpTitle: "User Guide",
    helpContent: `
**How to use the application:**

1. **Select an agency** from the dropdown list
2. **Add a new agency** with the "+" button
3. **Describe your first task** in the text field
4. **Click "Start"** to begin the timer
5. **Add notes** during your work session
6. **Click "Stop"** to end the session

**Features:**
- ⏱️ Automatic timer with pause/resume
- 📝 Activity log with full timestamps
- 📊 Session history by agency
- 📤 Export to .txt and email sending
- 🗑️ Automatic archiving after 90 days
- 🌐 Multilingual interface (FR/EN)

**Tips:**
- Describe your tasks precisely for optimal tracking
- Use notes to document your progress
- History is automatically saved
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
  },
};


// ========= HELPER FUNCTIONS =========
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
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

    const fetchAgencies = useCallback(async () => {
        if (!userId) return;
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setAgencies(userDoc.data().agencies || []);
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
    
    const saveSession = async (session: Omit<Session, 'id'>) => {
        if (!userId) return;
        try {
            const sessionsColRef = collection(db, 'sessions');
            await addDoc(sessionsColRef, session);
            fetchHistory();
        } catch (error) {
            console.error("Error saving session:", error);
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

        console.log('📚 Chargement de l\'historique...');

        // D'abord, archiver les anciennes sessions (90+ jours)
        // TEMPORAIREMENT DÉSACTIVÉ - Nécessite un index Firebase
        // await autoArchiveOldSessions();

        const sessionsColRef = collection(db, 'sessions');
        const q = query(sessionsColRef, where("userId", "==", userId), orderBy("startTime", "desc"));

        try {
            const querySnapshot = await getDocs(q);
            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() } as Session);
            });
            setHistory(sessions);
            console.log(`✅ ${sessions.length} sessions chargées dans l'historique`);
        } catch (error: any) {
            console.error("❌ Error fetching history:", error);

            // Si c'est une erreur d'index manquant, afficher un message informatif
            if (error.code === 'failed-precondition' && error.message.includes('index')) {
                console.log('🔗 Lien pour créer l\'index automatiquement détecté dans l\'erreur');
                console.log('📋 Suivez le lien dans l\'erreur pour créer l\'index Firestore');
            }

            // En cas d'erreur, garder un historique vide pour ne pas planter l'app
            setHistory([]);
        }

    }, [userId]);


    useEffect(() => {
        if(userId) {
            fetchAgencies();
            fetchHistory();
        } else {
            setAgencies([]);
            setHistory([]);
        }
    }, [userId, fetchAgencies, fetchHistory]);

    return { agencies, addAgency, history, saveSession, fetchHistory, clearHistory };
};


// --- useTimer Hook ---
const useTimer = (onStop: (elapsedSeconds: number) => void) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [status, setStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);
    
    const start = () => {
        startTimeRef.current = Date.now() - (elapsedTime * 1000);
        setStatus('running');
        intervalRef.current = window.setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
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
        if (status === 'paused') {
            const pausedDuration = Date.now() - pauseTimeRef.current;
            startTimeRef.current += pausedDuration;
            start(); // Re-uses start logic
        }
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
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

// --- useInactivityDetector Hook ---
const useInactivityDetector = (onInactive: () => void, timeout = 300000) => { // 5 minutes
    const timerRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(onInactive, timeout);
    }, [onInactive, timeout]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

        const handleActivity = () => resetTimer();
        
        events.forEach(event => window.addEventListener(event, handleActivity));
        resetTimer();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
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

const Header: React.FC<{ user: AppUser; onLogout: () => void; lang: Lang; setLang: (l: Lang) => void; t: Translations; onShowHelp: () => void }> = ({ user, onLogout, lang, setLang, t, onShowHelp }) => {
    return (
        <header className="bg-gray-800 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 print:hidden" style={{ position: 'relative', zIndex: 20 }}>
            <h1 className="text-lg sm:text-xl font-bold text-teal-500 text-center sm:text-left">{t.loginTitle as string}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
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

const HistoryPanel: React.FC<{ history: Session[], lang: Lang, t: Translations, onClearHistory: () => void }> = ({ history, lang, t, onClearHistory }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const generateTxtContent = () => {
        let content = `${t.sessionHistory}\n==================\n\n`;
        history.forEach(session => {
            content += `${t.date as string}: ${formatDate(session.startTime, lang)}\n`;
            content += `${t.agencyName as string}: ${session.agencyName}\n`;
            content += `${t.duration as string}: ${formatTime(session.totalDurationSeconds)}\n`;
            content += `Logs:\n`;
            session.logs.forEach(log => {
                content += `  - [${formatTimestamp(log.timestamp, lang)}] ${log.note}\n`;
            });
            content += `\n------------------\n\n`;
        });
        return content;
    };
    
    const exportTxt = () => {
        const content = generateTxtContent();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `history_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    <button onClick={exportTxt} className="bg-gray-700 hover:bg-gray-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">{t.exportTxt as string}</button>
                    <button onClick={sendEmail} className="bg-gray-700 hover:bg-gray-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">{t.sendEmail as string}</button>
                    <button onClick={printReport} className="bg-gray-700 hover:bg-gray-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">{t.print as string}</button>
                    <button onClick={handleClearHistory} className="bg-red-700 hover:bg-red-600 py-1 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm">{t.clearHistory as string}</button>
                </div>
            </div>
            <div className="space-y-2">
                {history.map(session => (
                    <div key={session.id} className="bg-gray-700 rounded-lg">
                        <button 
                            className="w-full flex justify-between items-center p-4 text-left"
                            onClick={() => setExpandedId(expandedId === session.id ? null : session.id!)}
                        >
                            <div className="flex-1">
                                <p className="font-semibold">{session.agencyName}</p>
                                <p className="text-sm text-gray-400">{formatDate(session.startTime, lang)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-lg">{formatTime(session.totalDurationSeconds)}</p>
                                <p className="text-sm text-gray-400">{t.duration as string}</p>
                            </div>
                            <ChevronDownIcon />
                        </button>
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


// ========= MAIN APP COMPONENT =========
export default function App() {
    const { user, isLoading, login, logout } = useAuth();
    const [lang, setLang] = useState<Lang>('fr');
    const t = useMemo(() => translations[lang], [lang]);
    
    const { agencies, addAgency, history, saveSession, clearHistory } = useFirestore(user?.uid);

    const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
    const [newAgencyName, setNewAgencyName] = useState('');
    const [showAddAgency, setShowAddAgency] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    
    const [firstTask, setFirstTask] = useState('');
    const [currentNote, setCurrentNote] = useState('');
    const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([]);
    const [sessionStartTime, setSessionStartTime] = useState<Timestamp | null>(null);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [showRandomCheckModal, setShowRandomCheckModal] = useState(false);
    const randomCheckTimerRef = useRef<number | null>(null);


    const handleStop = (elapsedSeconds: number) => {
        if (!user || !sessionStartTime || !selectedAgencyId) return;
        
        const selectedAgency = agencies.find(a => a.id === selectedAgencyId);

        const sessionData: Omit<Session, 'id'> = {
            userId: user.uid,
            agencyId: selectedAgencyId,
            agencyName: selectedAgency?.name || 'Unknown',
            startTime: sessionStartTime,
            endTime: Timestamp.now(),
            totalDurationSeconds: elapsedSeconds,
            logs: currentLogs,
        };
        saveSession(sessionData);
        
        // Reset state
        setCurrentLogs([]);
        setSessionStartTime(null);
        setFirstTask('');
        setSelectedAgencyId('');
        if (randomCheckTimerRef.current) clearTimeout(randomCheckTimerRef.current);
    };

    const { elapsedTime, status, start, pause, resume, stop, forcePause } = useTimer(handleStop);

    // Vérifier si c'est la première visite
    useEffect(() => {
        if (user) {
            const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${user.uid}`);
            if (!hasSeenWelcome) {
                setShowWelcome(true);
            }
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
        if (!firstTask.trim() || !selectedAgencyId) return;
        const startTime = Timestamp.now();
        setSessionStartTime(startTime);
        const firstLog: LogEntry = { timestamp: startTime, note: firstTask };
        setCurrentLogs([firstLog]);
        start();
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

    const handleInactivity = useCallback(() => {
        if (status === 'running') {
            forcePause();
            setShowInactivityModal(true);
        }
    }, [status, forcePause]);

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

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">{t.loading as string}...</div>;
    }

    if (!user) {
        return <LoginScreen onLogin={login} lang={lang} />;
    }

    const canStart = firstTask.trim() !== '' && selectedAgencyId !== '';

    return (
        <LocationProvider>
            <TimeProvider>
                <DynamicBackground>
                    <div className="font-sans">

                        <Header user={user} onLogout={logout} lang={lang} setLang={setLang} t={t} onShowHelp={() => setShowHelp(true)} />

            <main className="p-3 sm:p-4 lg:p-8 max-w-4xl mx-auto">
                {/* Timer Dashboard */}
                <div className="bg-gray-800/95 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-xl border border-gray-700" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                        {/* Left: Config */}
                        <div>
                           <label htmlFor="agency-select" className="block text-sm font-medium text-gray-400 mb-2">{t.selectAgency as string}</label>
                            <div className="flex space-x-2">
                                <select 
                                    id="agency-select"
                                    value={selectedAgencyId}
                                    onChange={(e) => setSelectedAgencyId(e.target.value)}
                                    disabled={status !== 'stopped'}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                                >
                                    <option value="" disabled>{t.selectAgency as string}</option>
                                    {agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
                                </select>
                                <button 
                                    onClick={() => setShowAddAgency(!showAddAgency)} 
                                    disabled={status !== 'stopped'}
                                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <PlusIcon/>
                                </button>
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
                                placeholder={t.firstTaskPrompt as string}
                                disabled={status !== 'stopped'}
                                className="mt-4 w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                                rows={3}
                            />
                        </div>
                        {/* Right: Timer and Controls */}
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="font-mono text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gray-200 tracking-wider text-center">
                                {formatTime(elapsedTime)}
                            </p>
                            {status === 'paused' && <p className="text-yellow-400 font-semibold animate-pulse text-sm sm:text-base">{t.sessionPaused as string}</p>}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 w-full sm:w-auto">
                                {status === 'stopped' && (
                                    <button onClick={handleStart} disabled={!canStart} className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"><PlayIcon /> <span>{t.start as string}</span></button>
                                )}
                                {status === 'running' && (
                                    <button onClick={pause} className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><PauseIcon /> <span>{t.pause as string}</span></button>
                                )}
                                {status === 'paused' && (
                                    <button onClick={resume} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><PlayIcon /> <span>{t.resume as string}</span></button>
                                )}
                                {(status === 'running' || status === 'paused') && (
                                    <button onClick={stop} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"><StopIcon/> <span>{t.stop as string}</span></button>
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
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

                {/* Session History */}
                <div className="printable-area">
                    <HistoryPanel history={history} lang={lang} t={t} onClearHistory={clearHistory} />
                </div>
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
            `}</style>
                    <BackgroundInfo />
                    <LocationTestButton />
                </div>
            </DynamicBackground>
        </TimeProvider>
        </LocationProvider>
    );
}