/** Normative v1 target contracts for issues #9–#12; not wired into the demo.
 * Runtime validation and invariants: ../../contracts/learning-contracts-v1.md.
 * These interfaces alone do not validate untrusted JSON or stored data.
 */
export type TrainingId = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06' | 'M07' | 'M08' | 'CAP';
export type GitRef = { kind: 'branch' | 'tag' | 'commit'; value: string };
export interface GitSource {
  provider: 'github-public';
  repository: { owner: string; name: string };
  ref: GitRef;
  /** Repository-relative manifest/quiz file, never a URL or directory. */
  path: string;
}
export interface TrainingSources {
  trainingId: TrainingId;
  content: GitSource;
  questions: GitSource;
}
export interface SourceConfiguration {
  schemaVersion: 1;
  trainings: TrainingSources[];
}
export interface ResolvedSource {
  source: GitSource;
  /** Full lowercase 40-hex commit SHA, not the Contents API blob SHA. */
  commit: string;
}
export interface MaterialManifest {
  schemaVersion: 1;
  trainingId: TrainingId;
  materials: { id: string; title: string; kind: 'overview' | 'lesson' | 'exercise'; path: string }[];
}
export interface QuestionSet {
  schemaVersion: 1;
  trainingId: TrainingId;
  version: number;
  questions: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation: string;
  }[];
}
export interface GradingRule {
  id: 'single-choice-75-v1';
  threshold: { numerator: 3; denominator: 4 };
  pointsPerCorrect: 1;
  displayDecimals: 2;
}
export interface Answer { questionId: string; optionId: string }
/** Embedded immutable data allow offline historical evaluation, never latest questions. */
export interface CompletedAttempt {
  schemaVersion: 1;
  id: string;
  trainingId: TrainingId;
  startedAt: string;
  completedAt: string;
  questions: { provenance: ResolvedSource; snapshot: QuestionSet };
  rule: GradingRule;
  answers: Answer[];
  score: { earned: number; possible: number; required: number; passed: boolean };
  /** Exact persisted passing predecessor attempts observed at start. */
  prerequisites: { trainingId: TrainingId; attemptId: string }[];
}
export interface ReadMarker {
  trainingId: TrainingId;
  source: ResolvedSource;
  materialId: string;
  path: string;
}
export interface LegacyArchive {
  id: 'ai-training-demo-v1';
  raw: string;
  /** Actual import time; not an invented historical completion date. */
  importedAt: string;
  status: 'archived' | 'corrupt';
}
/** Logical local export; DB schema/version details are normative in the spec. */
export interface LocalDataset {
  schemaVersion: 1;
  configuration: SourceConfiguration;
  attempts: CompletedAttempt[];
  read: ReadMarker[];
  legacy: LegacyArchive[];
}
export type SourceErrorCode = 'INVALID_CONFIG' | 'UNSUPPORTED_SOURCE' | 'REF_NOT_FOUND'
  | 'FILE_NOT_FOUND' | 'NETWORK' | 'RATE_LIMIT' | 'ACCESS_DENIED' | 'INVALID_DATA';
export type SourceState<T> = { state: 'idle' } | { state: 'loading' }
  | { state: 'ready'; provenance: ResolvedSource; data: T }
  | { state: 'error'; code: SourceErrorCode; retryAt?: string };
