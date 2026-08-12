# MYGYM

MYGYM est un carnet d’entraînement de musculation installable sur téléphone. Il permet de créer des programmes, d’enregistrer des séances planifiées ou libres et de consulter des statistiques fondées sur les données réellement saisies.

## Version 2.2.0

La version 2.2.0 remplace les cibles de répétitions personnalisées par un type défini pour chaque série :

- **Top set** : travail lourd entre 4 et 6 répétitions ;
- **Back-off** : charge réduite entre 8 et 12 répétitions ;
- **Libre** : aucune plage de répétitions imposée.

Lorsqu’un exercice comporte trois séries, MYGYM propose par défaut deux Top sets puis un Back-off. Ce choix est modifiable série par série dans le programme et pendant la séance, jusqu’à la validation de la série. Les séries W restent exclues de cette logique.

L’application comprend quatre espaces :

- **Aujourd’hui** : prochaine séance, activité de la semaine et journal repliable ;
- **Programme** : programmes libres, séances modèles, bibliothèque personnelle et configuration du type de chaque série ;
- **Séance** : choix d’une séance planifiée ou démarrage d’une séance libre, puis saisie du type de série, des charges, répétitions, RIR facultatif, séries W, drops et ressenti ;
- **Progression** : statistiques globales, comparaison par exercice et par type de série, puis suivi prévu/réalisé du programme actif.

Une séance libre démarre sans exercice. Les exercices ajoutés pendant cette séance utilisent la bibliothèque personnelle, mais ne modifient aucun programme.

## Calcul de la progression

Pour un exercice, un type de série et une zone de répétitions réellement effectuée comparables :

- davantage de répétitions à charge identique indique une hausse ;
- davantage de charge dans la même zone de répétitions indique une hausse ;
- deux hausses comparables successives sont distinguées d’une hausse isolée ;
- une baisse isolée est distinguée de deux baisses comparables successives.

Le volume-charge correspond à la somme des charges effectives multipliées par les répétitions. Les séries principales et les drops restent séparés dans les statistiques.

Les Top sets, Back-off et séries libres ne sont jamais mélangés dans une comparaison de progression. Une synthèse secondaire affiche aussi, pour chaque type, le nombre de séries, les répétitions moyennes et le volume-charge enregistré.

## Données et compatibilité

- Le schéma JSON passe en version 11 : aucune migration Supabase ni nouvelle table n’est nécessaire, car Supabase synchronise toujours le même document JSON.
- Les anciennes cibles de répétitions sont converties automatiquement en Top set, Back-off ou Libre, puis retirées du document normalisé.
- Les séances enregistrées restent des instantanés indépendants du programme modèle.
- Modifier une séance en cours ne modifie pas le programme.
- Les données sont conservées localement puis synchronisées avec Supabase lorsque le compte est connecté.
- Le service worker utilise le cache `mygym-v29`.

Les tests de non-régression s’exécutent avec :

```bash
node tests/regression.mjs
```

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la publication GitHub Pages et l’installation sur téléphone.
