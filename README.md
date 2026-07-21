# BODYSSEUS

**Ton assistant de progression.**

Application de suivi d’entraînements de bodybuilding, installable sur téléphone et synchronisable avec Supabase.

La version 1.11.0 pose la première brique de l’assistant de progression :

- chaque exercice d’une séance modèle peut recevoir une plage de répétitions, une cible de RIR, une charge de départ optionnelle et un incrément de charge ;
- le mode « double progression » analyse uniquement le même exercice et le même mode de charge ;
- la recommandation explique toujours l’observation et la règle utilisée : augmenter, maintenir ou réduire d’un seul incrément ;
- une hausse exige que toutes les séries comparables atteignent le haut de la plage, avec le RIR cible respecté lorsqu’il est activé ;
- une baisse n’est proposée qu’après deux passages comparables consécutifs sous la plage et trop difficiles ;
- la charge recommandée peut préremplir les séries de travail vides, sans modifier les séries W, validées ou déjà renseignées ;
- l’utilisateur peut désactiver les recommandations pour un exercice et conserver un suivi simple.

La version conserve également les sécurités et statistiques introduites en 1.10.0 :

- une séance ne peut plus être enregistrée tant qu’une série renseignée reste non validée ;
- la période statistique va de 1 à 8 semaines, avec 1 semaine par défaut, ou depuis toujours ;
- les cibles musculaires ne sont plus codées en dur : elles sont calculées depuis le programme actif et excluent les exercices W par défaut ;
- le volume-charge est présenté comme un repère de travail et séparé entre séries principales et drops ;
- le e1RM est remplacé par le meilleur poids dans une plage de répétitions comparable et une moyenne mobile sur trois passages ;
- les répétitions principales, les répétitions de drops et la proportion de séries dégressives sont distinguées.

Les tests de non-régression sont disponibles dans `tests/regression.mjs` et s’exécutent avec `node tests/regression.mjs`.

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la mise en ligne sur GitHub Pages et l’installation sur téléphone.
