#!/usr/bin/env node

/**
 * Script pour déployer les règles Firestore
 * 
 * Prérequis:
 * 1. Installer Firebase CLI: npm install -g firebase-tools
 * 2. Se connecter: firebase login
 * 3. Initialiser le projet: firebase init firestore
 * 
 * Usage: node scripts/deploy-firestore-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Déploiement des règles Firestore...');

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

try {
    // Déployer les règles
    console.log('📤 Déploiement en cours...');
    execSync('firebase deploy --only firestore:rules', { 
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
    console.error('❌ Erreur lors du déploiement:', error.message);
    console.log('');
    console.log('💡 Solutions possibles:');
    console.log('   1. Vérifiez que vous êtes connecté: firebase login');
    console.log('   2. Vérifiez le projet: firebase projects:list');
    console.log('   3. Sélectionnez le bon projet: firebase use <project-id>');
    process.exit(1);
}
