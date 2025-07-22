#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers audio...');

const distDir = path.join(__dirname, '..', 'dist');
const soundsDir = path.join(distDir, 'sounds');

if (!fs.existsSync(distDir)) {
  console.error('❌ Le dossier dist n\'existe pas. Lancez d\'abord npm run build');
  process.exit(1);
}

if (!fs.existsSync(soundsDir)) {
  console.error('❌ Le dossier sounds n\'existe pas dans dist');
  process.exit(1);
}

console.log('✅ Dossier sounds trouvé dans dist');

// Lister tous les fichiers .mp3
function findMp3Files(dir, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...findMp3Files(fullPath, relativePath));
    } else if (item.endsWith('.mp3')) {
      files.push(relativePath);
    }
  }
  
  return files;
}

const mp3Files = findMp3Files(soundsDir);

console.log(`\n📊 Fichiers audio trouvés (${mp3Files.length}) :`);
mp3Files.forEach(file => {
  const fullPath = path.join(soundsDir, file);
  const stats = fs.statSync(fullPath);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`  ✅ ${file} (${sizeKB} KB)`);
});

if (mp3Files.length === 0) {
  console.error('❌ Aucun fichier audio trouvé !');
  process.exit(1);
}

console.log('\n🎉 Tous les fichiers audio sont présents dans le build !');
