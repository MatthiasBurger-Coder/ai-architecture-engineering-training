import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import type { CompletedAttempt, TrainingId } from './contracts.ts';
import { ancestors, coreIds, trainingIds } from './catalog-policy.ts';
import { fromHistory, status } from './progress.ts';
import { qualify, validateAttempt, validateDataset } from './local-data.ts';
import { validateConfiguration, validateManifest, validateQuestions } from './source-validation.ts';
import { passedAttempt, questionSet, sameRepository, dataset } from './contracts.fixtures.ts';
import { saveAttempt, importLocal, restoreLocal, settings } from './local-store.ts';
beforeEach(()=>{globalThis.indexedDB=new IDBFactory();});
function attempt(id:TrainingId,earlier:CompletedAttempt[]):CompletedAttempt {
  const i=trainingIds.indexOf(id),schemaVersion=id==='M09'?2:1;
  return {...structuredClone(passedAttempt),schemaVersion,id:crypto.randomUUID(),trainingId:id,
    startedAt:`2026-10-24T16:${String(i*2).padStart(2,'0')}:00.000Z`,completedAt:`2026-10-24T16:${String(i*2+1).padStart(2,'0')}:00.000Z`,
    questions:{...structuredClone(passedAttempt.questions),snapshot:{...structuredClone(questionSet),schemaVersion,trainingId:id}},
    prerequisites:ancestors(id).map(trainingId=>({trainingId,attemptId:earlier.find(a=>a.trainingId===trainingId)!.id}))};
}
test('M09 is available after M01 independently from M02; it never blocks the core path',()=>{
  const empty=fromHistory([],[]);assert.equal(status('M09',empty),'locked');
  const root=attempt('M01',[]),optional=attempt('M09',[root]),m02=attempt('M02',[root]);
  const afterRoot=fromHistory([root],[]);assert.equal(status('M09',afterRoot),'available');assert.equal(status('M02',afterRoot),'available');
  assert.equal(status('M03',fromHistory([root,optional],[])),'locked');assert.equal(status('M03',fromHistory([root,m02],[])),'available');
  const core:CompletedAttempt[]=[];for(const id of coreIds)core.push(attempt(id,core));
  const checked=qualify(core);assert.equal(checked.invalid.length,0);assert.equal(status('CAP',fromHistory(checked.valid,[])),'passed');assert.equal(status('M09',fromHistory(checked.valid,[])),'available');
  assert.ok(!core.at(-1)!.prerequisites.some(p=>p.trainingId==='M09'));
});
test('v1 envelopes stay frozen; M09 sources, questions, manifests and attempts require explicit v2',()=>{
  const source={...sameRepository.trainings[0],trainingId:'M09'};
  assert.throws(()=>validateConfiguration({schemaVersion:1,trainings:[source]}));assert.equal(validateConfiguration({schemaVersion:2,trainings:[source]}).trainings[0].trainingId,'M09');
  assert.throws(()=>validateQuestions({...questionSet,trainingId:'M09'},'M09'));assert.equal(validateQuestions({...questionSet,schemaVersion:2,trainingId:'M09'},'M09').schemaVersion,2);
  const manifest={schemaVersion:2,trainingId:'M09',materials:[{id:'overview',title:'M09',kind:'overview',path:'modules/M09/README.md'}]};assert.equal(validateManifest(manifest,'M09').schemaVersion,2);assert.throws(()=>validateManifest({...manifest,schemaVersion:1},'M09'));
  const root=attempt('M01',[]),optional=attempt('M09',[root]);assert.equal(validateAttempt(optional).schemaVersion,2);assert.throws(()=>validateAttempt({...optional,schemaVersion:1}));
  assert.throws(()=>validateDataset({...dataset,attempts:[root,optional]}));assert.equal(validateDataset({...dataset,schemaVersion:2,attempts:[root,optional]}).attempts.length,2);
  assert.deepEqual(validateDataset(dataset),dataset);
});
test('existing v1 history and configuration survive restore/import without rewriting or silently adding M09',async()=>{
  await settings(sameRepository);await importLocal(dataset);const before=structuredClone((await restoreLocal()).dataset.attempts);
  assert.deepEqual(await settings(),sameRepository);assert.equal((await restoreLocal()).dataset.schemaVersion,2);
  const root=before.find(a=>a.id===passedAttempt.id)!,optional=attempt('M09',[root]);await saveAttempt(optional);
  const restored=(await restoreLocal()).dataset;assert.deepEqual(restored.attempts.filter(a=>a.trainingId!=='M09'),before);assert.equal(restored.attempts.length,4);assert.deepEqual(await settings(),sameRepository);assert.equal(status('M02',fromHistory(restored.attempts,[])),'available');
  await importLocal(restored);assert.equal((await restoreLocal()).dataset.attempts.length,4);
});
test('M09 cannot be persisted without its exact, already saved M01 prerequisite',async()=>{
  const root=attempt('M01',[]),optional=attempt('M09',[root]);await assert.rejects(saveAttempt(optional),/Voraussetzung/);
  await saveAttempt(root);await saveAttempt(optional);await saveAttempt(optional);assert.equal((await restoreLocal()).dataset.attempts.length,2);
  const forged={...optional,id:crypto.randomUUID(),prerequisites:[]};await assert.rejects(saveAttempt(forged),/Voraussetzungen/);
});
