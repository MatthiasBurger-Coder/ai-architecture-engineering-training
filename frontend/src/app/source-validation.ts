import type { GitSource, SourceConfiguration, MaterialManifest, QuestionSet, SourceErrorCode, ResolvedSource } from './contracts.ts';
import { knownTraining, supportedVersion } from './catalog-policy.ts';
export { trainingIds } from './catalog-policy.ts';
export class SourceError extends Error {
  code: SourceErrorCode;
  retryAt?: string;
  constructor(code: SourceErrorCode, message: string, retryAt?: string) { super(message); this.code=code; this.retryAt=retryAt; }
}
function requireValue(ok: unknown, field: string, code: SourceErrorCode = 'INVALID_DATA'): asserts ok {
  if (!ok) throw new SourceError(code, `Ungültiges Feld: ${field}`);
}
function object(value: unknown, keys: string[], field: string, code: SourceErrorCode = 'INVALID_DATA'): asserts value is Record<string, any> {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), field, code);
  requireValue(Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value,k)), field, code);
}
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 10000;
const identifier = (v: unknown) => typeof v === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(v);
export const commitSha = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{40}$/.test(v);
export function validPath(v: unknown, extension: string): v is string {
  return typeof v === 'string' && v.endsWith(extension) && v.split('/').every(s => /^[A-Za-z0-9_.-]+$/.test(s) && s !== '.' && s !== '..');
}
export function validateSource(v: unknown): GitSource {
  if (v && typeof v === 'object' && 'provider' in v && v.provider !== 'github-public') throw new SourceError('UNSUPPORTED_SOURCE','Nur öffentliche GitHub-Repositories werden unterstützt.');
  object(v,['provider','repository','ref','path'],'Quelle','INVALID_CONFIG');
  object(v.repository,['owner','name'],'repository','INVALID_CONFIG');
  for (const k of ['owner','name']) requireValue(typeof v.repository[k] === 'string' && /^[A-Za-z0-9_.-]+$/.test(v.repository[k]) && !['.','..'].includes(v.repository[k]) && !/\.git$/i.test(v.repository[k]),`repository.${k}`,'INVALID_CONFIG');
  object(v.ref,['kind','value'],'ref','INVALID_CONFIG');
  const r=v.ref.value;
  requireValue(['branch','tag','commit'].includes(v.ref.kind),'ref.kind','INVALID_CONFIG');
  requireValue(v.ref.kind === 'commit' ? commitSha(r) : typeof r === 'string' && r !== '@' && !/[\x00-\x20\x7f~^:?*\[\\]/.test(r) && !r.includes('..') && !r.includes('@{') && !r.endsWith('.') && r.split('/').every((s:string)=>s.length && !s.startsWith('.') && !s.endsWith('.lock')),'ref.value','INVALID_CONFIG');
  requireValue(validPath(v.path,'.json'),'path (.json)','INVALID_CONFIG');
  return structuredClone(v) as GitSource;
}
export function validateProvenance(v:unknown):ResolvedSource {
  object(v,['source','commit'],'Herkunft');validateSource(v.source);requireValue(commitSha(v.commit),'Commit');
  return structuredClone(v) as ResolvedSource;
}
export function validateConfiguration(v: unknown): SourceConfiguration {
  object(v,['schemaVersion','trainings'],'Konfiguration','INVALID_CONFIG');
  requireValue(supportedVersion(v.schemaVersion) && Array.isArray(v.trainings),'schemaVersion/trainings','INVALID_CONFIG');
  const seen=new Set();
  for (const t of v.trainings) {
    object(t,['trainingId','content','questions'],'trainings[]','INVALID_CONFIG');
    requireValue(knownTraining(t.trainingId,v.schemaVersion) && !seen.has(t.trainingId),'trainingId (unbekannt oder doppelt)','INVALID_CONFIG');seen.add(t.trainingId);
    validateSource(t.content);validateSource(t.questions);
  }
  return structuredClone(v) as SourceConfiguration;
}
export function validateManifest(v: unknown, id: string): MaterialManifest {
  object(v,['schemaVersion','trainingId','materials'],'Manifest');
  requireValue(knownTraining(v.trainingId,v.schemaVersion) && v.trainingId===id,'schemaVersion/trainingId');
  requireValue(Array.isArray(v.materials) && v.materials.length>0,'materials');
  const ids=new Set(),paths=new Set();
  for (const m of v.materials) {
    object(m,['id','title','kind','path'],'materials[]');
    requireValue(identifier(m.id) && !ids.has(m.id),'materials.id');ids.add(m.id);
    requireValue(text(m.title),'materials.title');
    requireValue(['overview','lesson','exercise'].includes(m.kind),'materials.kind');
    requireValue(validPath(m.path,'.md') && !paths.has(m.path),'materials.path');paths.add(m.path);
  }
  return structuredClone(v) as MaterialManifest;
}
export function validateQuestions(v: unknown, id: string): QuestionSet {
  object(v,['schemaVersion','trainingId','version','questions'],'Fragensatz');
  requireValue(knownTraining(v.trainingId,v.schemaVersion) && v.trainingId===id,'schemaVersion/trainingId');
  requireValue(Number.isSafeInteger(v.version) && v.version>0,'version');
  requireValue(Array.isArray(v.questions) && v.questions.length>=1 && v.questions.length<=100,'questions (1–100)');
  const ids=new Set();
  for (const q of v.questions) {
    object(q,['id','prompt','options','correctOptionId','explanation'],'questions[]');
    requireValue(identifier(q.id) && !ids.has(q.id),'questions.id');ids.add(q.id);
    requireValue(text(q.prompt) && text(q.explanation),'questions.prompt/explanation');
    requireValue(Array.isArray(q.options) && q.options.length>=2 && q.options.length<=10,'questions.options (2–10)');
    const options=new Set(),texts=new Set();
    for (const o of q.options) {
      object(o,['id','text'],'options[]');
      requireValue(identifier(o.id) && !options.has(o.id),'options.id');options.add(o.id);
      requireValue(text(o.text) && !texts.has(o.text.trim()),'options.text');texts.add(o.text.trim());
    }
    requireValue(options.has(q.correctOptionId),'correctOptionId');
  }
  return structuredClone(v) as QuestionSet;
}
