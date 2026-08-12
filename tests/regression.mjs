import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(directory, "..", "index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(directory, "..", "service-worker.js"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(directory, "..", "manifest.webmanifest"), "utf8"));
assert.match(html, /const APP_VERSION = "2\.2\.0"/, "La version visible doit correspondre à MYGYM 2.2.0.");
assert.doesNotMatch(html, /brand-mark|logo-transparent/, "L’en-tête ne doit plus afficher ni charger de logo.");
assert.doesNotMatch(serviceWorker, /logo-transparent/, "Le cache PWA ne doit plus charger l’ancien logo.");
assert.match(serviceWorker, /const CACHE_NAME = "mygym-v29"/, "Le cache PWA doit être renouvelé pour diffuser MYGYM.");
assert.match(html, /\.program-grid \{ display: grid; gap: 16px; align-items: start; \}/, "Les cartes d’entraînement doivent garder un espacement net.");
assert.match(html, /\.program-card \{ align-self: start;/, "Chaque entraînement doit conserver sa propre hauteur dans la grille desktop.");
assert.equal((html.match(/class="nav-btn"/g) || []).length, 4, "La navigation principale doit se limiter à quatre destinations.");
assert.match(html, />Aujourd’hui<.*>Programme<.*>Séance<.*>Progression</s, "La navigation V2 doit suivre le parcours du carnet.");
assert.match(html, /--bg: #090B0F/, "La direction visuelle doit utiliser un fond sombre.");
assert.match(html, /--accent: #FF6840/, "La direction visuelle doit utiliser l’accent orange signalétique.");
assert.match(html, /color-scheme: dark;/, "L’application doit forcer le thème sombre.");
assert.equal(manifest.background_color, "#090B0F", "L’écran de lancement PWA doit rester sombre.");
assert.equal(manifest.theme_color, "#090B0F", "La barre système PWA doit rester sombre.");
assert.match(html, />MYGYM</, "Le nom visible doit être MYGYM.");
assert.doesNotMatch(html, /Every set builds you|Des preuves, pas un score|Ton cadre, pas une méthode imposée/, "Les slogans doivent être absents de l’interface.");
assert.match(html, /let statsDays = 0;/, "La période statistique par défaut doit être Depuis toujours.");
const scriptStart = html.indexOf("<script>\n    (() =>");
const scriptEnd = html.indexOf("</script>", scriptStart);
assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, "Le script principal doit être présent.");

const element = () => ({
  addEventListener() {},
  appendChild() {},
  classList: { add() {}, remove() {}, toggle() {} },
  close() { this.open = false; },
  focus() {},
  querySelector() { return element(); },
  querySelectorAll() { return []; },
  remove() {},
  reset() {},
  scrollIntoView() {},
  select() {},
  setAttribute() {},
  showModal() { this.open = true; },
  style: {},
  textContent: "",
  value: ""
});

const root = element();
const storage = new Map();
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.document = {
  body: element(),
  createElement: element,
  getElementById() { return root; }
};
globalThis.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  removeItem(key) { storage.delete(key); },
  setItem(key, value) { storage.set(key, String(value)); }
};
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { onLine: true, standalone: false, userAgent: "Node" } });
globalThis.location = { protocol: "file:" };
globalThis.requestAnimationFrame = callback => callback();
globalThis.scrollTo = () => {};
globalThis.matchMedia = () => ({ matches: false });
globalThis.confirm = () => true;

let mainScript = html.slice(scriptStart + "<script>".length, scriptEnd);
mainScript = mainScript.replace(
  "      window.setInterval(updateLiveSummary, 60000);\n      render();\n      initCloud();",
  `      globalThis.__innersetTests = {
        adaptiveRecommendation,
        applyAdaptiveLoad,
        availableRepRanges,
        blankSessionFeedback,
        createDraft,
        createFreeDraft,
        defaultSetPlan,
        defaultState,
        exerciseProgressEvidence,
        exerciseProgressOverview,
        exerciseComparableProgress,
        exerciseAdaptivePassages,
        effortTrackingSummary,
        failureExpectedForSet,
        finishWorkout,
        getState: () => state,
        muscleComparisonRows,
        normalizeAdaptiveSettings,
        normalizePractitionerProfile,
        normalizeSetPlan,
        normalizeSessionFeedback,
        programMuscleTargets,
        renderData,
        renderHome,
        renderProgram,
        renderSessionDetail,
        renderStats,
        renderTemplateExerciseRow,
        renderTrackedExercise,
        renderWorkout,
        roleWorkSummary,
        sessionDropReps,
        sessionDropTonnage,
        sessionDropSets,
        sessionMainReps,
        sessionMainTonnage,
        sessionTonnage,
        sessionWorkSets,
        setReachedFailure,
        setPlanSummary,
        setRoleBounds,
        setRoleRangeLabel,
        setState: value => { state = normalizeState(value); },
        setStatsDays: value => { statsDays = finiteNumber(value); },
        statsPeriodControl,
        subjectiveFeedbackSummary,
        unvalidatedEnteredSets,
        updateDraftFeedback,
        lineChart,
        volumeCompositionChart
      };`
);
assert.ok(mainScript.includes("globalThis.__innersetTests"), "Les points de test doivent être injectés.");
new Function(mainScript)();

const api = globalThis.__innersetTests;
assert.ok(api, "L’API de test doit être disponible.");

const library = [
  { id: "press", name: "Press", muscle: "chest", loadType: "total" },
  { id: "warmup", name: "Warm-up", muscle: "chest", loadType: "total", warmupDefault: true },
  { id: "row", name: "Row", muscle: "back", loadType: "total" }
];
const baseState = {
  ...api.defaultState(),
  exerciseLibrary: library,
  workoutTemplates: [
    {
      id: "template-a",
      name: "A",
      exercises: [
        { libraryExerciseId: "press", plannedSets: 3, order: 1 },
        { libraryExerciseId: "warmup", plannedSets: 2, warmupDefault: true, order: 2 }
      ]
    },
    { id: "template-b", name: "B", exercises: [{ libraryExerciseId: "row", plannedSets: 4, order: 1 }] }
  ],
  programs: [{ id: "program", name: "Programme", workoutTemplateIds: ["template-a", "template-b"] }],
  activeProgramId: "program",
  sessions: [],
  draft: null
};
assert.equal(api.defaultState().version, 11, "Le schéma des types fixes de séries doit incrémenter la version des données.");
assert.deepEqual(api.defaultSetPlan(3), [
  { role: "heavy" },
  { role: "heavy" },
  { role: "backoff" }
], "Le profil par défaut doit créer deux séries lourdes puis un back-off.");
assert.deepEqual(api.defaultSetPlan(2), [{ role: "heavy" }, { role: "backoff" }], "Deux séries doivent proposer un Top set puis un Back-off.");
assert.deepEqual(api.defaultSetPlan(2, true), [{ role: "free" }, { role: "free" }], "Les séries W ne doivent recevoir aucun type de travail.");
assert.deepEqual(api.setRoleBounds("heavy"), { min: 4, max: 6, isRange: true });
assert.deepEqual(api.setRoleBounds("backoff"), { min: 8, max: 12, isRange: true });
assert.equal(api.setRoleBounds("free"), null);
assert.equal(api.setRoleRangeLabel("heavy"), "4–6 reps");
assert.equal(api.setRoleRangeLabel("backoff"), "8–12 reps");
assert.equal(api.setRoleRangeLabel("free"), "sans plage imposée");
assert.deepEqual(api.blankSessionFeedback(), {
  schemaVersion: 2,
  difficulty: "",
  energy: "",
  performance: "",
  pump: "",
  painImpact: "",
  painArea: "",
  painNote: ""
}, "Aucun ressenti ne doit être présélectionné.");
assert.deepEqual(api.normalizeSessionFeedback({ effort: 8, energy: 3, performance: 3, pump: 3, pain: 0 }), {
  schemaVersion: 1,
  effort: 8,
  energy: 3,
  performance: 3,
  pump: 3,
  pain: 0
}, "Les anciennes évaluations numériques doivent rester lisibles sans être converties silencieusement.");
assert.deepEqual(api.normalizeSessionFeedback({ schemaVersion: 2, difficulty: "hard", energy: "low", performance: "above", pump: "high", painImpact: "none", painArea: "Épaule", painNote: "À surveiller" }), {
  schemaVersion: 2,
  difficulty: "hard",
  energy: "low",
  performance: "above",
  pump: "high",
  painImpact: "none",
  painArea: "",
  painNote: ""
}, "Une absence de gêne ne doit conserver aucune zone ou note obsolète.");
api.setState(baseState);
assert.deepEqual(api.programMuscleTargets(), { chest: 3, back: 4 }, "Les cibles doivent venir du programme et exclure W.");
assert.match(api.renderWorkout(), /data-action="start-free-session"/, "L’onglet Séance doit proposer une séance libre.");
api.createFreeDraft();
assert.equal(api.getState().draft.name, "Séance libre");
assert.equal(api.getState().draft.programId, "", "Une séance libre ne doit dépendre d’aucun programme.");
assert.deepEqual(api.getState().draft.exercises, [], "Une séance libre doit démarrer sans exercice.");
assert.match(api.renderWorkout(), /Nom de la séance/);
assert.match(api.renderWorkout(), /Ajouter depuis la bibliothèque/);
assert.match(api.renderWorkout(), /Créer un nouvel exercice/);
api.setState(baseState);
const editedProgramState = structuredClone(baseState);
editedProgramState.workoutTemplates[0].exercises[0].plannedSets = 5;
api.setState(editedProgramState);
assert.deepEqual(api.programMuscleTargets(), { chest: 5, back: 4 }, "Modifier les séries du programme doit recalculer sa cible.");

const rangeProgramState = structuredClone(baseState);
rangeProgramState.workoutTemplates[0].exercises[0].setPlan = [
  { role: "heavy", repAnchor: "5-7" },
  { role: "heavy", repAnchor: "5-7" },
  { role: "backoff", repAnchor: "8-10" }
];
api.setState(rangeProgramState);
api.createDraft("template-a");
assert.deepEqual(api.getState().draft.exercises[0].sets.map(set => set.role), ["heavy", "heavy", "backoff"], "Les anciennes ranges doivent être converties en types de séries.");
assert.ok(api.getState().draft.exercises[0].sets.every(set => !Object.hasOwn(set, "repAnchor")), "Les anciennes cibles ne doivent plus être propagées dans une séance.");
api.setState(baseState);

const stateWithDraft = structuredClone(baseState);
stateWithDraft.draft = {
  id: "draft",
  programId: "template-a",
  name: "A",
  date: "2026-07-20",
  startedAt: "2026-07-20T10:00:00.000Z",
  feedback: {},
  exercises: [{
    id: "press",
    name: "Press",
    muscle: "chest",
    loadType: "total",
    sets: [
      { id: "set-1", weight: "100", reps: "8", validated: false, warmup: false, drops: [] },
      { id: "set-2", weight: "", reps: "", validated: false, warmup: false, drops: [] }
    ]
  }]
};
api.setState(stateWithDraft);
const blankFeedbackWorkoutHtml = api.renderWorkout();
assert.match(blankFeedbackWorkoutHtml, /Fin de séance/);
assert.match(blankFeedbackWorkoutHtml, /Ressenti et commentaires/);
assert.match(blankFeedbackWorkoutHtml, /Énergie disponible/);
assert.match(blankFeedbackWorkoutHtml, /Performance perçue/);
assert.match(blankFeedbackWorkoutHtml, /Gêne \/ douleur/);
assert.match(blankFeedbackWorkoutHtml, /Non renseigné · facultatif/);
assert.doesNotMatch(blankFeedbackWorkoutHtml, /Difficulté de la séance|Congestion|Effort global/);
const painFeedbackState = structuredClone(stateWithDraft);
painFeedbackState.draft.feedback = { schemaVersion: 2, difficulty: "hard", energy: "", performance: "", pump: "", painImpact: "modified", painArea: "Épaule droite", painNote: "Développé incliné" };
api.setState(painFeedbackState);
const painFeedbackWorkoutHtml = api.renderWorkout();
assert.match(painFeedbackWorkoutHtml, /Zone concernée/);
assert.match(painFeedbackWorkoutHtml, /Épaule droite/);
api.updateDraftFeedback("painImpact", "none");
assert.equal(api.getState().draft.feedback.painArea, "");
assert.equal(api.getState().draft.feedback.painNote, "");
api.setState(stateWithDraft);
assert.equal(api.unvalidatedEnteredSets().length, 1, "Une série renseignée non validée doit être détectée.");
api.finishWorkout();
assert.equal(api.getState().sessions.length, 0, "La fin de séance doit être bloquée tant qu’une saisie n’est pas validée.");
assert.deepEqual(api.programMuscleTargets(), { chest: 3, back: 4 }, "Le brouillon ne doit pas modifier les cibles du programme.");

const subjectiveSessions = [
  ["easy", "below", "none", ""],
  ["normal", "expected", "none", ""],
  ["normal", "expected", "present", "Épaule droite"],
  ["hard", "above", "modified", "Épaule droite"],
  ["hard", "expected", "none", ""],
  ["maximal", "above", "stopped", "Genou gauche"]
].map(([difficulty, performance, painImpact, painArea], index) => ({
  id: `feedback-${index}`,
  date: `2026-07-${String(18 + index).padStart(2, "0")}`,
  name: "Test",
  durationMin: 60,
  feedback: { schemaVersion: 2, difficulty, energy: "normal", performance, pump: "normal", painImpact, painArea, painNote: painImpact === "none" ? "" : "Contexte" },
  exercises: [{ id: "press", name: "Press", muscle: "chest", loadType: "total", sets: [{ weight: 80, reps: 8, validated: true, warmup: false, stopReason: index === 5 ? "pain" : "", drops: [] }] }]
}));
subjectiveSessions.push({ id: "legacy-feedback", date: "2026-07-17", feedback: { effort: 8, pain: 0 }, exercises: [] });
const subjectiveSummary = api.subjectiveFeedbackSummary(subjectiveSessions);
assert.equal(subjectiveSummary.baselineLabel, "Normale à difficile");
assert.equal(subjectiveSummary.trend, "harder", "La tendance doit comparer les passages récents au propre historique de l’utilisateur.");
assert.equal(subjectiveSummary.performanceOnTrack, 5);
assert.equal(subjectiveSummary.energyCount, 6);
assert.equal(subjectiveSummary.lowEnergyCount, 0);
assert.equal(subjectiveSummary.pumpCount, 6);
assert.equal(subjectiveSummary.highPumpCount, 0);
assert.equal(subjectiveSummary.painCount, 3);
assert.equal(subjectiveSummary.impactfulPainCount, 2);
assert.equal(subjectiveSummary.stoppedPainCount, 1);
assert.equal(subjectiveSummary.painAreas[0][0], "Épaule droite");
assert.equal(subjectiveSummary.painExercises[0][0], "Press");
assert.equal(subjectiveSummary.legacyCount, 1);
api.setState({ ...baseState, sessions: subjectiveSessions });
api.setStatsDays(0);
const subjectiveStatsHtml = api.renderStats();
assert.match(subjectiveStatsHtml, /Suivi de progression/);
assert.match(subjectiveStatsHtml, /Ressenti/);
assert.match(subjectiveStatsHtml, /Gêne signalée/);
assert.match(subjectiveStatsHtml, /Types de séries/);
assert.doesNotMatch(subjectiveStatsHtml, /Signaux moyens|Difficulté habituelle/);
const subjectiveDetailHtml = api.renderSessionDetail(subjectiveSessions[3]);
assert.match(subjectiveDetailHtml, /Normale · comme d’habitude/);
assert.match(subjectiveDetailHtml, /Mieux que prévu/);
assert.doesNotMatch(subjectiveDetailHtml, /Difficulté<|Congestion</);
assert.match(subjectiveDetailHtml, /Épaule droite/);
api.setStatsDays(7);
api.setState(baseState);

const exercise = {
  id: "press",
  name: "Press",
  muscle: "chest",
  loadType: "total",
  sets: [{
    id: "set",
    weight: "100",
    reps: "10",
    validated: true,
    warmup: false,
    drops: [{ id: "drop", weight: "70", reps: "5" }]
  }]
};
const session = { id: "session", date: "2026-07-20", exercises: [exercise] };
assert.equal(api.sessionWorkSets(session), 1);
assert.equal(api.sessionMainReps(session), 10);
assert.equal(api.sessionDropReps(session), 5);
assert.equal(api.sessionDropSets(session), 1);
assert.equal(api.sessionMainTonnage(session), 1000);
assert.equal(api.sessionDropTonnage(session), 350);
assert.equal(api.sessionTonnage(session), 1350);
const volumeChartHtml = api.volumeCompositionChart(1000, 350);
assert.match(volumeChartHtml, /Global/);
assert.match(volumeChartHtml, /Séries effectives/);
assert.match(volumeChartHtml, /Drops/);
assert.match(volumeChartHtml, /global 1\D?350/i);
const workloadChartHtml = api.lineChart([
  { label: "01/07", value: 1000 },
  { label: "08/07", value: 1350 }
], "kg", { ariaLabel: "Évolution du volume-charge hebdomadaire", title: "Volume-charge par semaine" });
assert.match(workloadChartHtml, /chart-line/);
assert.match(workloadChartHtml, /chart-dot/);
assert.doesNotMatch(workloadChartHtml, /chart-bar/);
assert.match(workloadChartHtml, /Évolution du volume-charge hebdomadaire/);
api.setState(baseState);
assert.doesNotMatch(api.renderHome(), /Volume musculaire/, "L’accueil ne doit plus dupliquer le bloc de volume musculaire.");
assert.doesNotMatch(api.renderHome(), /Volume-charge/, "L’accueil ne doit pas présenter le tonnage comme un indicateur de performance.");
assert.doesNotMatch(api.renderHome(), /proof-card|Progression confirmée/, "L’accueil ne doit plus afficher de bloc de progression.");
const journalState = structuredClone(baseState);
journalState.sessions = [{ id: "journal-1", date: "2026-07-20", name: "A", durationMin: 60, exercises: [] }];
api.setState(journalState);
const journalHomeHtml = api.renderHome();
assert.match(journalHomeHtml, /<details class="journal-disclosure">/, "Le journal doit être replié par défaut.");
assert.doesNotMatch(journalHomeHtml, /<details class="journal-disclosure" open/, "L’historique complet ne doit pas être ouvert par défaut.");
const bodyweightSession = {
  id: "bodyweight-session",
  date: "2026-07-20",
  exercises: [{ id: "dips", loadType: "bodyweightPlus", bodyweightKg: 80, sets: [{ weight: 20, reps: 5, validated: true, warmup: false, drops: [] }] }]
};
assert.equal(api.sessionTonnage(bodyweightSession), 500, "Le poids du corps doit rester celui mémorisé au moment de la séance.");

const progressionSessions = [
  ["s1", "2026-07-01", 80, 6],
  ["s2", "2026-07-08", 82.5, 6],
  ["s3", "2026-07-15", 85, 5],
  ["s4", "2026-07-20", 90, 3]
].map(([id, date, weight, reps]) => ({
  id,
  date,
  exercises: [{ id: "press", name: "Press", loadType: "total", sets: [{ weight, reps, role: "heavy", validated: true, warmup: false, drops: [] }] }]
}));
const ranges = api.availableRepRanges(progressionSessions, "press", "total", "heavy");
assert.equal(ranges.find(range => range.id === "4-6").passageCount, 3);
const progress = api.exerciseComparableProgress(progressionSessions, "press", "4-6", "total", "heavy");
assert.equal(progress.passages.length, 3);
assert.equal(progress.best.weight, 85);
assert.equal(progress.best.reps, 5);
assert.equal(progress.trend.at(-1).value, 82.5, "La tendance doit être la moyenne mobile des trois passages comparables.");
const evidence = api.exerciseProgressEvidence(progressionSessions, "press", "total", "4-6", "heavy");
assert.equal(evidence.status, "confirmed", "Deux améliorations comparables successives doivent confirmer la progression.");
assert.match(evidence.summary, /\+2,50 kg|\+2,5 kg/, "La comparaison doit exprimer le gain concret.");
const isolatedLowerPassage = [...progressionSessions.slice(0, 3), {
  id: "s5",
  date: "2026-07-22",
  exercises: [{ id: "press", name: "Press", loadType: "total", sets: [{ weight: 82.5, reps: 5, role: "heavy", validated: true, warmup: false, drops: [] }] }]
}];
assert.notEqual(api.exerciseProgressEvidence(isolatedLowerPassage, "press", "total", "4-6", "heavy").status, "down", "Un seul passage inférieur ne doit pas créer une tendance négative.");

api.setStatsDays(0);
const periodHtml = api.statsPeriodControl();
assert.match(periodHtml, /value="0" selected/);
for (let week = 1; week <= 8; week += 1) assert.match(periodHtml, new RegExp(`>${week} semaine`));
assert.match(periodHtml, /Depuis toujours/);

const profile = api.normalizePractitionerProfile({});
assert.equal(profile.goal, "hypertrophy");
assert.equal(profile.effortStyle, "highIntensity");
assert.deepEqual([profile.targetRirMin, profile.targetRirMax], [0, 1]);
assert.ok(!Object.hasOwn(profile, "heavyRepAnchor") && !Object.hasOwn(profile, "backoffRepAnchor"), "Le profil ne doit plus stocker de cible de répétitions.");
assert.ok(!Object.hasOwn(profile, "minRepsGuardrail") && !Object.hasOwn(profile, "maxRepsGuardrail"), "Le profil ne doit plus stocker de garde-fous de répétitions personnalisés.");
assert.equal(api.normalizeAdaptiveSettings({ progressionMode: "trackOnly" }).assistantEnabled, false, "L’ancien mode sans recommandation doit être migré.");
assert.equal(api.normalizeAdaptiveSettings({ progressionMode: "double" }).useProfileDefaults, true, "Les anciens objectifs rigides doivent migrer vers le profil.");
api.setState(baseState);
assert.match(api.renderData(), /Valeurs par défaut de l’aide de charge/);
assert.match(api.renderData(), /Top set 4–6 reps · Back-off 8–12 reps/);
assert.doesNotMatch(api.renderData(), /Profil pratiquant|Objectif principal|Expérience|Style d’effort/);

const adaptiveExercise = {
  id: "press",
  name: "Press",
  loadType: "total",
  equipmentType: "machine",
  assistantEnabled: true,
  useProfileDefaults: true,
  rirEnabled: true,
  warmupDefault: false,
  sets: []
};
const adaptiveState = structuredClone(baseState);
adaptiveState.sessions = [
  {
    id: "adaptive-old",
    date: "2026-07-10",
    exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 5, role: "heavy", rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
  },
  {
    id: "adaptive-latest",
    date: "2026-07-17",
    exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 6, role: "heavy", rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
  }
];
api.setState(adaptiveState);
const increaseRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(increaseRecommendation.kind, "increase");
assert.equal(increaseRecommendation.recommendedLoadKg, 82.5, "Une performance améliorée à charge et effort identiques doit proposer un palier.");
assert.match(increaseRecommendation.why, /passée de 5 à 6/);

const freeRepState = structuredClone(baseState);
freeRepState.sessions = [{
  id: "five-reps",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 5, role: "heavy", rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(freeRepState);
const fiveRepRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(fiveRepRecommendation.kind, "hold");
assert.equal(fiveRepRecommendation.recommendedLoadKg, 80, "Cinq répétitions à l’échec doivent rester dans la zone Top set.");

const tooHeavyState = structuredClone(baseState);
tooHeavyState.sessions = [{
  id: "too-heavy",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 3, role: "heavy", rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(tooHeavyState);
const decreaseRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(decreaseRecommendation.kind, "caution");
assert.equal(decreaseRecommendation.recommendedLoadKg, 77.5, "Un échec sous les 4 reps du Top set doit retirer un seul palier.");

const highRirState = structuredClone(baseState);
highRirState.sessions = [{
  id: "too-easy",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 6, role: "heavy", rir: 3, stopReason: "voluntary", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(highRirState);
const highRirRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(highRirRecommendation.kind, "increase");
assert.equal(highRirRecommendation.recommendedLoadKg, 82.5, "Le profil haute intensité doit réagir à un RIR trop élevé.");

const painState = structuredClone(baseState);
painState.sessions = [{
  id: "pain-limited",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 6, role: "heavy", rir: 0, stopReason: "pain", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(painState);
const painRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(painRecommendation.recommendedLoadKg, null, "Une série limitée par la douleur ne doit jamais déclencher une hausse.");

const failureSets = {
  ...adaptiveExercise,
  sets: [
    { weight: "", reps: "", role: "free", warmup: true, validated: false, drops: [] },
    { weight: "", reps: "", role: "heavy", warmup: false, validated: false, drops: [] },
    { weight: "", reps: "", role: "backoff", warmup: false, validated: false, drops: [] }
  ]
};
api.setState(baseState);
assert.equal(api.failureExpectedForSet(failureSets, 1), true, "RIR 0 reste un repère d’effort possible, sans modifier la validation.");
assert.equal(api.failureExpectedForSet(failureSets, 2), true);
assert.equal(api.setReachedFailure({ rir: 0 }), true);
assert.equal(api.setReachedFailure({ rir: "", stopReason: "technicalFailure" }), true);
const templateExerciseHtml = api.renderTemplateExerciseRow({ ...failureSets, plannedSets: 3, muscle: "chest" }, 0);
assert.match(templateExerciseHtml, /Utiliser les valeurs par défaut de l’application/);
assert.match(templateExerciseHtml, /Type de chaque série/);
assert.match(templateExerciseHtml, /data-template-set-role/);
assert.match(templateExerciseHtml, /Top set · 4–6 reps/);
assert.match(templateExerciseHtml, /Back-off · 8–12 reps/);
assert.match(templateExerciseHtml, /Libre · sans plage imposée/);
assert.doesNotMatch(templateExerciseHtml, /Cible de répétitions|data-template-set-anchor|Répétitions minimum|Double progression/);
api.setState(baseState);
const programHtml = api.renderProgram();
assert.match(programHtml, /2 × Top set · 4–6 reps/);
assert.match(programHtml, /1 × Back-off · 8–12 reps/);
const rangeTemplateHtml = api.renderTemplateExerciseRow({ ...failureSets, plannedSets: 3, muscle: "chest", setPlan: [
  { role: "heavy", repAnchor: "5-7" },
  { role: "heavy", repAnchor: "5-7" },
  { role: "backoff", repAnchor: "8-10" }
] }, 0);
assert.match(rangeTemplateHtml, /Top set · 4–6 reps/);
assert.match(rangeTemplateHtml, /Back-off · 8–12 reps/);
assert.doesNotMatch(rangeTemplateHtml, /5–7|8–10|data-template-set-anchor/, "Les anciennes ranges doivent être remplacées par les plages fixes des types.");
const trackedExerciseHtml = api.renderTrackedExercise({ ...failureSets, name: "Press", muscle: "chest" }, 0);
assert.match(trackedExerciseHtml, /Valider la série/);
assert.doesNotMatch(trackedExerciseHtml, /Valider à l’échec|Échec atteint|Valider autrement/);
assert.match(trackedExerciseHtml, /data-live-set-role/, "Le type doit rester modifiable avant validation pendant la séance.");
assert.match(trackedExerciseHtml, /Top set · 4–6 reps/);
assert.match(trackedExerciseHtml, /Back-off · 8–12 reps/);
assert.match(trackedExerciseHtml, /Pourquoi la série s’est arrêtée/);

const liveExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 80, reps: 6, rir: 3, stopReason: "voluntary", role: "heavy", warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", stopReason: "", role: "heavy", warmup: false, validated: false, drops: [] }
  ]
};
api.setState(baseState);
const liveRecommendation = api.adaptiveRecommendation(liveExercise);
assert.equal(liveRecommendation.applyScope, "next");
assert.equal(liveRecommendation.recommendedLoadKg, 82.5, "L’ajustement en direct doit réagir après une série trop loin de l’échec.");

const topSetExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 80, reps: 6, rir: 0, stopReason: "muscularFailure", role: "heavy", warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", stopReason: "", role: "heavy", warmup: false, validated: false, drops: [] }
  ]
};
const topSetIncrease = api.adaptiveRecommendation(topSetExercise);
assert.equal(topSetIncrease.recommendedLoadKg, 82.5, "Atteindre 6 reps sur un Top set à l’effort prévu doit proposer un palier supplémentaire.");
assert.match(topSetIncrease.why, /haut de la plage 4–6 reps du Top set/);
topSetExercise.sets[0].reps = 5;
const topSetHold = api.adaptiveRecommendation(topSetExercise);
assert.equal(topSetHold.recommendedLoadKg, 80, "Rester entre 4 et 6 reps sur un Top set doit conserver la charge.");
topSetExercise.sets[0].reps = 3;
const topSetDecrease = api.adaptiveRecommendation(topSetExercise);
assert.equal(topSetDecrease.recommendedLoadKg, 77.5, "Échouer sous 4 reps sur un Top set doit proposer un seul palier en moins.");
assert.match(topSetDecrease.why, /sous la plage 4–6 reps du Top set/);

const backoffExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 70, reps: 12, rir: 0, stopReason: "muscularFailure", role: "backoff", warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", stopReason: "", role: "backoff", warmup: false, validated: false, drops: [] }
  ]
};
assert.equal(api.adaptiveRecommendation(backoffExercise).recommendedLoadKg, 72.5, "Atteindre 12 reps sur un Back-off doit proposer un palier supplémentaire.");
backoffExercise.sets[0].reps = 10;
assert.equal(api.adaptiveRecommendation(backoffExercise).recommendedLoadKg, 70, "Rester entre 8 et 12 reps sur un Back-off doit conserver la charge.");
backoffExercise.sets[0].reps = 7;
assert.equal(api.adaptiveRecommendation(backoffExercise).recommendedLoadKg, 67.5, "Échouer sous 8 reps sur un Back-off doit proposer un palier en moins.");

const effortSummary = api.effortTrackingSummary([
  { exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 8, rir: 0, stopReason: "muscularFailure", warmup: false, validated: true, drops: [] }] }] },
  { exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 8, rir: 0, stopReason: "pain", warmup: false, validated: true, drops: [] }] }] }
]);
assert.equal(effortSummary.total, 2);
assert.equal(effortSummary.failure, 1, "La douleur ne doit pas être comptée comme un échec musculaire.");
assert.equal(effortSummary.pain, 1);

const prefillExercise = {
  sets: [
    { weight: "", role: "heavy", warmup: false, validated: false },
    { weight: "75", role: "heavy", warmup: false, validated: false },
    { weight: "", role: "free", warmup: true, validated: false },
    { weight: "", role: "backoff", warmup: false, validated: true }
  ]
};
assert.equal(api.applyAdaptiveLoad(prefillExercise, 80, "all", "heavy"), 1);
assert.deepEqual(prefillExercise.sets.map(set => set.weight), ["80", "75", "", ""], "Le préremplissage ne doit écraser aucune saisie ni toucher aux séries W ou validées.");

const nextOnlyExercise = { sets: [{ weight: "", role: "heavy", warmup: false, validated: false }, { weight: "", role: "backoff", warmup: false, validated: false }] };
assert.equal(api.applyAdaptiveLoad(nextOnlyExercise, 82.5, "next", "heavy"), 1);
assert.deepEqual(nextOnlyExercise.sets.map(set => set.weight), ["82.5", ""], "L’ajustement en direct ne doit préremplir que la prochaine série.");

const migratedState = structuredClone(baseState);
migratedState.version = 10;
migratedState.workoutTemplates[0].exercises[0].setPlan = undefined;
migratedState.sessions = [{
  id: "legacy-series",
  date: "2026-07-20",
  exercises: [{
    id: "press",
    name: "Press",
    loadType: "total",
    customMinRepsGuardrail: 4,
    customMaxRepsGuardrail: 15,
    sets: [
      { weight: 80, reps: 6, role: "free", repAnchor: "5-7", warmup: false, validated: true, drops: [] },
      { weight: 80, reps: 6, warmup: false, validated: true, drops: [] },
      { weight: 70, reps: 10, role: "free", repAnchor: "8-10", warmup: false, validated: true, drops: [] }
    ]
  }]
}];
api.setState(migratedState);
assert.equal(api.getState().version, 11);
assert.deepEqual(api.getState().sessions[0].exercises[0].sets.map(set => set.role), ["heavy", "heavy", "backoff"], "Les anciennes séances doivent être migrées automatiquement sans perdre leurs performances.");
assert.ok(api.getState().sessions[0].exercises[0].sets.every(set => !Object.hasOwn(set, "repAnchor")), "Les anciennes cibles doivent être retirées des séries historiques.");
assert.ok(!Object.hasOwn(api.getState().sessions[0].exercises[0], "customMinRepsGuardrail") && !Object.hasOwn(api.getState().sessions[0].exercises[0], "customMaxRepsGuardrail"), "Les anciens garde-fous personnalisés doivent être retirés du document normalisé.");
assert.deepEqual(api.getState().workoutTemplates[0].exercises[0].setPlan, [
  { role: "heavy" },
  { role: "heavy" },
  { role: "backoff" }
], "Les anciens programmes doivent recevoir la structure Top set / Back-off par défaut.");

const separatedRoles = [
  {
    id: "roles-1",
    date: "2026-07-10",
    exercises: [{ id: "press", loadType: "total", sets: [
      { weight: 100, reps: 6, role: "heavy", warmup: false, validated: true, drops: [] },
      { weight: 75, reps: 10, role: "backoff", warmup: false, validated: true, drops: [] }
    ] }]
  },
  {
    id: "roles-2",
    date: "2026-07-17",
    exercises: [{ id: "press", loadType: "total", sets: [
      { weight: 102.5, reps: 6, role: "heavy", warmup: false, validated: true, drops: [] },
      { weight: 77.5, reps: 10, role: "backoff", warmup: false, validated: true, drops: [] }
    ] }]
  }
];
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "4-6", "total", "heavy").best.weight, 102.5);
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "8-12", "total", "backoff").best.weight, 77.5);
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "4-6", "total", "backoff").best, null, "Une série back-off ne doit jamais contaminer la progression lourde.");
const separatedSummary = api.roleWorkSummary(separatedRoles);
assert.deepEqual([separatedSummary.heavy.sets, separatedSummary.backoff.sets, separatedSummary.free.sets], [2, 2, 0]);
const overviewRoles = [...separatedRoles, {
  id: "roles-3",
  date: "2026-07-24",
  exercises: [{ id: "press", name: "Press", loadType: "total", sets: [
    { weight: 80, reps: 10, role: "backoff", warmup: false, validated: true, drops: [] }
  ] }]
}];
assert.equal(api.exerciseProgressOverview(overviewRoles)[0].role, "backoff", "La vue d’ensemble doit utiliser le type de série offrant le plus de passages comparables.");

const roleAwareState = structuredClone(baseState);
roleAwareState.sessions = [{
  id: "role-history",
  date: "2026-07-17",
  exercises: [{
    ...adaptiveExercise,
    sets: [
      { weight: 100, reps: 6, rir: 0, role: "heavy", warmup: false, validated: true, drops: [] },
      { weight: 75, reps: 10, rir: 0, role: "backoff", warmup: false, validated: true, drops: [] }
    ]
  }]
}];
api.setState(roleAwareState);
const currentRoleExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 102.5, reps: 6, rir: 0, role: "heavy", warmup: false, validated: true, drops: [] },
    { weight: 102.5, reps: 5, rir: 0, role: "heavy", warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", role: "backoff", warmup: false, validated: false, drops: [] }
  ]
};
const backoffRecommendation = api.adaptiveRecommendation(currentRoleExercise);
assert.equal(backoffRecommendation.role, "backoff");
assert.equal(backoffRecommendation.recommendedLoadKg, 75, "Le back-off doit repartir de son propre historique, jamais de la charge lourde en cours.");

api.setState({ ...baseState, sessions: separatedRoles });
api.setStatsDays(0);
const roleStatsHtml = api.renderStats();
assert.match(roleStatsHtml, /data-set-role-stat/);
assert.match(roleStatsHtml, /Top set · 4–6 reps/);
assert.match(roleStatsHtml, /Types de séries/);
assert.match(roleStatsHtml, /Les Top sets, Back-off et séries libres ne sont jamais mélangés/);

console.log("Régressions MYGYM v2.2.0 : OK");
