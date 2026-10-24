/** Synthetic contract review inputs, not runtime data and not proof of Git availability. */
import type {
  CompletedAttempt, GitSource, GradingRule, LocalDataset, MaterialManifest,
  QuestionSet, SourceConfiguration, SourceErrorCode,
} from './contracts.ts';

const source: GitSource = {
  provider: 'github-public',
  repository: { owner: 'example', name: 'training' },
  ref: { kind: 'branch', value: 'main' },
  path: 'modules/M01/materials.json',
};
export const sameRepository: SourceConfiguration = {
  schemaVersion: 1,
  trainings: [{ trainingId: 'M01', content: source,
    questions: { ...source, path: 'modules/M01/assessment/quiz.json' } }],
};
export const separateRepositories: SourceConfiguration = {
  schemaVersion: 1,
  trainings: [{ ...sameRepository.trainings[0], questions: {
    ...sameRepository.trainings[0].questions,
    repository: { owner: 'example', name: 'questions' },
    ref: { kind: 'tag', value: 'v1.0' },
  } }],
};
export const manifest: MaterialManifest = {
  schemaVersion: 1, trainingId: 'M01',
  materials: [{ id: 'overview', title: 'Grundlagen', kind: 'overview', path: 'modules/M01/README.md' }],
};
export const questionSet: QuestionSet = {
  schemaVersion: 1, trainingId: 'M01', version: 1,
  questions: [
    { id: 'tokens', prompt: 'Was verarbeitet das Sprachmodell?',
      options: [{ id: 'tokens', text: 'Tokens' }, { id: 'guarantees', text: 'Garantierte Wahrheiten' }],
      correctOptionId: 'tokens', explanation: 'Die Eingabe wird in Tokens zerlegt.' },
    { id: 'context', prompt: 'Was ist begrenzt?',
      options: [{ id: 'window', text: 'Das Kontextfenster' }, { id: 'nothing', text: 'Nichts' }],
      correctOptionId: 'window', explanation: 'Ein Modell hat ein begrenztes Kontextfenster.' },
    { id: 'output', prompt: 'Wie ist LLM-Output zu behandeln?',
      options: [{ id: 'proposal', text: 'Als zu validierender Vorschlag' }, { id: 'authority', text: 'Als Autorität' }],
      correctOptionId: 'proposal', explanation: 'LLM-Ausgaben benötigen fachliche Validierung.' },
    { id: 'reading', prompt: 'Was belegt das Lesen eines Textes?',
      options: [{ id: 'read', text: 'Lesefortschritt' }, { id: 'competency', text: 'Unabhängig geprüfte Kompetenz' }],
      correctOptionId: 'read', explanation: 'Lesen und Kompetenznachweis sind getrennt.' },
  ],
};
export const rule: GradingRule = {
  id: 'single-choice-75-v1', threshold: { numerator: 3, denominator: 4 },
  pointsPerCorrect: 1, displayDecimals: 2,
};
export const passedAttempt: CompletedAttempt = {
  schemaVersion: 1, id: '10000000-0000-4000-8000-000000000001', trainingId: 'M01',
  startedAt: '2026-10-24T14:00:00.000Z', completedAt: '2026-10-24T14:05:00.000Z',
  questions: { provenance: { source: sameRepository.trainings[0].questions, commit: 'a'.repeat(40) }, snapshot: questionSet },
  rule,
  answers: [{ questionId: 'tokens', optionId: 'tokens' }, { questionId: 'context', optionId: 'window' },
    { questionId: 'output', optionId: 'proposal' }, { questionId: 'reading', optionId: 'competency' }],
  score: { earned: 3, possible: 4, required: 3, passed: true }, prerequisites: [],
};
export const failedRetry: CompletedAttempt = {
  ...passedAttempt, id: '10000000-0000-4000-8000-000000000002',
  startedAt: '2026-10-24T14:10:00.000Z', completedAt: '2026-10-24T14:15:00.000Z',
  answers: passedAttempt.answers.map(a => a.questionId === 'output' ? { ...a, optionId: 'authority' } : a),
  score: { earned: 2, possible: 4, required: 3, passed: false },
};
export const changedVersionAttempt: CompletedAttempt = {
  ...passedAttempt, id: '10000000-0000-4000-8000-000000000003',
  startedAt: '2026-10-24T14:20:00.000Z', completedAt: '2026-10-24T14:25:00.000Z',
  questions: {
    provenance: { source: separateRepositories.trainings[0].questions, commit: 'b'.repeat(40) },
    snapshot: { ...questionSet, version: 2, questions: questionSet.questions.map(q => q.id === 'tokens'
      ? { ...q, explanation: 'Tokens sind Einheiten der Modellverarbeitung.' } : q) },
  },
  answers: passedAttempt.answers.map(a => a.questionId === 'reading' ? { ...a, optionId: 'read' } : a),
  score: { earned: 4, possible: 4, required: 3, passed: true },
};
export const inFlightUpdate = {
  started: passedAttempt.questions,
  refreshed: changedVersionAttempt.questions,
  expectedCompletionSnapshot: passedAttempt.questions,
};
export const legacyValid = JSON.stringify({
  passed: ['M01'], read: ['modules/M01-llm-foundations/README.md'],
  quizzes: { M01: { version: 1, answers: [0, 0, 0, 0] } },
});
export const legacyCorrupt = '{"passed":["M01"],broken';
export const dataset: LocalDataset = {
  schemaVersion: 1, configuration: sameRepository,
  attempts: [passedAttempt, failedRetry, changedVersionAttempt], read: [],
  legacy: [{ id: 'ai-training-demo-v1', raw: legacyValid, importedAt: '2026-10-24T13:00:00.000Z', status: 'archived' }],
};

interface InvalidInput { id: string; payload: unknown; expected: string }
export const invalidSources: InvalidInput[] = [
  { id: 'S-path', payload: { ...source, path: '../quiz.json' }, expected: 'INVALID_CONFIG' },
  { id: 'S-ref', payload: { ...source, ref: { kind: 'commit', value: 'abc123' } }, expected: 'INVALID_CONFIG' },
  { id: 'S-host', payload: { ...source, provider: 'gitlab-private' }, expected: 'UNSUPPORTED_SOURCE' },
  { id: 'S-secret', payload: { ...source, token: 'forbidden-example-field' }, expected: 'INVALID_CONFIG' },
  { id: 'S-duplicate', payload: { ...sameRepository, trainings: [sameRepository.trainings[0], sameRepository.trainings[0]] }, expected: 'INVALID_CONFIG' },
  { id: 'S-training', payload: { ...sameRepository, trainings: [{ ...sameRepository.trainings[0], trainingId: 'M99' }] }, expected: 'INVALID_CONFIG' },
];
export const sourceFailures: { id: string; phase: string; response: unknown; expected: SourceErrorCode }[] = [
  { id: 'S-missing-ref', phase: 'resolve', response: { status: 404 }, expected: 'REF_NOT_FOUND' },
  { id: 'S-missing-file', phase: 'fetch', response: { status: 404 }, expected: 'FILE_NOT_FOUND' },
  { id: 'S-offline', phase: 'fetch', response: { networkError: true }, expected: 'NETWORK' },
  { id: 'S-limit', phase: 'fetch', response: { status: 429, retryAfter: '60' }, expected: 'RATE_LIMIT' },
  { id: 'S-denied', phase: 'fetch', response: { status: 403 }, expected: 'ACCESS_DENIED' },
  { id: 'S-json', phase: 'decode', response: '{broken', expected: 'INVALID_DATA' },
  { id: 'S-manifest', phase: 'validate', response: { ...manifest, trainingId: 'M02' }, expected: 'INVALID_DATA' },
];
const first = questionSet.questions[0];
export const invalidQuestions: InvalidInput[] = [
  { id: 'Q-empty', payload: { ...questionSet, questions: [] }, expected: 'INVALID_DATA' },
  { id: 'Q-training', payload: { ...questionSet, trainingId: 'M02' }, expected: 'INVALID_DATA for M01 source' },
  { id: 'Q-version', payload: { ...questionSet, version: 0 }, expected: 'INVALID_DATA' },
  { id: 'Q-duplicate', payload: { ...questionSet, questions: [first, first] }, expected: 'INVALID_DATA' },
  { id: 'Q-answer', payload: { ...questionSet, questions: [{ ...first, correctOptionId: 'missing' }] }, expected: 'INVALID_DATA' },
  { id: 'Q-option', payload: { ...questionSet, questions: [{ ...first, options: [first.options[0], first.options[0]] }] }, expected: 'INVALID_DATA' },
  { id: 'Q-explanation', payload: { ...questionSet, questions: [{ ...first, explanation: ' ' }] }, expected: 'INVALID_DATA' },
];
export const migrationScenarios = [
  { id: 'M-valid', legacyRaw: legacyValid, existingArchive: null, expected: 'archive raw; zero qualified attempts; M01 available' },
  { id: 'M-corrupt', legacyRaw: legacyCorrupt, existingArchive: null, expected: 'archive raw as corrupt; show warning; no deletion' },
  { id: 'M-repeat', legacyRaw: legacyValid, existingArchive: dataset.legacy[0], expected: 'no-op; same archive and importedAt' },
  { id: 'M-conflict', legacyRaw: legacyCorrupt, existingArchive: dataset.legacy[0], expected: 'retain both; show conflict; export both' },
  { id: 'M-abort', legacyRaw: legacyValid, existingArchive: null, storageError: 'QuotaExceededError', expected: 'no migration success; retain LocalStorage; retry' },
];
export const restoreScenarios: InvalidInput[] = [
  { id: 'R-flag', payload: { ...failedRetry, score: { ...failedRetry.score, passed: true } }, expected: 'invalid score; no unlock' },
  { id: 'R-incomplete', payload: { ...passedAttempt, answers: passedAttempt.answers.slice(1) }, expected: 'invalid answers; no unlock' },
  { id: 'R-prerequisite', payload: { ...passedAttempt, trainingId: 'M02', questions: {
    ...passedAttempt.questions, snapshot: { ...questionSet, trainingId: 'M02' },
  } }, expected: 'missing M01 prerequisite; no unlock' },
  { id: 'R-conflict', payload: [passedAttempt, { ...failedRetry, id: passedAttempt.id }], expected: 'atomic import rejection; retain existing data' },
  { id: 'R-unknown', payload: { ...dataset, schemaVersion: 99 }, expected: 'reject import; retain existing data' },
  { id: 'R-storage', payload: { attempt: passedAttempt, transaction: 'aborted' }, expected: 'session result only; M02 locked; retry same ID' },
  { id: 'R-save-twice', payload: [passedAttempt, passedAttempt], expected: 'idempotent; one attempt' },
];
export const levelScenarios = [
  { id: 'L-empty', attempts: [], readCount: 0, expected: { passed: [], available: 'M01', attemptCount: 0, percent: 0 } },
  { id: 'L-read', attempts: [], readCount: 9, expected: { passed: [], available: 'M01', attemptCount: 0, percent: 0 } },
  { id: 'L-retry', attempts: [passedAttempt, failedRetry], readCount: 0,
    expected: { passed: ['M01'], available: 'M02', attemptCount: 2, last: '2/4', best: '3/4', percent: 11.11 } },
  { id: 'L-version', attempts: dataset.attempts, readCount: 0,
    expected: { passed: ['M01'], available: 'M02', attemptCount: 3, last: '4/4', best: '4/4', percent: 11.11 } },
];
