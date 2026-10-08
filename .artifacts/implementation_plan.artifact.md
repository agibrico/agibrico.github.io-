# Plan d'Implémentation : Correction Complète & Sécurisation AGB vCard Studio / Smart QR

L'objectif de cette intervention est de résoudre définitivement le problème où les QR codes dynamiques créés sur smartphone affichent "fiche introuvable" lors du scan, tout en assainissant l'architecture, la sécurité, l'authentification et les règles Firestore du projet AGB vCard Studio.

---

## User Review Required

> [!IMPORTANT]
> - **Changement du mode QR Dynamique** : Les QR codes dynamiques contiendront désormais **exclusivement** une URL publique courte stable (ex: `https://DOMAINE/#q/XXXXXXXX`). Les données complètes résideront dans Firestore et la mémoire locale.
> - **Sécurisation de l'Authentification** : Tous les identifiants/mots de passe administrateur en dur (`atsegillesbrice@gmail.com`, `agibrico`, etc.) et le bypass d'auto-login administrateur sont supprimés. L'authentification s'appuie désormais uniquement sur le service Firebase Authentication officiel.
> - **Règles Cloud Firestore** : Les règles Firestore `allow create: if true` et `allow update: if true` sont supprimées. Seules les cartes marquées comme actives et publiques seront lisibles publiquement. La création et modification requièrent un utilisateur authentifié.
> - **Bouton de publication & Feedback** : Lors de la création ou modification d'une carte dans l'application, l'utilisateur saura exactement si sa carte est "Enregistrée et publiée en ligne" ou "Enregistrée localement (en attente d'Internet)".

---

## Proposed Changes

### 1. URL Publique Unique de Production & Modèle QR Dynamique
#### [MODIFY] [storage.ts](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/utils/storage.ts)
- Définir `VITE_PUBLIC_APP_URL` comme source unique d'URL de production.
- Refondre `getPublicQRUrl(publicId: string)` : elle doit retourner **systématiquement** l'URL courte pour le mode dynamique (`${PUBLIC_BASE_URL}#q/${cleanId}`), sans jamais inclure de payload `d=`.
- `encodeCardPayload` sera réservé uniquement à un mode statique/vCard offline dédié.
- Ajouter la journalisation dev structurée (`QR_SAVE_LOCAL_OK`, `QR_FIRESTORE_SAVE_START`, `QR_FIRESTORE_SAVE_OK`, `QR_FIRESTORE_SAVE_FAILED`, `QR_PUBLIC_FETCH_START`, `QR_PUBLIC_FETCH_OK`, `QR_PUBLIC_FETCH_NOT_FOUND`, `QR_PUBLIC_FETCH_FAILED`).

### 2. Fiabilité de l'Enregistrement & Publication Firestore Asynchrone
#### [MODIFY] [storage.ts](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/utils/storage.ts)
- Transformer `saveOrUpdateQRCode` en fonction `async` :
  1. Sauvegarder d'abord dans `localStorage`.
  2. Si l'utilisateur est connecté et Internet présent, effectuer `await setDoc(doc(db, 'cards', PUBLIC_ID), ...)` avec contrôle d'erreur.
  3. Effectuer une vérification post-publication via `await getDoc(doc(db, 'cards', PUBLIC_ID))` pour confirmer `snapshot.exists() === true` et `snapshot.data().publicId === PUBLIC_ID`.
  4. Retourner le statut d'exécution : `{ item, isUpdate, cloudSynced: boolean, error?: string }`.
- Transformer `fetchQRCodeByPublicId` en fonction de **STRICTE LECTURE** : supprimer tous les appels à `setDoc` ou `updateDoc`.
- Supprimer le secours 'admin_agb_001' et les alias hardcodés pour `CYR2026Z`, `ABDOUL`, `MOISE`, etc.
- Isoler `INITIAL_QR_ITEMS` et `INITIAL_CLIENTS` afin qu'ils ne soient injectés que si `import.meta.env.DEV` est actif et pas en production neuve.

#### [MODIFY] [App.tsx](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/App.tsx)
- Transformer `handleSaveQR` en fonction `async`.
- Appeler `await saveOrUpdateQRCode(item)`.
- Afficher des messages/toasts d'information clairs selon `cloudSynced` (ex: "Carte enregistrée et publiée avec succès" vs "Carte enregistrée localement, publication Cloud en attente").
- Supprimer l'appel non authentifié à `syncOfficialDataToCloud()` dans le premier `useEffect`.

### 3. Protection du Scan Public (Lecture Seule Strict)
#### [MODIFY] [PublicScannedPage.tsx](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/components/public/PublicScannedPage.tsx)
- Supprimer impérativement l'appel `saveOrUpdateQRCode(normalized, true)` lors des visites publiques.
- Corriger le parsing des paramètres URL pour les anciens QR codes : utiliser `URLSearchParams` sur `window.location.search` et `window.location.hash` au lieu de la Regex fragile `/[?&](?:d|data)=([^&SG#\s]+)/i`.

### 4. Sécurisation de l'Authentification & Firebase Web
#### [MODIFY] [AuthContext.tsx](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/context/AuthContext.tsx)
- Supprimer les identifiants hardcodés, mots de passe en clair (`agibrico`, `atsegillesbrice@gmail.com`), bypass admin et auto-login.
- Utiliser uniquement Firebase Authentication standard.

#### [MODIFY] [firebase.ts](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/src/firebase.ts)
- Vérifier que la configuration Firebase Web s'appuie sur des clés Web standard.

### 5. Règlements Cloud Firestore Sécurisés
#### [MODIFY] [firestore.rules](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/firestore.rules)
- Supprimer `allow create: if true` et `allow update: if true`.
- Activer la vérification `isPublicCard()` pour la lecture publique individuelle des cartes (`allow get: if isPublicCard() || ownsExistingDocument() || isAdmin();`).
- Restreindre la création, modification et suppression de cartes et clients aux utilisateurs authentifiés propriétaires ou administrateurs.

### 6. Pipeline CI/CD, Capacitor & Environnement Android
#### [MODIFY] [.github/workflows/firebase-hosting-merge.yml](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/.github/workflows/firebase-hosting-merge.yml)
- Injecter la variable `VITE_PUBLIC_APP_URL` lors du build (`https://agibrico.github.io/agibrico.github.io-/` ou URL Firebase Hosting choisie).
- Déployer les règles Firestore via la commande Firebase CLI / Action.

#### [NEW] [android/app/src/main/AndroidManifest.xml](file:///C:/Users/CANAAN%20SERVICES/StudioProjects/agibrico.github.io-/android/app/src/main/AndroidManifest.xml)
- Si le projet Android est synchronisé/initialisé, vérifier et inclure les permissions `<uses-permission android:name="android.permission.INTERNET" />` et `<uses-permission android:name="android.permission.CAMERA" />`.

---

## Verification Plan

### Automated Tests & Type Checking
- Exécuter `npm run typecheck` (ou `npx tsc --noEmit`) pour valider l'absence d'erreurs TypeScript.
- Exécuter `npm run build` pour confirmer que le bundle Web Vite se génère sans warning/erreur.
- Exécuter `npx cap sync android` pour synchroniser le projet Web avec la plateforme Android.
- Exécuter la compilation Android native Gradle (`./gradlew assembleDebug` sous `./android` si présent).

### Manual & Logical Verification
1. **Création & Publication** : Créer une nouvelle carte dans l'application, vérifier que le message "Carte enregistrée et publiée avec succès" s'affiche et que la carte est présente dans Firestore sous la clé `/cards/PUBLIC_ID`.
2. **Contenu du QR Code** : Vérifier que le QR code contient uniquement l'URL courte (ex: `https://.../#q/XXXXXXXX`).
3. **Scan Public Seul** : Consulter la page publique `/#q/XXXXXXXX` sans session active, vérifier que la fiche s'affiche, qu'aucun `setDoc`/`updateDoc` n'est déclenché dans Firestore, et qu'aucune donnée n'est altérée.
