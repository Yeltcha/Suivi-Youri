# BODYSSEUS — installation sur téléphone

BODYSSEUS — **Forge Your Odyssey.** — est une application web installable (PWA). Elle ne demande ni abonnement ni application supplémentaire une fois mise en ligne. Les séances sont enregistrées localement et peuvent être synchronisées avec le compte Supabase de l’utilisateur.

La version 1.9.0 conserve les programmes libres, le RIR optionnel, les séries verrouillées après validation, les drops, la durée automatique et les statistiques de tonnage. Elle centralise l’historique complet sur l’accueil, retire les recommandations générales d’échauffement des séances modèles et applique la palette « Bronze homérique ». Le logo BODYSSEUS renvoie à l’accueil ; s’il reste des saisies non validées dans une séance ou des changements non confirmés dans l’éditeur de séance modèle, un choix de conservation ou d’abandon est proposé avant le départ. Les icônes PWA nécessaires au cache hors ligne et à l’installation sont incluses.

## Installation recommandée sur iPhone

Safari exige que l’application soit ouverte depuis une adresse web sécurisée (`https://`) pour l’installation et le fonctionnement hors ligne. Ouvrir directement `index.html` depuis l’app Fichiers ne suffit donc pas.

1. Décompressez le dossier puis placez son contenu sur un hébergement statique HTTPS. Votre hébergement OVH, GitHub Pages ou un hébergeur statique similaire convient : aucun serveur ni aucune base de données ne sont nécessaires.
2. Ouvrez l’adresse obtenue dans **Safari** sur l’iPhone.
3. Touchez **Partager**, puis **Sur l’écran d’accueil** et validez l’ouverture comme app web.
4. Lancez BODYSSEUS une première fois avec une connexion. Ensuite, l’application et tes séances restent disponibles hors ligne.
5. Dans **Données**, crée ton compte ou connecte-toi pour activer la synchronisation entre appareils.

## Android

Ouvrez l’adresse HTTPS dans Chrome, puis utilisez **Installer l’application** ou **Ajouter à l’écran d’accueil** dans le menu du navigateur.

## Essai sur ordinateur

Depuis le dossier de l’application, vous pouvez lancer un petit serveur local :

```bash
python3 -m http.server 8080
```

Ouvrez ensuite `http://localhost:8080` dans votre navigateur. Le double-clic direct sur `index.html` permet une prévisualisation, mais pas de tester correctement l’installation hors ligne.

## Données et sauvegardes

- Les données sont d’abord enregistrées dans le stockage du navigateur, puis synchronisées avec le compte Supabase lorsque l’utilisateur est connecté.
- Sans réseau, les changements restent locaux et sont envoyés automatiquement au retour de la connexion.
- Utilisez régulièrement **Données → Exporter une sauvegarde** pour créer un fichier JSON restaurable.
- La bibliothèque, les séances modèles et les programmes sont inclus dans cette sauvegarde JSON et dans la synchronisation Supabase.
- L’export CSV est prévu pour une analyse dans Excel ou un autre tableur.
- Avant de changer de téléphone, de supprimer l’app ou d’effacer les données de Safari/Chrome, exportez impérativement une sauvegarde JSON.

La bibliothèque, les programmes libres, le réglage RIR, l’état de validation des séries et les séances historiques utilisent la ligne `training_state` déjà créée dans Supabase. La version 1.9.0 conserve le schéma de données en version 5 : aucune nouvelle table ni nouvelle requête SQL n’est nécessaire pour cette mise à jour.

## Contenu du dossier

- `index.html` : l’application complète
- `manifest.webmanifest` : informations d’installation
- `service-worker.js` : fonctionnement hors ligne
- `supabase-client.js` : client local de connexion et de synchronisation
- `icons/` : icônes de l’application
- `.nojekyll` : publication directe et fiable sur GitHub Pages
