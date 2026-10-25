import type { CompletedAttempt, LegacyArchive, LocalDataset, ReadMarker } from './contracts.ts';
import { validateConfiguration, validateQuestions, trainingIds, validPath, validateProvenance } from './source-validation.ts';
import { ancestors, knownTraining, supportedVersion } from './catalog-policy.ts';
import { isGradingRule, grade } from './quiz.ts';
export function ensure(ok: unknown, field: string): asserts ok { if(!ok)throw Error(`Lokale Daten ungültig: ${field}`); }
export function shape(v: any, keys: string[], field: string): void {
  ensure(v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).length===keys.length && keys.every(k=>Object.hasOwn(v,k)),field);
}
export const canonical=(v: any):string=>JSON.stringify(v && typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
export const same=(a: unknown,b: unknown)=>canonical(a)===canonical(b);
const date=(v: unknown)=>typeof v==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString()===v;
export const provenance=validateProvenance;
export function validateAttempt(v: any):CompletedAttempt {
  shape(v,['schemaVersion','id','trainingId','startedAt','completedAt','questions','rule','answers','score','prerequisites'],'Versuch');
  ensure(supportedVersion(v.schemaVersion) && typeof v.id==='string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.id),'Version/UUID');
  ensure(knownTraining(v.trainingId,v.schemaVersion),'Training');
  ensure(date(v.startedAt) && date(v.completedAt) && v.startedAt<=v.completedAt,'Zeitstempel (Systemuhr prüfen)');
  shape(v.questions,['provenance','snapshot'],'Fragen');provenance(v.questions.provenance);validateQuestions(v.questions.snapshot,v.trainingId);ensure(v.schemaVersion===2 || v.questions.snapshot.schemaVersion===1,'v1-Fragensnapshot');
  ensure(isGradingRule(v.rule),'Bewertungsregel');
  const q=v.questions.snapshot.questions;
  ensure(Array.isArray(v.answers) && v.answers.length===q.length,'Antwortanzahl');
  const seen=new Set();
  for(const a of v.answers){shape(a,['questionId','optionId'],'Antwort');ensure(!seen.has(a.questionId) && q.some((x:any)=>x.id===a.questionId && x.options.some((o:any)=>o.id===a.optionId)),'Antwortzuordnung');seen.add(a.questionId);}
  const score=grade(v.questions.snapshot,q.map((x:any)=>x.options.findIndex((o:any)=>o.id===v.answers.find((a:any)=>a.questionId===x.id)?.optionId)))!;
  ensure(same(v.score,{earned:score.correct,possible:score.total,required:score.required,passed:score.passed}),'Punktestand');
  const before=ancestors(v.trainingId);
  ensure(Array.isArray(v.prerequisites) && v.prerequisites.length===before.length,'Voraussetzungen');
  const refs=new Set();
  for(const p of v.prerequisites){shape(p,['trainingId','attemptId'],'Vorgänger');ensure(before.includes(p.trainingId) && !refs.has(p.trainingId) && typeof p.attemptId==='string','Vorgängerreferenz');refs.add(p.trainingId);}
  return structuredClone(v);
}
export function qualify(values: unknown[]):{valid:CompletedAttempt[];invalid:{value:unknown;message:string}[]} {
  const valid:CompletedAttempt[]=[],invalid:{value:unknown;message:string}[]=[],candidates:CompletedAttempt[]=[];
  for(const v of values){try{const a=validateAttempt(v);ensure(!candidates.some(x=>x.id===a.id),'doppelte Versuch-ID');candidates.push(a);}catch(e){invalid.push({value:v,message:`Versuch ${(v as any)?.id || '(ohne ID)'}: ${String(e)}`});}}
  for(const id of trainingIds)for(const a of candidates.filter(x=>x.trainingId===id)){
    if(a.prerequisites.every(p=>valid.some(x=>x.id===p.attemptId && x.trainingId===p.trainingId && x.score.passed && x.completedAt<=a.startedAt)))valid.push(a);
    else invalid.push({value:a,message:`${a.id}: ungültige Voraussetzungskette`});
  }
  return {valid,invalid};
}
export function validateRead(v:any):ReadMarker {
  shape(v,['trainingId','source','materialId','path'],'Lesemarkierung');ensure(trainingIds.includes(v.trainingId),'Lesetraining');provenance(v.source);
  ensure(typeof v.materialId==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(v.materialId) && validPath(v.path,'.md'),'Material');return structuredClone(v);
}
export function readIdentity(v:ReadMarker){return JSON.stringify([v.trainingId,v.source.source.repository.owner.toLowerCase(),v.source.source.repository.name.toLowerCase(),v.source.commit,v.path,v.materialId]);}
export const legacyKey='ai-training-demo-v1';
export function legacyStatus(raw:string):LegacyArchive['status'] {
  try{const v=JSON.parse(raw);ensure(v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).every(k=>['passed','read','quizzes'].includes(k)),'Altdaten');
    for(const k of ['passed','read'])ensure(Array.isArray(v[k]) && v[k].every((x:unknown)=>typeof x==='string'),'Altdatenliste');
    if(v.quizzes!==undefined){ensure(v.quizzes && typeof v.quizzes==='object' && !Array.isArray(v.quizzes),'Alttests');for(const q of Object.values(v.quizzes) as any[]){shape(q,['version','answers'],'Alttest');ensure(Number.isSafeInteger(q.version) && q.version>0 && Array.isArray(q.answers) && q.answers.every((n:unknown)=>Number.isSafeInteger(n) && (n as number)>=0),'Altantworten');}}
    return 'archived';
  }catch{return 'corrupt';}
}
export function validateLegacy(v:any):LegacyArchive {shape(v,['id','raw','importedAt','status'],'Archiv');ensure(v.id===legacyKey && typeof v.raw==='string' && date(v.importedAt) && v.status===legacyStatus(v.raw),'Archivinhalt');return structuredClone(v);}
export function validateDataset(v:any):LocalDataset {
  shape(v,['schemaVersion','configuration','attempts','read','legacy'],'Sicherung');ensure(supportedVersion(v.schemaVersion),'Sicherungsversion');validateConfiguration(v.configuration);
  ensure(Array.isArray(v.attempts) && Array.isArray(v.read) && Array.isArray(v.legacy),'Sicherungslisten');
  if(v.schemaVersion===1){ensure(v.configuration.schemaVersion===1 && v.attempts.every((a:any)=>a?.schemaVersion===1) && v.read.every((r:any)=>knownTraining(r?.trainingId,1)),'v1-Sicherung enthält v2-Daten');}
  const checked=qualify(v.attempts);ensure(!checked.invalid.length,'Versuche/Voraussetzungsketten');
  const reads=v.read.map(validateRead);ensure(new Set(reads.map(readIdentity)).size===reads.length,'doppelte Lesemarkierung');
  v.legacy.forEach(validateLegacy);ensure(v.legacy.length<=1,'doppeltes Archiv');return structuredClone(v);
}
