# MYGYM

MYGYM est un carnet d’entraînement de musculation installable sur téléphone. Il permet de créer des programmes, d’enregistrer des séances planifiées ou libres et de consulter des statistiques fondées sur les données réellement saisies.

## Version 2.1.0

L’application comprend quatre espaces :

- **Aujourd’hui** : prochaine séance, activité de la semaine et journal repliable ;
- **Programme** : programmes libres, séances modèles, bibliothèque personnelle et cibles de répétitions exactes ou en fourchette ;
- **Séance** : choix d’une séance planifiée ou démarrage d’une séance libre, puis saisie des charges, répétitions, RIR facultatif, séries W, drops et ressenti ;
- **Progression** : statistiques globales, comparaison par exercice et suivi prévu/réalisé du programme actif.

Une séance libre démarre sans exercice. Les exercices ajoutés pendant cette séance utilisent la bibliothèque personnelle, mais ne modifient aucun programme.

## Calcul de la progression

Pour un exercice et une zone de répétitions comparables :

- davantage de répétitions à charge identique indique une hausse ;
- davantage de charge dans la même zone de répétitions indique une hausse ;
- deux hausses comparables successives sont distinguées d’une hausse isolée ;
- une baisse isolée est distinguée de deux baisses comparables successives.

Le volume-charge correspond à la somme des charges effectives multipliées par les répétitions. Les séries principales et les drops restent séparés dans les statistiques.

## Données et compatibilité

- Le schéma JSON reste en version 10 : aucune migration Supabase ni nouvelle table n’est nécessaire.
- Les séances enregistrées restent des instantanés indépendants du programme modèle.
- Modifier une séance en cours ne modifie pas le programme.
- Les données sont conservées localement puis synchronisées avec Supabase lorsque le compte est connecté.
- Le service worker utilise le cache `mygym-v27`.

Les tests de non-régression s’exécutent avec :

```bash
node tests/regression.mjs
```

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la publication GitHub Pages et l’installation sur téléphone.
