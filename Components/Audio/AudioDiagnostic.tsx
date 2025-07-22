import React, { useState } from 'react';

// Types pour les tests audio
type AudioTestResult = {
  fileName: string;
  folder: string;
  url: string;
  loaded: boolean;
  duration?: number;
  error?: string;
};

const AudioDiagnostic: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [testResults, setTestResults] = useState<AudioTestResult[]>([]);
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);

  // Configuration complète des fichiers audio
  const audioFiles = [
    { fileName: 'night-atmosphere-with-crickets-374652.mp3', folder: 'nuit-profonde' },
    { fileName: 'hibou-molkom.mp3', folder: 'nuit-profonde' },
    { fileName: 'village_morning_birds_roosters.mp3', folder: 'aube' },
    { fileName: 'blackbird.mp3', folder: 'lever-soleil' },
    { fileName: 'morning-birdsong.mp3', folder: 'matin' },
    { fileName: 'insect_bee_fly.mp3', folder: 'matin' },
    { fileName: 'forest_cicada.mp3', folder: 'midi' },
    { fileName: 'birds-singing.mp3', folder: 'apres-midi' },
    { fileName: 'summer-insects-243572.mp3', folder: 'apres-midi' },
    { fileName: 'bird-chirp.mp3', folder: 'coucher-soleil' },
    { fileName: 'grillon-drome.mp3', folder: 'coucher-soleil' },
    { fileName: 'cricket-single.mp3', folder: 'crepuscule' },
    { fileName: 'merle-blackbird.mp3', folder: 'crepuscule' }
  ];

  const testAudioFile = (fileName: string, folder: string): Promise<AudioTestResult> => {
    return new Promise((resolve) => {
      const url = `/sounds/${folder}/${fileName}`;
      const audio = new Audio(url);
      
      const result: AudioTestResult = {
        fileName,
        folder,
        url,
        loaded: false
      };

      const timeout = setTimeout(() => {
        audio.pause();
        resolve({
          ...result,
          error: 'Timeout (10s) - Fichier non trouvé ou trop lourd'
        });
      }, 10000);

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);
        resolve({
          ...result,
          loaded: true,
          duration: audio.duration
        });
      }, { once: true });

      audio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        resolve({
          ...result,
          error: `Erreur de chargement: ${(e as any).message || 'Fichier non trouvé'}`
        });
      }, { once: true });

      audio.load();
    });
  };

  const runAllTests = async () => {
    setIsTestingInProgress(true);
    setTestResults([]);

    const results: AudioTestResult[] = [];
    
    for (const audioFile of audioFiles) {
      const result = await testAudioFile(audioFile.fileName, audioFile.folder);
      results.push(result);
      setTestResults([...results]); // Mise à jour en temps réel
    }

    setIsTestingInProgress(false);
  };

  const getStatusIcon = (result: AudioTestResult) => {
    if (result.loaded) return '✅';
    if (result.error) return '❌';
    return '⏳';
  };

  const getStatusColor = (result: AudioTestResult) => {
    if (result.loaded) return 'text-green-400';
    if (result.error) return 'text-red-400';
    return 'text-yellow-400';
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl max-h-[80vh] overflow-auto border border-[#A550F5]/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#A550F5]">🔧 Diagnostic Audio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={runAllTests}
            disabled={isTestingInProgress}
            className={`px-4 py-2 rounded-lg font-medium ${
              isTestingInProgress 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-[#0D9488] hover:bg-[#0D9488]/90 text-white'
            }`}
          >
            {isTestingInProgress ? '🔄 Test en cours...' : '▶️ Tester tous les fichiers audio'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#A550F5] mb-3">
              Résultats des tests ({testResults.filter(r => r.loaded).length}/{audioFiles.length} fichiers OK)
            </h3>
            
            <div className="grid gap-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.loaded 
                      ? 'border-green-500/30 bg-green-900/20' 
                      : result.error 
                        ? 'border-red-500/30 bg-red-900/20'
                        : 'border-yellow-500/30 bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getStatusIcon(result)}</span>
                      <div>
                        <div className="font-medium">
                          {result.fileName}
                        </div>
                        <div className="text-sm text-gray-400">
                          📁 {result.folder}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-sm ${getStatusColor(result)}`}>
                      {result.loaded ? (
                        <div>
                          ✅ Chargé ({result.duration ? `${result.duration.toFixed(1)}s` : 'durée inconnue'})
                        </div>
                      ) : result.error ? (
                        <div>❌ {result.error}</div>
                      ) : (
                        <div>⏳ Test en cours...</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div className="mt-6 p-4 bg-[#0D9488]/20 rounded-lg border border-[#A550F5]/30">
              <h4 className="font-semibold text-[#A550F5] mb-2">📊 Résumé</h4>
              <div className="text-sm space-y-1">
                <div>✅ Fichiers chargés avec succès: {testResults.filter(r => r.loaded).length}</div>
                <div>❌ Fichiers en erreur: {testResults.filter(r => r.error).length}</div>
                <div>📁 Dossiers testés: {new Set(testResults.map(r => r.folder)).size}</div>
              </div>
            </div>
          </div>
        )}

        {!isTestingInProgress && testResults.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Cliquez sur "Tester tous les fichiers audio" pour démarrer le diagnostic
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDiagnostic;
