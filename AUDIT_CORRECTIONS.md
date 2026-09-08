# Audit et corrections — AGB vCard Studio

Date : 8 septembre 2026

## Corrections appliquées

### Données et logique métier
- Suppression de l'enregistrement Firestore/localStorage à chaque frappe dans l'éditeur : une fiche est désormais persistée uniquement lors de l'action explicite **Enregistrer**.
- Conservation des métadonnées d'une carte lors de l'édition/création depuis un client ou un modèle (`clientId`, `cardNumber`, `modelId`, `cardFormat`, etc.).
- Correction du filtre « cartes du client » : l'action affiche maintenant réellement uniquement les cartes du client choisi.
- Suppression des migrations codées en dur qui pouvaient supprimer des fiches réelles portant certains noms.
- Déduplication des clients par identifiant stable et non plus par nom complet : deux homonymes peuvent désormais coexister.
- Suppression des statistiques de scans aléatoires de démonstration ; les statistiques locales ne contiennent plus de faux scans.
- Réinitialisation locale ciblée : l'application ne fait plus `localStorage.clear()` et ne supprime donc plus les données d'autres applications du même domaine.
- Normalisation des timestamps Firestore vers des chaînes ISO, y compris `expiresAt`.
- Génération des identifiants publics avec `crypto.getRandomValues()` lorsque disponible.

### Firebase / Firestore
- Alignement des règles Firestore sur le vrai statut applicatif `active` tout en gardant la compatibilité avec l'ancien statut `PUBLISHED`.
- Ajout des règles pour la collection `clients`.
- Ajout d'un contrôle de propriété (`userId`) pour les lectures/écritures privées.
- Ajout d'une règle publique strictement limitée à l'incrément atomique de `scanCount` et `lastScannedAt`.
- Synchronisation filtrée par utilisateur : un compte ne récupère ni ne revendique les données déjà rattachées à un autre compte.
- Correction du conflit local/cloud : une version serveur plus ancienne n'écrase plus automatiquement une version locale plus récente.
- Suppression de la synchronisation « officielle » avant authentification ; elle est maintenant lancée dans le bon cycle utilisateur.
- Les données de démonstration locales ne masquent plus une version Firestore plus récente lors d'un scan public.
- Les fiches marquées privées/masquées ne sont plus considérées comme publiques par les règles Firestore.

### Page publique / confidentialité
- Prise en charge des routes `#q/ID`, `/q/ID`, `/c/ID` et `/card/ID`.
- Correction du cas Firebase Hosting où `/q/ID` pouvait ouvrir le tableau de bord au lieu de la fiche publique.
- Suppression du panneau de débogage caché qui pouvait afficher l'objet JSON complet d'une fiche.
- Les `internalNotes` ne sont plus copiées dans la bio publique ni exportées dans la vCard.
- Application des options `hideAddress` dans l'affichage/vCard.
- Application de `isVisible`/`isPublic` pour les sections et champs personnalisés.
- Application de la visibilité privée/masquée et de l'expiration côté page publique.
- Validation du protocole des redirections directes : seuls HTTP/HTTPS sont autorisés.
- Durcissement de plusieurs liens externes et réseaux sociaux contre les protocoles non sûrs.

### Sécurité du rendu / exports
- Suppression des constructions `innerHTML` dans l'export PDF au profit de nœuds DOM + `textContent`, afin d'éviter l'injection de HTML provenant des données de la fiche.
- Correction de l'échappement de champs supplémentaires dans les vCards.
- Correction des coordonnées GPS valides à zéro (`0`) dans la vCard.
- Correction du nettoyage du flux caméra du scanner avec une `ref`, afin d'arrêter correctement les pistes média au démontage/changement de caméra.

### Déploiement et configuration
- Initialisation Firebase typée et robuste ; Analytics est désormais optionnel et vérifié avec `isSupported()`.
- Message explicite lorsque Firebase n'est pas configuré dans le formulaire d'authentification.
- Workflow GitHub Actions stabilisé : Node.js 22, `npm ci`, secret de compte de service Firebase explicite, initialisation Capacitor sans masquer les erreurs.
- Suppression de la copie inutile de `google-services.json` : le projet utilise actuellement le SDK Firebase Web dans Capacitor, pas un plugin Firebase Android natif.
- Suppression des copies `google-services.json*` du livrable et ajout à `.gitignore`.
- Mise à jour du nom/version du package : `agb-vcard-studio` `1.0.0`.
- Mise à jour de la documentation et suppression du `git push --force` des instructions standards.

## Vérifications effectuées
- Analyse syntaxique de 33 fichiers TypeScript/TSX : **0 erreur de syntaxe**.
- Vérification des imports locaux : **aucun import local manquant**.
- Recherche de motifs à risque après correction : pas de `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function` ou `localStorage.clear()` dans les sources applicatives.
- Le build Vite complet n'a pas pu être exécuté jusqu'au bout dans l'environnement d'audit car l'installation npm a dépassé la fenêtre d'exécution disponible. Le workflow GitHub Actions utilise maintenant `npm ci` et exécutera le build complet lors du push.

## Limites d'architecture à traiter dans une prochaine évolution

1. **PIN et champs privés** : une fiche Firestore active reste un document publiquement lisible pour permettre le scan. Masquer un champ dans React ne suffit donc pas à le rendre secret face à quelqu'un qui lit directement Firestore. Pour une vraie confidentialité, séparer les données en documents publics/privés et vérifier le PIN côté serveur (Cloud Function / backend).
2. **Statistiques détaillées multi-appareils** : le cloud enregistre actuellement le compteur de scans, tandis que les événements détaillés (navigateur, OS, etc.) sont locaux au terminal du visiteur. Une vraie analytique centralisée nécessite une collection d'événements contrôlée côté serveur et une protection anti-abus.
3. **Images encodées en base64** : plusieurs formulaires stockent encore les images directement dans les documents. Firestore limite la taille d'un document ; pour un usage intensif, téléverser les médias dans Firebase Storage/Cloudflare et ne conserver que leurs URL dans Firestore.
