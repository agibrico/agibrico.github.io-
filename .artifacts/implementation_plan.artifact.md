# Plan d'implémentation pour la compilation Mobile (Android & iOS)

Ce plan vise à répondre à votre demande de compilation d'un APK (Android) et d'une application iOS pour votre projet **AGB vCard Studio**.

## État des lieux
L'analyse du projet actuel `smart-qr-—-qr-code-intelligent(1)` montre qu'il s'agit d'une application Web développée avec **React** et **Vite**. Actuellement, il n'y a pas de configuration mobile (Flutter ou autre) dans ce dossier.

> [!NOTE]
> Bien que vous ayez mentionné **Flutter**, votre projet est techniquement basé sur **React**. La méthode la plus adaptée et performante pour transformer cette application React en APK et application iOS est d'utiliser **Capacitor** (déjà utilisé dans une autre version de votre projet). Flutter nécessiterait une réécriture complète ou un wrapper complexe, tandis que Capacitor utilise directement votre code existant.

## Changements proposés

### Configuration Mobile avec Capacitor
Nous allons intégrer Capacitor pour permettre la génération des plateformes natives.

#### [MODIFIER] [package.json](file:///C:/Users/aaaa/Downloads/smart-qr-—-qr-code-intelligent(1)/package.json)
- Ajout des dépendances Capacitor : `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`.

#### [NOUVEAU] [capacitor.config.ts](file:///C:/Users/aaaa/Downloads/smart-qr-—-qr-code-intelligent(1)/capacitor.config.ts)
- Création du fichier de configuration pour définir l'ID de l'application (`com.agb.smartqr`) et le dossier source (`dist`).

### Préparation et Compilation

1.  **Build Web** : Compilation du code React pour la production (`npm run build`).
2.  **Initialisation Mobile** : Ajout des dossiers natifs `android/` et `ios/`.
3.  **Synchronisation** : Copie des fichiers compilés vers les projets natifs.
4.  **Compilation APK** : Génération de l'APK via les outils Android.

## Questions et Précisions
> [!IMPORTANT]
> 1. **Flutter vs Capacitor** : Confirmez-vous l'utilisation de **Capacitor** (recommandé pour votre code React actuel) plutôt que Flutter ?
> 2. **Installation de Flutter** : Flutter n'est pas installé sur ce système. L'utilisation de Capacitor évitera cette installation lourde.
> 3. **Compilation iOS** : Pour compiler l'application iOS, un ordinateur macOS avec Xcode est théoriquement nécessaire. Je préparerai les fichiers, mais la compilation finale pourrait nécessiter Xcode.
> 4. **Toutes plateformes Android** : Je configurerai la compilation pour supporter toutes les architectures courantes (arm64, armv7, x86).

## Plan de vérification

### Vérification manuelle
- Vérification de la création des dossiers `android/` et `ios/`.
- Test de la commande `npx cap sync`.
- Génération d'un APK de test.
