// Tests unitaires pour la validation des variables d'environnement Firebase
// 🇫🇷 Tous les messages/nommages en français
import { describe, it, expect } from 'vitest';
import { validateFirebaseEnv, requiredFirebaseEnvVars } from '../firebase-config';

describe('validateFirebaseEnv', () => {
  it('valide un environnement complet sans erreur', () => {
    const env: Record<string, string> = {};
    for (const key of requiredFirebaseEnvVars) env[key] = 'dummy';
    expect(() => validateFirebaseEnv(env)).not.toThrow();
  });

  it("lève une erreur si une variable est manquante", () => {
    const env: Record<string, string> = {};
    for (const key of requiredFirebaseEnvVars) env[key] = 'dummy';
    delete env['VITE_FIREBASE_API_KEY'];
    expect(() => validateFirebaseEnv(env)).toThrow(/VITE_FIREBASE_API_KEY/);
  });
});

