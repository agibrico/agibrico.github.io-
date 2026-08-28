# Plan d'implémentation pour l'automatisation du build APK sur GitHub

Ce plan décrit comment configurer un workflow GitHub Actions pour générer automatiquement un APK de debug à chaque fois que vous poussez du code sur votre dépôt.

## Changements proposés

### GitHub Actions

#### [NEW] [android_build.yml](file:///C:/projects/smart-qr-app/.github/workflows/android_build.yml)
Création d'un nouveau fichier de workflow qui effectue les étapes suivantes :
1.  Récupération du code source.
2.  Configuration de l'environnement Java (JDK 17).
3.  Configuration de Node.js (version 20).
4.  Installation des dépendances npm.
5.  Compilation de l'application web (Vite).
6.  Synchronisation avec Capacitor pour mettre à jour le projet Android.
7.  Compilation de l'APK de debug via Gradle.
8.  Téléchargement de l'APK en tant qu'artefact GitHub.

## Plan de vérification

### Vérification manuelle
1.  Une fois le fichier créé et poussé sur GitHub, allez dans l'onglet **Actions** de votre dépôt GitHub.
2.  Vérifiez que le workflow "Build Android APK" se lance.
3.  Une fois terminé, vérifiez qu'un artefact nommé `app-debug` est disponible au téléchargement.
