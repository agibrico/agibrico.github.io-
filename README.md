# AGB vCard Studio — Production de Cartes de Visite Connectées

Application professionnelle de conception, gestion de fiches vCard 3.0 interactives, génération de QR codes dynamiques et impression haute définition de cartes de visite physiques (85×55 mm & planches A4).

---

## 🚀 Déploiement sur GitHub Pages (https://github.com/agibrico/agibrico.github.io-)

L'application est 100% configurée pour être hébergée gratuitement et automatiquement sur **GitHub Pages**.

### Étape 1 : Initialiser et lier votre dépôt local à GitHub

Ouvrez votre terminal dans le dossier du projet et exécutez les commandes suivantes :

```bash
# 1. Initialiser git si ce n'est pas déjà fait
git init

# 2. Ajouter tous les fichiers du projet
git add .

# 3. Créer le commit initial
git commit -m "Déploiement initial AGB vCard Studio pour GitHub Pages"

# 4. Définir la branche principale
git branch -M main

# 5. Ajouter votre dépôt GitHub distant
git remote add origin https://github.com/agibrico/agibrico.github.io-.git

# 6. Pousser le code vers GitHub
git push -u origin main --force
```

---

### Étape 2 : Activer GitHub Pages dans les paramètres du dépôt GitHub

1. Rendez-vous sur votre dépôt : [https://github.com/agibrico/agibrico.github.io-](https://github.com/agibrico/agibrico.github.io-)
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans le menu de gauche, cliquez sur **Pages** (sous la section *Code and automation*).
4. Sous **Build and deployment** > **Source** :
   - Sélectionnez **GitHub Actions**.
5. C'est tout ! Le workflow GitHub Actions automatique (`.github/workflows/deploy.yml`) va automatiquement compiler et publier l'application.

---

### 🌐 URL de l'Application en Ligne

Une fois le déploiement terminé (environ 1 minute) :
- **Application Web & Tableau de Bord :** `https://agibrico.github.io/agibrico.github.io-/`
- **Fiches publiques scannées par les clients :** `https://agibrico.github.io/agibrico.github.io-/#q/[ID_PUBLIC]`

---

## 🛠️ Développement Local

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

---

## ✨ Fonctionnalités Incluses

- 📇 **Gestion complète des clients & entreprises** (coordonnées, téléphones d'urgence, WhatsApp, emails, réseaux sociaux, services, photos & logos).
- 🔄 **Mise à jour dynamique en temps réel** : les informations de la carte physique imprimée sont modifiables à tout moment sans réimprimer le QR code.
- 🖨️ **Studio d'Impression & Export PDF HD** : Téléchargement PDF Recto / Verso 85×55 mm et planches A4 haute définition directement sur mobile et ordinateur.
- 📱 **Simulateur Mobile Intégré** : Prévisualisation immédiate de ce que verra le client lorsqu'il scannera la carte physique avec son smartphone.
- 📱 **Projet Android Studio Kotlin inclus** : Architecture MVVM complète, Room Database, ZXing et impression PDF native.
- 💾 **Sauvegarde & Restauration JSON** : Export et import instantané de toutes vos données clients et cartes.
