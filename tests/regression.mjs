import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(directory, "..", "index.html"), "utf8");
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
  `      globalThis.__bodysseusTests = {
        availableRepRanges,
        defaultState,
        exerciseComparableProgress,
        finishWorkout,
        getState: () => state,
        muscleComparisonRows,
        programMuscleTargets,
        sessionDropReps,
        sessionDropTonnage,
        sessionDropSets,
        sessionMainReps,
        sessionMainTonnage,
        sessionTonnage,
        sessionWorkSets,
        setState: value => { state = normalizeState(value); },
        statsPeriodControl,
        unvalidatedEnteredSets
      };`
);
assert.ok(mainScript.includes("globalThis.__bodysseusTests"), "Les points de test doivent être injectés.");
new Function(mainScript)();

const api = globalThis.__bodysseusTests;
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
assert.equal(api.unvalidatedEnteredSets().length, 1, "Une série renseignée non validée doit être détectée.");
api.finishWorkout();
assert.equal(api.getState().sessions.length, 0, "La fin de séance doit être bloquée tant qu’une saisie n’est pas validée.");
assert.deepEqual(api.programMuscleTargets(), { chest: 3, back: 4 }, "Le brouillon ne doit pas modifier les cibles du programme.");

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
  exercises: [{ id: "press", name: "Press", loadType: "total", sets: [{ weight, reps, validated: true, warmup: false, drops: [] }] }]
}));
const ranges = api.availableRepRanges(progressionSessions, "press", "total");
assert.equal(ranges.find(range => range.id === "6-8").passageCount, 3);
const progress = api.exerciseComparableProgress(progressionSessions, "press", "6-8", "total");
assert.equal(progress.passages.length, 3);
assert.equal(progress.best.weight, 85);
assert.equal(progress.best.reps, 7);
assert.equal(progress.trend.at(-1).value, 82.5, "La tendance doit être la moyenne mobile des trois passages comparables.");

const periodHtml = api.statsPeriodControl();
assert.match(periodHtml, /value="7" selected/);
for (let week = 1; week <= 8; week += 1) assert.match(periodHtml, new RegExp(`>${week} semaine`));
assert.match(periodHtml, /Depuis toujours/);

console.log("Régressions BODYSSEUS v1.10.0 : OK");
