# 🏗️ Architecture Z-Index et Hiérarchie DOM - TimeTracker V4

## 📋 Vue d'ensemble

Ce document explique l'architecture complète des z-index et la hiérarchie des DOM-éléments dans TimeTracker V4, conformément aux spécifications de Cisco.

## 🎯 **Logique des Z-Index selon Cisco**

### **Règle fondamentale :**
- **Plus le z-index est élevé = plus l'élément est en avant-plan**
- **Plus le z-index est bas = plus l'élément est en arrière-plan**
- **Z-index 0** = Neutre (arrière-plan de base)

### **Hiérarchie officielle :**
```
Z-Index 9999 : ⭐ ÉTOILES (NewStars.tsx) - SOLUTION TROUVÉE ! ⭐
Z-Index 10   : Paysage (avant-plan) 🏔️
Z-Index 9    : Nuages (derrière le paysage) ☁️
Z-Index 8    : Lune + Halo (derrière les nuages) 🌙
Z-Index 0    : Dégradé (arrière-plan) 🌅
```

### **🌟 SOLUTION ÉTOILES DÉCOUVERTE :**
- **Problème** : FixedStars.tsx avec z-index 7 → INVISIBLE
- **Solution** : NewStars.tsx avec z-index 9999 → VISIBLE ✅
- **Clé du succès** : Z-index très élevé + tailles garanties (1.5-4px)

## 🏗️ **Architecture DOM Complète**

### **Structure principale dans DynamicBackground.tsx :**

```jsx
<div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
  
  {/* 1. DÉGRADÉ - Z-INDEX 0 (Arrière-plan) */}
  <div
    ref={gradientRef}
    className="absolute inset-0"
    style={{ zIndex: 0 }}
  />
  
  {/* 2. COUCHE ASTRONOMIQUE - Z-INDEX 7 */}
  <AstronomicalLayer skyMode={skyMode} />
  
  {/* 3. COUCHE DIURNE - Z-INDEX 9 */}
  <DiurnalLayer skyMode={skyMode} />
  
  {/* 4. PAYSAGE - Z-INDEX 10 (Avant-plan) */}
  <div
    ref={landscapeRef}
    style={{ zIndex: 10 }}
  />
  
  {/* 5. CONTENU PRINCIPAL - Z-INDEX 15 */}
  <div className="relative" style={{ zIndex: 15 }}>
    {children}
  </div>
  
</div>
```

## ⭐ **AstronomicalLayer.tsx - Z-Index 7**

### **Structure interne :**
```jsx
<div style={{ zIndex: 7 }}>
  
  {/* Étoiles fixes - Z-Index 7 (même niveau que le conteneur) */}
  <FixedStars skyMode={skyMode} density="high" />
  
  {/* Étoiles filantes - Z-Index 7 (même niveau) */}
  <ShootingStars skyMode={skyMode} />
  
  {/* Lune - Z-Index 8 (devant les étoiles) */}
  <MoonAnimation
    isNightMode={skyMode === 'night'}
    currentMode={skyMode}
  />
  
</div>
```

### **Détail FixedStars.tsx :**
```jsx
<div
  ref={containerRef}
  className="fixed absolute inset-0 overflow-hidden pointer-events-none"
  style={{ zIndex: 7 }} // Même niveau que AstronomicalLayer
/>
```

### **Détail MoonAnimation.tsx :**
```jsx
{/* Halo lumineux */}
<div
  ref={haloRef}
  style={{ zIndex: 8 }} // Devant les étoiles, derrière les nuages
/>

{/* Lune principale */}
<div
  ref={moonRef}
  style={{ zIndex: 8 }} // Même niveau que le halo
/>
```

## ☁️ **DiurnalLayer.tsx - Z-Index 9**

### **Structure interne :**
```jsx
<div style={{ zIndex: 9 }}>
  
  {/* Nuages individuels - Tous Z-Index 9 */}
  {clouds.map(cloud => (
    <div
      key={cloud.id}
      style={{
        zIndex: 9, // Tous au même niveau, derrière le paysage
        // ... autres styles
      }}
    />
  ))}
  
</div>
```

## 🏔️ **Paysage - Z-Index 10**

### **Structure dans DynamicBackground.tsx :**
```jsx
<div
  ref={landscapeRef}
  className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
  style={{
    backgroundImage: `url(${selectedBackground})`,
    zIndex: 10, // Avant-plan selon Cisco
    // ... autres styles
  }}
/>
```

## 🎮 **Interface Utilisateur - Z-Index 15+**

### **Hiérarchie des éléments UI :**
```
Z-Index 50 : Indicateur de transition
Z-Index 40 : Boutons de contrôle (TimeSimulator + AudioControlPanel)
Z-Index 15 : Contenu principal de l'application
```

## 🔍 **Stacking Contexts - Concepts Clés**

### **Règles importantes :**
1. **Indépendance des contextes** : Les éléments dans un stacking context sont empilés indépendamment des éléments extérieurs
2. **Ordre DOM** : Si deux éléments ont le même z-index, celui qui apparaît plus tard dans le DOM sera au-dessus
3. **Héritage** : Un enfant avec z-index 999 dans un parent z-index 1 sera toujours derrière un élément z-index 2 au même niveau que le parent

### **Contextes créés dans notre application :**
- **Root** : Document principal
- **DynamicBackground** : Conteneur principal avec `position: relative`
- **Éléments fixed/absolute** : Chaque élément avec `position: fixed` ou `absolute` et z-index crée son propre contexte

## 🚨 **Problèmes Résolus**

### **Avant correction :**
```
❌ AstronomicalLayer : z-index 5 (même niveau que le paysage)
❌ FixedStars : z-index 20 (incohérent)
❌ Lune : z-index 21-22 (trop élevé)
❌ Paysage : z-index 5 (conflit avec AstronomicalLayer)
❌ Nuages : z-index 10-12 (devant le paysage)
```

### **Après correction :**
```
✅ Dégradé : z-index 0 (arrière-plan)
✅ Étoiles : z-index 7 (derrière la lune)
✅ Lune : z-index 8 (derrière les nuages)
✅ Nuages : z-index 9 (derrière le paysage)
✅ Paysage : z-index 10 (avant-plan)
```

## 📝 **Notes de Maintenance**

### **Règles à respecter :**
1. **Ne jamais modifier** les z-index sans consulter ce document
2. **Respecter la hiérarchie** : Paysage (10) > Nuages (9) > Lune (8) > Étoiles (7) > Dégradé (0)
3. **Cohérence** : Tous les éléments d'un même type doivent avoir le même z-index
4. **Documentation** : Toute modification doit être documentée ici

### **Éléments spéciaux :**
- **Soleil** : À placer dans AstronomicalLayer avec z-index 8 (même niveau que la lune)
- **Nouveaux éléments astronomiques** : z-index 7-8 selon leur importance
- **Nouveaux éléments météorologiques** : z-index 9

---

**Créé le :** 2025-08-09  
**Dernière mise à jour :** 2025-08-09  
**Auteur :** Augment Agent selon spécifications Cisco  
**Statut :** ✅ Implémenté et testé
