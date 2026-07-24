import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(directory, "..", "index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(directory, "..", "service-worker.js"), "utf8");
assert.match(html, /const APP_VERSION = "1\.14\.1"/, "La version visible doit correspondre à la livraison du nouveau logo.");
assert.match(html, /class="brand-mark" src="\.\/icons\/logo-transparent\.png"/, "L’en-tête doit utiliser le nouveau logo transparent.");
assert.match(serviceWorker, /const CACHE_NAME = "innerset-v24"/, "Le cache PWA doit être renouvelé pour diffuser les nouvelles icônes.");
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
        defaultSetPlan,
        defaultState,
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
        setState: value => { state = normalizeState(value); },
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
assert.equal(api.defaultState().version, 10, "Le schéma des rôles de séries doit incrémenter la version des données.");
assert.deepEqual(api.defaultSetPlan(3), [
  { role: "heavy", repAnchor: 6 },
  { role: "heavy", repAnchor: 6 },
  { role: "backoff", repAnchor: 10 }
], "Le profil par défaut doit créer deux séries lourdes puis un back-off.");
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
const editedProgramState = structuredClone(baseState);
editedProgramState.workoutTemplates[0].exercises[0].plannedSets = 5;
api.setState(editedProgramState);
assert.deepEqual(api.programMuscleTargets(), { chest: 5, back: 4 }, "Modifier les séries du programme doit recalculer sa cible.");

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
assert.match(blankFeedbackWorkoutHtml, /Difficulté de la séance/);
assert.match(blankFeedbackWorkoutHtml, /Non renseigné · facultatif/);
assert.doesNotMatch(blankFeedbackWorkoutHtml, /Effort global/);
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
const subjectiveStatsHtml = api.renderStats();
assert.match(subjectiveStatsHtml, /Comparé à ton niveau habituel/);
assert.match(subjectiveStatsHtml, /Signal de sécurité/);
assert.doesNotMatch(subjectiveStatsHtml, /Signaux moyens/);
const subjectiveDetailHtml = api.renderSessionDetail(subjectiveSessions[3]);
assert.match(subjectiveDetailHtml, /Difficile · fatigue supérieure à l’habitude/);
assert.match(subjectiveDetailHtml, /Épaule droite/);
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
const bodyweightSession = {
  id: "bodyweight-session",
  date: "2026-07-20",
  exercises: [{ id: "dips", loadType: "bodyweightPlus", bodyweightKg: 80, sets: [{ weight: 20, reps: 5, validated: true, warmup: false, drops: [] }] }]
};
assert.equal(api.sessionTonnage(bodyweightSession), 500, "Le poids du corps doit rester celui mémorisé au moment de la séance.");

const progressionSessions = [
  ["s1", "2026-07-01", 80, 8],
  ["s2", "2026-07-08", 82.5, 8],
  ["s3", "2026-07-15", 85, 7],
  ["s4", "2026-07-20", 90, 5]
].map(([id, date, weight, reps]) => ({
  id,
  date,
  exercises: [{ id: "press", name: "Press", loadType: "total", sets: [{ weight, reps, role: "heavy", validated: true, warmup: false, drops: [] }] }]
}));
const ranges = api.availableRepRanges(progressionSessions, "press", "total", "heavy");
assert.equal(ranges.find(range => range.id === "6-8").passageCount, 3);
const progress = api.exerciseComparableProgress(progressionSessions, "press", "6-8", "total", "heavy");
assert.equal(progress.passages.length, 3);
assert.equal(progress.best.weight, 85);
assert.equal(progress.best.reps, 7);
assert.equal(progress.trend.at(-1).value, 82.5, "La tendance doit être la moyenne mobile des trois passages comparables.");

const periodHtml = api.statsPeriodControl();
assert.match(periodHtml, /value="7" selected/);
for (let week = 1; week <= 8; week += 1) assert.match(periodHtml, new RegExp(`>${week} semaine`));
assert.match(periodHtml, /Depuis toujours/);

const profile = api.normalizePractitionerProfile({});
assert.equal(profile.goal, "hypertrophy");
assert.equal(profile.effortStyle, "highIntensity");
assert.deepEqual([profile.heavyRepAnchor, profile.backoffRepAnchor], [6, 10]);
assert.deepEqual([profile.targetRirMin, profile.targetRirMax], [0, 1]);
assert.deepEqual([profile.minRepsGuardrail, profile.maxRepsGuardrail], [4, 15]);
assert.equal(api.normalizeAdaptiveSettings({ progressionMode: "trackOnly" }).assistantEnabled, false, "L’ancien mode sans recommandation doit être migré.");
assert.equal(api.normalizeAdaptiveSettings({ progressionMode: "double" }).useProfileDefaults, true, "Les anciens objectifs rigides doivent migrer vers le profil.");
api.setState(baseState);
assert.match(api.renderData(), /Profil pratiquant/);
assert.match(api.renderData(), /Haute intensité/);

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
    exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 7, rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
  },
  {
    id: "adaptive-latest",
    date: "2026-07-17",
    exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 8, rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
  }
];
api.setState(adaptiveState);
const increaseRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(increaseRecommendation.kind, "increase");
assert.equal(increaseRecommendation.recommendedLoadKg, 82.5, "Une performance améliorée à charge et effort identiques doit proposer un palier.");
assert.match(increaseRecommendation.why, /passée de 7 à 8/);

const freeRepState = structuredClone(baseState);
freeRepState.sessions = [{
  id: "five-reps",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 5, rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(freeRepState);
const fiveRepRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(fiveRepRecommendation.kind, "hold");
assert.equal(fiveRepRecommendation.recommendedLoadKg, 80, "Cinq répétitions à l’échec doivent rester valides sans cible rigide.");

const tooHeavyState = structuredClone(baseState);
tooHeavyState.sessions = [{
  id: "too-heavy",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 3, rir: 0, stopReason: "muscularFailure", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(tooHeavyState);
const decreaseRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(decreaseRecommendation.kind, "caution");
assert.equal(decreaseRecommendation.recommendedLoadKg, 77.5, "Un échec sous le garde-fou doit retirer un seul palier.");

const highRirState = structuredClone(baseState);
highRirState.sessions = [{
  id: "too-easy",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 8, rir: 3, stopReason: "voluntary", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(highRirState);
const highRirRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(highRirRecommendation.kind, "increase");
assert.equal(highRirRecommendation.recommendedLoadKg, 82.5, "Le profil haute intensité doit réagir à un RIR trop élevé.");

const painState = structuredClone(baseState);
painState.sessions = [{
  id: "pain-limited",
  date: "2026-07-17",
  exercises: [{ ...adaptiveExercise, sets: [{ weight: 80, reps: 8, rir: 0, stopReason: "pain", validated: true, warmup: false, drops: [] }] }]
}];
api.setState(painState);
const painRecommendation = api.adaptiveRecommendation(adaptiveExercise);
assert.equal(painRecommendation.recommendedLoadKg, null, "Une série limitée par la douleur ne doit jamais déclencher une hausse.");

const failureSets = {
  ...adaptiveExercise,
  sets: [
    { weight: "", reps: "", role: "free", repAnchor: "", warmup: true, validated: false, drops: [] },
    { weight: "", reps: "", role: "heavy", repAnchor: 6, warmup: false, validated: false, drops: [] },
    { weight: "", reps: "", role: "backoff", repAnchor: 10, warmup: false, validated: false, drops: [] }
  ]
};
api.setState(baseState);
assert.equal(api.failureExpectedForSet(failureSets, 1), true, "RIR 0 reste un repère d’effort possible, sans modifier la validation.");
assert.equal(api.failureExpectedForSet(failureSets, 2), true);
assert.equal(api.setReachedFailure({ rir: 0 }), true);
assert.equal(api.setReachedFailure({ rir: "", stopReason: "technicalFailure" }), true);
const templateExerciseHtml = api.renderTemplateExerciseRow({ ...failureSets, plannedSets: 3, muscle: "chest" }, 0);
assert.match(templateExerciseHtml, /Utiliser automatiquement mon profil pratiquant/);
assert.match(templateExerciseHtml, /Structure des séries/);
assert.match(templateExerciseHtml, /Back-off/);
assert.doesNotMatch(templateExerciseHtml, /Répétitions minimum|Double progression/);
const trackedExerciseHtml = api.renderTrackedExercise({ ...failureSets, name: "Press", muscle: "chest" }, 0);
assert.match(trackedExerciseHtml, /Valider la série/);
assert.doesNotMatch(trackedExerciseHtml, /Valider à l’échec|Échec atteint|Valider autrement/);
assert.match(trackedExerciseHtml, /Pourquoi la série s’est arrêtée/);

const liveExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 80, reps: 8, rir: 3, stopReason: "voluntary", role: "heavy", repAnchor: 6, warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", stopReason: "", role: "heavy", repAnchor: 6, warmup: false, validated: false, drops: [] }
  ]
};
api.setState(baseState);
const liveRecommendation = api.adaptiveRecommendation(liveExercise);
assert.equal(liveRecommendation.applyScope, "next");
assert.equal(liveRecommendation.recommendedLoadKg, 82.5, "L’ajustement en direct doit réagir après une série trop loin de l’échec.");

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
migratedState.version = 9;
migratedState.workoutTemplates[0].exercises[0].setPlan = undefined;
migratedState.sessions = [{
  id: "legacy-series",
  date: "2026-07-20",
  exercises: [{
    id: "press",
    name: "Press",
    loadType: "total",
    sets: [
      { weight: 80, reps: 7, warmup: false, validated: true, drops: [] },
      { weight: 80, reps: 6, warmup: false, validated: true, drops: [] },
      { weight: 70, reps: 10, warmup: false, validated: true, drops: [] }
    ]
  }]
}];
api.setState(migratedState);
assert.deepEqual(api.getState().sessions[0].exercises[0].sets.map(set => [set.role, set.repAnchor]), [
  ["heavy", 6],
  ["heavy", 6],
  ["backoff", 10]
], "Les anciennes séances doivent être migrées automatiquement sans perdre leurs performances.");
assert.deepEqual(api.getState().workoutTemplates[0].exercises[0].setPlan.map(item => [item.role, item.repAnchor]), [
  ["heavy", 6],
  ["heavy", 6],
  ["backoff", 10]
], "Les anciens programmes doivent recevoir la nouvelle structure par défaut.");

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
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "6-8", "total", "heavy").best.weight, 102.5);
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "9-12", "total", "backoff").best.weight, 77.5);
assert.equal(api.exerciseComparableProgress(separatedRoles, "press", "6-8", "total", "backoff").best, null, "Une série back-off ne doit jamais contaminer la progression lourde.");

const roleAwareState = structuredClone(baseState);
roleAwareState.sessions = [{
  id: "role-history",
  date: "2026-07-17",
  exercises: [{
    ...adaptiveExercise,
    sets: [
      { weight: 100, reps: 6, rir: 0, role: "heavy", repAnchor: 6, warmup: false, validated: true, drops: [] },
      { weight: 75, reps: 10, rir: 0, role: "backoff", repAnchor: 10, warmup: false, validated: true, drops: [] }
    ]
  }]
}];
api.setState(roleAwareState);
const currentRoleExercise = {
  ...adaptiveExercise,
  sets: [
    { weight: 102.5, reps: 6, rir: 0, role: "heavy", repAnchor: 6, warmup: false, validated: true, drops: [] },
    { weight: 102.5, reps: 5, rir: 0, role: "heavy", repAnchor: 6, warmup: false, validated: true, drops: [] },
    { weight: "", reps: "", rir: "", role: "backoff", repAnchor: 10, warmup: false, validated: false, drops: [] }
  ]
};
const backoffRecommendation = api.adaptiveRecommendation(currentRoleExercise);
assert.equal(backoffRecommendation.role, "backoff");
assert.equal(backoffRecommendation.recommendedLoadKg, 75, "Le back-off doit repartir de son propre historique, jamais de la charge lourde en cours.");

console.log("Régressions INNERSET v1.14.1 : OK");
