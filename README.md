# INNERSET

**Every set builds you.**

INNERSET est un carnet d’entraînement de musculation installable sur téléphone. Il permet de construire ses programmes, d’enregistrer chaque passage et de lire sa progression sans score arbitraire ni comparaison sociale.

## Version 2.0.0

Cette version refond l’expérience autour de quatre espaces :

- **Aujourd’hui** : prochaine séance, rythme de la semaine, dernier signal utile et journal des passages ;
- **Programme** : programmes libres, séances modèles, bibliothèque personnelle et cibles de répétitions exactes ou en fourchette ;
- **Séance** : saisie rapide des charges, répétitions, RIR facultatif, séries W, drops, validation et contexte de fin de séance ;
- **Progression** : comparaison du même exercice, de la même variante de charge et de la même zone de répétitions.

Les anciennes catégories de séries restent lisibles en interne pour assurer la compatibilité avec l’historique, mais elles ne structurent plus l’interface. L’utilisateur travaille simplement série par série avec un repère de répétitions facultatif.

## Lecture de la progression

INNERSET ne calcule aucun e1RM et n’attribue aucun score global. Pour un exercice et une zone de répétitions :

- davantage de répétitions à charge identique crée un nouveau repère ;
- davantage de charge dans la même zone de répétitions crée un nouveau repère ;
- deux améliorations comparables successives confirment une progression ;
- un seul passage inférieur ne produit pas de tendance négative ;
- deux passages successifs sous les repères précédents sont affichés comme un signal à contextualiser, jamais comme un verdict.

Le volume-charge, les drops et la répartition musculaire restent disponibles dans un volet de mesures secondaires. Ils décrivent le travail saisi, pas la force ni la qualité d’une séance.

## Données et compatibilité

- Le schéma JSON reste en version 10 : aucune migration Supabase ni nouvelle table n’est nécessaire.
- Les séances enregistrées restent des instantanés indépendants du programme modèle.
- Modifier une séance en cours ne modifie pas le programme.
- Les données sont conservées localement puis synchronisées avec Supabase lorsque le compte est connecté.
- Le service worker utilise le cache `innerset-v26` pour diffuser la nouvelle interface sur GitHub Pages.

Les tests de non-régression s’exécutent avec :

```bash
node tests/regression.mjs
```

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la publication GitHub Pages et l’installation sur téléphone.
