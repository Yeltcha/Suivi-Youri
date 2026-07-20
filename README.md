# BODYSSEUS

**Forge Your Odyssey.**

Application de suivi d’entraînements de bodybuilding, installable sur téléphone et synchronisable avec Supabase.

La version 1.10.0 fiabilise la fin de séance et rend les analyses plus cohérentes :

- une séance ne peut plus être enregistrée tant qu’une série renseignée reste non validée ;
- la période statistique va de 1 à 8 semaines, avec 1 semaine par défaut, ou depuis toujours ;
- les cibles musculaires ne sont plus codées en dur : elles sont calculées depuis le programme actif et excluent les exercices W par défaut ;
- le volume-charge est présenté comme un repère de travail et séparé entre séries principales et drops ;
- le e1RM est remplacé par le meilleur poids dans une plage de répétitions comparable et une moyenne mobile sur trois passages ;
- les répétitions principales, les répétitions de drops et la proportion de séries dégressives sont distinguées.

Les tests de non-régression sont disponibles dans `tests/regression.mjs` et s’exécutent avec `node tests/regression.mjs`.

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la mise en ligne sur GitHub Pages et l’installation sur téléphone.
