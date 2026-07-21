# BODYSSEUS

**Ton assistant de progression.**

Application de suivi d’entraînements de bodybuilding, installable sur téléphone et synchronisable avec Supabase.

La version 1.12.0 transforme l’assistant en système personnalisé et plus intuitif :

- un profil pratiquant définit l’objectif, l’expérience, le style d’effort et l’utilisation souhaitée de l’échec ;
- le profil initial privilégie la prise de muscle, la haute intensité et une dernière série à l’échec ;
- les exercices utilisent automatiquement ce profil, avec une personnalisation facultative uniquement lorsque cela est utile ;
- les anciennes cibles rigides de répétitions et de RIR disparaissent au profit de garde-fous larges qui ne sont pas des objectifs ;
- l’assistant compare la charge, les répétitions, le RIR et la manière dont la série s’est terminée sur la même variante d’exercice ;
- une amélioration réelle à charge et effort comparables peut déclencher une hausse d’un palier ;
- après chaque série validée, l’app peut maintenir, augmenter ou réduire la charge de la prochaine série ;
- le bouton « Valider à l’échec » enregistre automatiquement un RIR 0, tandis qu’une gêne reste distinguée d’un échec musculaire ;
- les statistiques affichent l’alignement avec le profil, les fins de série à l’échec et la qualité du suivi de l’effort ;
- une série de semaines régulières encourage la discipline sans comparaison entre utilisateurs.

La version conserve également les sécurités et statistiques précédentes :

- une séance ne peut plus être enregistrée tant qu’une série renseignée reste non validée ;
- la période statistique va de 1 à 8 semaines, avec 1 semaine par défaut, ou depuis toujours ;
- les cibles musculaires ne sont plus codées en dur : elles sont calculées depuis le programme actif et excluent les exercices W par défaut ;
- le volume-charge est présenté comme un repère de travail et séparé entre séries principales et drops ;
- le e1RM est remplacé par le meilleur poids dans une plage de répétitions comparable et une moyenne mobile sur trois passages ;
- les répétitions principales, les répétitions de drops et la proportion de séries dégressives sont distinguées.

Les tests de non-régression sont disponibles dans `tests/regression.mjs` et s’exécutent avec `node tests/regression.mjs`.

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la mise en ligne sur GitHub Pages et l’installation sur téléphone.
