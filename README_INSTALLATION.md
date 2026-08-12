# MYGYM — installation sur téléphone

MYGYM est une application web installable (PWA). Une fois publiée sur une adresse HTTPS, elle peut être ajoutée à l’écran d’accueil. Les séances sont enregistrées localement et peuvent être synchronisées avec le compte Supabase de l’utilisateur.

La version 2.2.0 conserve toutes les données déjà enregistrées et ne demande aucune modification de la table Supabase. Les anciennes cibles de répétitions sont converties automatiquement vers les types Top set, Back-off ou Libre.

## Installation recommandée sur iPhone

1. Publiez le contenu du dossier sur GitHub Pages ou un autre hébergement statique HTTPS.
2. Ouvrez l’adresse obtenue dans **Safari** sur l’iPhone.
3. Touchez **Partager**, puis **Sur l’écran d’accueil**.
4. Lancez MYGYM une première fois avec une connexion. L’application fonctionne ensuite hors ligne.
5. Ouvrez **Réglages et sauvegarde** depuis le bouton en haut à droite, puis créez un compte ou connectez-vous pour activer la synchronisation entre appareils.

## Android

Ouvrez l’adresse HTTPS dans Chrome, puis utilisez **Installer l’application** ou **Ajouter à l’écran d’accueil** dans le menu du navigateur.

## Essai sur ordinateur

Depuis le dossier de l’application, lancez :

```bash
python3 -m http.server 8080
```

Ouvrez ensuite `http://localhost:8080` dans le navigateur. Le double-clic direct sur `index.html` ne permet pas de tester correctement l’installation hors ligne.

## Données et sauvegardes

- Les données sont d’abord enregistrées dans le stockage du navigateur, puis synchronisées avec Supabase lorsque l’utilisateur est connecté.
- Sans réseau, les changements restent locaux et sont envoyés au retour de la connexion.
- Utilisez régulièrement **Réglages et sauvegarde → Exporter une sauvegarde** pour créer un fichier JSON restaurable.
- La bibliothèque, les séances modèles, les programmes et les séances libres sont inclus dans la sauvegarde JSON et dans la synchronisation.
- L’export CSV est prévu pour une analyse dans Excel ou un autre tableur.
- Avant de changer de téléphone, de supprimer l’app ou d’effacer les données du navigateur, exportez une sauvegarde JSON.

Le schéma JSON interne passe en version 11 : aucune nouvelle table ni requête SQL n’est nécessaire.

## Contenu du dossier

- `index.html` : l’application complète
- `manifest.webmanifest` : informations d’installation
- `service-worker.js` : fonctionnement hors ligne
- `supabase-client.js` : connexion et synchronisation
- `icons/` : icônes de l’application
- `.nojekyll` : publication directe sur GitHub Pages
