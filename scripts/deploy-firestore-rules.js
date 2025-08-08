#!/usr/bin/env node

/**
 * Script pour déployer les règles Firestore (ESM compatible)
 *
 * Prérequis:
 * 1. Installer Firebase CLI: npm install -g firebase-tools
 * 2. Se connecter: firebase login
 * 3. Initialiser le projet: firebase init firestore
 *
 * Usage:
 *   node scripts/deploy-firestore-rules.js --project <project-id>
 *   # ou définir la variable d'environnement FIREBASE_PROJECT
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('🔥 Déploiement des règles Firestore...');

// Résolution __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérifier que les fichiers existent
const rulesFile = path.join(__dirname, '..', 'firestore.rules');
const configFile = path.join(__dirname, '..', 'firebase.json');

if (!fs.existsSync(rulesFile)) {
    console.error('❌ Fichier firestore.rules introuvable');
    process.exit(1);
}

if (!fs.existsSync(configFile)) {
    console.error('❌ Fichier firebase.json introuvable');
    process.exit(1);
}

// Récupérer le projectId via --project ou env
const args = process.argv.slice(2);
const projectArgIndex = args.findIndex(a => a === '--project');
let projectId = process.env.FIREBASE_PROJECT || '';
if (projectArgIndex !== -1 && args[projectArgIndex + 1]) {
    projectId = args[projectArgIndex + 1];
}

try {
    // Construire la commande
    const baseCmd = 'firebase deploy --only firestore:rules';
    const cmd = projectId ? `${baseCmd} --project ${projectId}` : baseCmd;

    if (!projectId) {
        console.warn('⚠️  Aucun projectId fourni. La CLI utilisera le projet actif si configuré.');
        console.warn('    Passez --project <project-id> ou définissez FIREBASE_PROJECT pour éviter cette alerte.');
    }

    console.log('📤 Déploiement en cours...');
    execSync(cmd, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    console.log('✅ Règles Firestore déployées avec succès !');
    console.log('');
    console.log('🔍 Pour vérifier les règles:');
    console.log('   firebase firestore:rules get');
    console.log('');
    console.log('🧪 Pour tester les règles:');
    console.log('   firebase emulators:start --only firestore');

} catch (error) {
    console.error('❌ Erreur lors du déploiement:', error?.message || error);
    console.log('');
    console.log('💡 Solutions possibles:');
    console.log('   1. Vérifiez que vous êtes connecté: firebase login');
    console.log('   2. Vérifiez le projet: firebase projects:list');
    console.log('   3. Spécifiez le projet: --project <project-id> ou FIREBASE_PROJECT=...');
    process.exit(1);
}
