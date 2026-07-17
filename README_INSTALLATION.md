# TRAINING by Yeltcha — installation sur téléphone

TRAINING by Yeltcha est une application web installable (PWA). Elle ne demande ni compte, ni abonnement, ni application supplémentaire une fois mise en ligne. Toutes les séances restent enregistrées localement sur le téléphone.

La version 1.2.0 ajoute un compte Supabase et une synchronisation sécurisée entre appareils. L’app conserve chaque changement localement, reste utilisable sans réseau et synchronise automatiquement les données au retour de la connexion. Elle permet toujours d’ajouter un ou plusieurs drops à une série, comptés comme une seule série de travail.

## Installation recommandée sur iPhone

Safari exige que l’application soit ouverte depuis une adresse web sécurisée (`https://`) pour l’installation et le fonctionnement hors ligne. Ouvrir directement `index.html` depuis l’app Fichiers ne suffit donc pas.

1. Décompressez le dossier puis placez son contenu sur un hébergement statique HTTPS. Votre hébergement OVH, GitHub Pages ou un hébergeur statique similaire convient : aucun serveur ni aucune base de données ne sont nécessaires.
2. Ouvrez l’adresse obtenue dans **Safari** sur l’iPhone.
3. Touchez **Partager**, puis **Sur l’écran d’accueil** et validez l’ouverture comme app web.
4. Lancez TRAINING by Yeltcha une première fois avec une connexion. Ensuite, l’application et tes séances restent disponibles hors ligne.
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
- L’export CSV est prévu pour une analyse dans Excel ou un autre tableur.
- Avant de changer de téléphone, de supprimer l’app ou d’effacer les données de Safari/Chrome, exportez impérativement une sauvegarde JSON.

## Contenu du dossier

- `index.html` : l’application complète
- `manifest.webmanifest` : informations d’installation
- `service-worker.js` : fonctionnement hors ligne
- `supabase-client.js` : client local de connexion et de synchronisation
- `icons/` : icônes de l’application
- `.nojekyll` : publication directe et fiable sur GitHub Pages
