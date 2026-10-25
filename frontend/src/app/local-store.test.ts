import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { database, transaction, migrate, restoreLocal, saveAttempt, saveRead, importLocal, settings, recoveryExport } from './local-store.ts';
import { qualify, validateAttempt, validateDataset, readIdentity, legacyKey } from './local-data.ts';
import { passedAttempt, failedRetry, changedVersionAttempt, dataset, legacyValid, legacyCorrupt, sameRepository } from './contracts.fixtures.ts';
import { completeAttempt, resumeAttempt } from './quiz.ts';
import { fromHistory, status } from './progress.ts';
import type { CompletedAttempt, ReadMarker } from './contracts.ts';
beforeEach(()=>{globalThis.indexedDB=new IDBFactory();});
const putRaw=async(store:'attempts'|'read'|'legacy'|'meta',v:unknown,key?:string)=>transaction([store],'readwrite',async tx=>{if(key===undefined)tx.objectStore(store).put(v);else tx.objectStore(store).put(v,key);});
const successor=():CompletedAttempt=>({...structuredClone(passedAttempt),id:'20000000-0000-4000-8000-000000000001',trainingId:'M02',startedAt:'2026-10-24T15:00:00.000Z',completedAt:'2026-10-24T15:01:00.000Z',questions:{...structuredClone(passedAttempt.questions),snapshot:{...structuredClone(passedAttempt.questions.snapshot),trainingId:'M02'}},prerequisites:[{trainingId:'M01',attemptId:passedAttempt.id}]});
const marker:ReadMarker={trainingId:'M01',source:passedAttempt.questions.provenance,materialId:'overview',path:'modules/M01/README.md'};
test('migration retains raw valid/corrupt legacy, actual import time and repeat is a no-op',async()=>{
  for(const raw of [legacyValid,legacyCorrupt]){
    globalThis.indexedDB=new IDBFactory();await migrate(raw);const first=(await restoreLocal()).dataset;
    assert.equal(first.legacy[0].raw,raw);assert.equal(first.legacy[0].status,raw===legacyValid?'archived':'corrupt');assert.equal(first.attempts.length,0);
    await migrate(raw);assert.deepEqual((await restoreLocal()).dataset.legacy,first.legacy);
  }
});
test('migration conflict and aborted archive writes preserve the original',async()=>{
  await migrate(legacyValid);await assert.rejects(migrate(legacyCorrupt),/Konflikt/);assert.equal((await restoreLocal()).dataset.legacy[0].raw,legacyValid);
  globalThis.indexedDB=new IDBFactory();const original=IDBObjectStore.prototype.add;
  try{IDBObjectStore.prototype.add=function(...args:Parameters<typeof original>){if(this.name==='legacy')throw new DOMException('full','QuotaExceededError');return original.apply(this,args);};await assert.rejects(migrate(legacyValid),/full/);}finally{IDBObjectStore.prototype.add=original;}
  assert.equal((await restoreLocal()).dataset.legacy.length,0);await migrate(legacyValid);assert.equal((await restoreLocal()).dataset.legacy.length,1);
});
test('completed history is append-only, idempotent and restored independently of current questions',async()=>{
  for(const a of [passedAttempt,passedAttempt,failedRetry,changedVersionAttempt])await saveAttempt(a);
  const restored=(await restoreLocal()).dataset;assert.equal(restored.attempts.length,3);
  assert.equal(status('M02',fromHistory(restored.attempts,[])),'available');
  await assert.rejects(saveAttempt({...failedRetry,id:passedAttempt.id}),/Konflikt/);
  assert.equal((await restoreLocal()).dataset.attempts.length,3);
});
test('read identity is commit-bound, preserved on restore and never unlocks a level',async()=>{
  await saveRead(marker);await saveRead(marker);await saveRead({...marker,source:{...marker.source,commit:'b'.repeat(40)}});
  const restored=(await restoreLocal()).dataset;assert.equal(restored.read.length,2);assert.equal(fromHistory([],restored.read).read.includes(readIdentity(marker)),true);assert.equal(status('M02',fromHistory([],restored.read)),'locked');
});
test('each predecessor must be valid, passed, already completed and persisted',async()=>{
  const next=successor();await assert.rejects(saveAttempt(next),/Voraussetzung/);
  await saveAttempt(passedAttempt);await saveAttempt(next);assert.equal((await restoreLocal()).dataset.attempts.length,2);
  const tooEarly={...next,id:crypto.randomUUID(),startedAt:passedAttempt.startedAt};await assert.rejects(saveAttempt(tooEarly),/Voraussetzung/);
  const invalid={...next,id:crypto.randomUUID(),prerequisites:[{trainingId:'M01',attemptId:failedRetry.id}]};await saveAttempt(failedRetry);await assert.rejects(saveAttempt(invalid),/Voraussetzung/);
});
test('corrupt records remain exportable, independent valid chains survive and dependents do not count',async()=>{
  await saveAttempt(passedAttempt);await saveAttempt(successor());await saveAttempt(changedVersionAttempt);
  await putRaw('attempts',{...passedAttempt,score:{...passedAttempt.score,earned:0}});
  const restored=await restoreLocal();assert.equal(restored.dataset.attempts.length,1);assert.equal(restored.problems.length,2);
  assert.equal((await recoveryExport() as any).entries.find((x:any)=>x.name==='attempts').values.length,3);
});
test('validation rejects unknown fields, versions, invalid score, UUID, timestamps, rule and answers',()=>{
  for(const change of [{schemaVersion:99},{extra:1},{id:'invented'},{completedAt:'2020-01-01T00:00:00.000Z'},{startedAt:'invalid'},{rule:{...passedAttempt.rule,pointsPerCorrect:2}},{answers:passedAttempt.answers.slice(1)},{answers:Array(4).fill(passedAttempt.answers[0])},{score:{...passedAttempt.score,passed:false}}])assert.throws(()=>validateAttempt({...passedAttempt,...change}));
  assert.equal(qualify([successor()]).valid.length,0);
  assert.throws(()=>completeAttempt(resumeAttempt(passedAttempt),'2020-01-01T00:00:00.000Z'),/Systemuhr/);
});
test('transaction abort after a successful add never creates a saved result; retry uses same ID',async()=>{
  const original=IDBObjectStore.prototype.add;
  try{IDBObjectStore.prototype.add=function(...args:Parameters<typeof original>){const r=original.apply(this,args);if(this.name==='attempts')r.addEventListener('success',()=>this.transaction.abort());return r;};await assert.rejects(saveAttempt(passedAttempt),/abgebrochen/);}finally{IDBObjectStore.prototype.add=original;}
  assert.equal((await restoreLocal()).dataset.attempts.length,0);assert.equal(status('M02',fromHistory((await restoreLocal()).dataset.attempts,[])),'locked');
  await saveAttempt(passedAttempt);await saveAttempt(passedAttempt);assert.equal((await restoreLocal()).dataset.attempts.length,1);
});
test('atomic merge, rollback on late archive conflict, idempotence and deliberate separate source adoption',async()=>{
  await settings(sameRepository);await importLocal(dataset);await importLocal(dataset);assert.equal((await restoreLocal()).dataset.attempts.length,3);assert.deepEqual(await settings(),sameRepository);
  const conflicting={...dataset,attempts:[successor()],legacy:[{...dataset.legacy[0],raw:legacyCorrupt,status:'corrupt'}]};await assert.rejects(importLocal(conflicting),/Voraussetzungsketten|Archiv/);
  // Self-contained incoming chain validates, but a conflict late in the transaction rolls all additions back.
  await assert.rejects(importLocal({...conflicting,attempts:[passedAttempt,successor()]}),/Archiv/);
  assert.equal((await restoreLocal()).dataset.attempts.length,3);
  for(const v of [{...dataset,schemaVersion:99},{...dataset,attempts:[successor()]},{...dataset,attempts:[passedAttempt,{...failedRetry,id:passedAttempt.id}]}]){assert.throws(()=>validateDataset(v));await assert.rejects(importLocal(v));}
  assert.equal((await restoreLocal()).dataset.attempts.length,3);
});
test('concurrent writes from separate connections preserve both attempts',async()=>{
  await Promise.all([saveAttempt(passedAttempt),saveAttempt(failedRetry)]);assert.equal((await restoreLocal()).dataset.attempts.length,2);
});
test('unknown stored version blocks reads and mutations, with raw recovery still available',async()=>{
  await saveAttempt(passedAttempt);await putRaw('meta',99,'schemaVersion');await assert.rejects(restoreLocal(),/Speicherversion/);await assert.rejects(saveAttempt(failedRetry),/Speicherversion/);
  assert.ok(await recoveryExport());
});
test('newer database version is never downgraded or deleted and remains available as raw recovery',async()=>{
  await saveAttempt(passedAttempt);
  await new Promise<void>((resolve,reject)=>{const r=indexedDB.open('ai-training-local',2);r.onerror=()=>reject(r.error);r.onsuccess=()=>{r.result.close();resolve();};});
  await assert.rejects(restoreLocal());await assert.rejects(saveAttempt(failedRetry));
  const raw=await recoveryExport() as any;assert.equal(raw.version,2);assert.equal(raw.entries.find((x:any)=>x.name==='attempts').values.length,1);
});
test('corrupt read/archive/config records stay raw and do not hide independent valid history',async()=>{
  await saveAttempt(passedAttempt);await putRaw('read',{...marker,path:'../bad.md'},'broken');await putRaw('legacy',{raw:legacyCorrupt},legacyKey);
  const db=await database();await new Promise<void>(resolve=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').put({schemaVersion:99},'sources');tx.oncomplete=()=>{db.close();resolve();};});
  const restored=await restoreLocal();assert.equal(restored.problems.length,3);assert.equal(restored.dataset.attempts.length,1);assert.equal(restored.dataset.read.length,0);assert.equal(restored.dataset.legacy.length,0);assert.deepEqual(restored.dataset.configuration.trainings,[]);
  const raw=await recoveryExport() as any;assert.equal(raw.entries.find((x:any)=>x.name==='read').values.length,1);
});
test('isolated stored pass flags and read markers never substitute for qualified attempts',async()=>{
  await putRaw('meta',['M01','M02'],'passed');await saveRead(marker);
  const restored=(await restoreLocal()).dataset,progress=fromHistory(restored.attempts,restored.read);
  assert.deepEqual(progress.passed,[]);assert.equal(status('M01',progress),'available');assert.equal(status('M02',progress),'locked');
  assert.throws(()=>validateDataset({...dataset,passed:['M01']}),/Sicherung/);
});
