# 🎣 Piscari 3x3 Web

Une version web interactive du jeu de stratégie Piscari 3x3, développée avec React, TypeScript et Tailwind CSS.

## 🎮 À propos du jeu

Le jeu de Piscari (ou jeu de la pêche) est un jeu de stratégie qui se joue sur un damier 3x3 et ressemble au tic-tac-toe, mais combine hasard et stratégie avec un système de boucle alimentaire unique.

### Règles du jeu
- **Objectif** : Aligner trois icônes identiques (pêcheurs, poissons ou mouches) de la même couleur
- **Boucle alimentaire** :
  - Le pêcheur attrape le poisson 🎣 → 🐟
  - Le poisson mange la mouche 🐟 → 🪰
  - La mouche pique le pêcheur 🪰 → 🎣

## ✨ Fonctionnalités

- 🎲 **Système de dés** avec animations et sons
- 🧙‍♂️ **IA des magiciens** (Merlin et Gandalf) avec stratégie avancée
- 🌍 **Support multilingue** (Français/Anglais)
- 📱 **Design responsive** (desktop, tablette, mobile)
- 🎨 **Interface Comic Sans** selon les spécifications
- 🔊 **Effets sonores** immersifs
- ⚡ **Animations fluides** avec Framer Motion

## 🚀 Technologies utilisées

- **Frontend** : React 18+ avec TypeScript
- **Styling** : Tailwind CSS avec configuration personnalisée
- **State Management** : Zustand
- **Animations** : Framer Motion
- **Internationalisation** : react-i18next
- **Build Tool** : Vite
- **Audio** : Web Audio API avec fallback HTML5

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── game/           # Composants spécifiques au jeu
│   ├── layout/         # Composants de mise en page
│   ├── pages/          # Pages principales
│   └── ui/             # Composants UI réutilisables
├── hooks/              # Hooks personnalisés
├── i18n/               # Configuration et traductions
├── services/           # Services (AI, Audio, Assets)
├── store/              # Gestion d'état Zustand
├── types/              # Types TypeScript
└── utils/              # Utilitaires et constantes
```

## 🎯 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd piscari-web

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Scripts disponibles
```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm run preview  # Aperçu du build de production
npm run lint     # Vérification du code
```

## 🎨 Assets requis

L'application nécessite les fichiers multimédias suivants dans `public/assets/` :

### Images (PNG/GIF)
- Dés : `de_bleu_fixe.png`, `de_rouge_fixe.png`, `de_bleu_anime.gif`, `de_rouge_anime.gif`
- Magiciens : `Merlin_bleu_fixe.png`, `Gandalf_rouge_fixe.png`, `Merlin_bleu_anime.gif`, `Gandalf_rouge_anime.gif`
- Icônes : `pecheur_[couleur]_[type].png/gif`, `poisson_[couleur]_[type].png/gif`, `mouche_[couleur]_[type].png/gif`
- Effets : `confettis.gif`

### Sons (MP3)
- `roulement_du_de.mp3`
- `pecheur.mp3`, `poisson.mp3`, `mouche.mp3`
- `victoire.mp3`

### Données
- `etats.json` : Table des états pour l'IA

## 🧠 Intelligence Artificielle

L'IA des magiciens utilise :
- **Calcul des gains** basé sur la table des états (`etats.json`)
- **Évaluation des lignes** (colonnes, rangées, diagonales)
- **Sélection optimale** avec choix aléatoire en cas d'égalité
- **Deux modes** : jeu automatique ou suggestion

## 🌐 Internationalisation

- **Langues supportées** : Français (par défaut), Anglais
- **Fichiers de traduction** : `src/i18n/locales/fr.json`, `en.json`
- **Changement dynamique** de langue
- **Persistance** du choix utilisateur

## 📱 Responsive Design

- **Aspect ratios** : 16:9 à 4:3 pour écrans horizontaux
- **Écrans verticaux** : Réorganisation automatique de l'interface
- **Breakpoints** : Mobile, tablette, desktop
- **Police** : Comic Sans MS partout

## 🎵 Système Audio

- **Web Audio API** avec fallback HTML5 Audio
- **Préchargement** des sons
- **Gestion des erreurs** gracieuse
- **Contrôles** volume et activation/désactivation

## 🔧 Configuration

### Tailwind CSS
Configuration personnalisée avec :
- Police Comic Sans MS
- Aspect ratios de jeu
- Animations personnalisées
- Couleurs du thème

### Vite
Optimisations pour :
- Chargement rapide des assets
- Code splitting automatique
- Hot Module Replacement

## 📊 Performance

- **Préchargement** des assets multimédias
- **Memoization** des calculs IA coûteux
- **Lazy loading** des composants non critiques
- **Optimisation** des re-renders React

## 🐛 Débogage

### Mode développement
- Logs détaillés de l'IA
- Monitoring des performances
- Analyse de la mémoire
- Coordonnées des cellules visibles

### Outils
- React DevTools
- Performance Monitor intégré
- Logs de chargement des assets

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Fichiers générés
- `dist/` : Fichiers optimisés pour la production
- Assets minifiés et compressés
- Code splitting automatique

### Hébergement
Compatible avec :
- Netlify, Vercel, GitHub Pages
- Serveurs statiques (Apache, Nginx)
- CDN (CloudFlare, AWS CloudFront)

## 📝 Licence

Ce projet est développé selon les spécifications du cahier des charges Piscari 3x3.

## 🤝 Contribution

Le projet suit une architecture modulaire facilitant :
- Ajout de nouvelles langues
- Modification des règles de jeu
- Extension de l'IA
- Personnalisation de l'interface

---

**Développé avec ❤️ et Comic Sans MS** 🎨