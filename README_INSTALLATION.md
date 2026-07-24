# INNERSET — installation sur téléphone

INNERSET — **Every set builds you.** — est une application web installable (PWA). Elle ne demande ni abonnement ni application supplémentaire une fois mise en ligne. Les séances sont enregistrées localement et peuvent être synchronisées avec le compte Supabase de l’utilisateur.

La version 1.14.1 intègre le nouveau monogramme INNERSET dans l’en-tête et renouvelle les icônes d’installation. Elle conserve les intentions de séries lourdes, back-off et libres, les repères souples par série, la validation neutre, les comparaisons statistiques séparées par rôle et toutes les données déjà enregistrées.

## Installation recommandée sur iPhone

Safari exige que l’application soit ouverte depuis une adresse web sécurisée (`https://`) pour l’installation et le fonctionnement hors ligne. Ouvrir directement `index.html` depuis l’app Fichiers ne suffit donc pas.

1. Décompressez le dossier puis placez son contenu sur un hébergement statique HTTPS. Votre hébergement OVH, GitHub Pages ou un hébergeur statique similaire convient : aucun serveur ni aucune base de données ne sont nécessaires.
2. Ouvrez l’adresse obtenue dans **Safari** sur l’iPhone.
3. Touchez **Partager**, puis **Sur l’écran d’accueil** et validez l’ouverture comme app web.
4. Lancez INNERSET une première fois avec une connexion. Ensuite, l’application et tes séances restent disponibles hors ligne.
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

La bibliothèque, les programmes libres, les structures de séries, les réglages RIR et W, l’état de validation, les ressentis et les séances historiques utilisent la ligne `training_state` déjà créée dans Supabase. La version 1.14.1 conserve le schéma JSON interne en version 10 : aucune nouvelle table ni nouvelle requête SQL n’est nécessaire.

## Contenu du dossier

- `index.html` : l’application complète
- `manifest.webmanifest` : informations d’installation
- `service-worker.js` : fonctionnement hors ligne
- `supabase-client.js` : client local de connexion et de synchronisation
- `icons/` : icônes de l’application
- `.nojekyll` : publication directe et fiable sur GitHub Pages
