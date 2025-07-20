import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
    noHistory: "Aucun historique de session trouvé.",
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
    noHistory: "No session history found.",
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
    hour: '2-digit', minute: '2-digit', second: '2-digit',
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        await checkAndCreateUserProfile(appUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error during sign-in:", error);
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

    const fetchHistory = useCallback(async () => {
        if (!userId) return;
        const sessionsColRef = collection(db, 'sessions');
        const q = query(sessionsColRef, where("userId", "==", userId), orderBy("startTime", "desc"));
        try {
            const querySnapshot = await getDocs(q);
            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() } as Session);
            });
            setHistory(sessions);
        } catch (error) {
            console.error("Error fetching history:", error);
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

    return { agencies, addAgency, history, saveSession, fetchHistory };
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-200 mb-4">{t.loginTitle as string}</h1>
            <p className="text-gray-400 mb-8 max-w-md">La solution moderne pour le suivi de temps des freelances et intérimaires.</p>
            <button
                onClick={onLogin}
                className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
                <GoogleIcon />
                {t.loginButton as string}
            </button>
        </div>
    );
};

const Header: React.FC<{ user: AppUser; onLogout: () => void; lang: Lang; setLang: (l: Lang) => void; t: Translations }> = ({ user, onLogout, lang, setLang, t }) => {
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center print:hidden">
            <h1 className="text-xl font-bold text-teal-500">{t.loginTitle as string}</h1>
            <div className="flex items-center space-x-4">
                <span className="text-gray-400 hidden sm:block">{t.welcome as string}, {user.displayName?.split(' ')[0]}</span>
                <div className="flex items-center">
                    <button onClick={() => setLang('fr')} className={`px-2 py-1 text-sm rounded-l-md ${lang === 'fr' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>FR</button>
                    <button onClick={() => setLang('en')} className={`px-2 py-1 text-sm rounded-r-md ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>EN</button>
                </div>
                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">{t.logout as string}</button>
            </div>
        </header>
    );
};

const HistoryPanel: React.FC<{ history: Session[], lang: Lang, t: Translations }> = ({ history, lang, t }) => {
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

    if (history.length === 0) {
        return <div className="p-4 text-center text-gray-500">{t.noHistory as string}</div>
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t.sessionHistory as string}</h2>
                <div className="space-x-2 print:hidden">
                    <button onClick={exportTxt} className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm">{t.exportTxt as string}</button>
                    <button onClick={sendEmail} className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm">{t.sendEmail as string}</button>
                    <button onClick={printReport} className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm">{t.print as string}</button>
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
    
    const { agencies, addAgency, history, saveSession } = useFirestore(user?.uid);

    const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
    const [newAgencyName, setNewAgencyName] = useState('');
    const [showAddAgency, setShowAddAgency] = useState(false);
    
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
        <div className="min-h-screen bg-gray-900 font-sans">
            <Header user={user} onLogout={logout} lang={lang} setLang={setLang} t={t} />

            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                {/* Timer Dashboard */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
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
                            <p className="font-mono text-6xl md:text-7xl text-gray-200 tracking-wider">
                                {formatTime(elapsedTime)}
                            </p>
                            {status === 'paused' && <p className="text-yellow-400 font-semibold animate-pulse">{t.sessionPaused as string}</p>}
                            <div className="flex space-x-4 mt-6">
                                {status === 'stopped' && (
                                    <button onClick={handleStart} disabled={!canStart} className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"><PlayIcon /> <span>{t.start as string}</span></button>
                                )}
                                {status === 'running' && (
                                    <button onClick={pause} className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"><PauseIcon /> <span>{t.pause as string}</span></button>
                                )}
                                {status === 'paused' && (
                                    <button onClick={resume} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"><PlayIcon /> <span>{t.resume as string}</span></button>
                                )}
                                {(status === 'running' || status === 'paused') && (
                                    <button onClick={stop} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"><StopIcon/> <span>{t.stop as string}</span></button>
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
                    <HistoryPanel history={history} lang={lang} t={t} />
                </div>
            </main>
            
            {/* Modals */}
            {showInactivityModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.inactivityTitle as string}</h2>
                        <p className="text-gray-300 mb-6">{t.inactivityText as string}</p>
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
        </div>
    );
}