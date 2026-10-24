import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { emptyProgress, status } from './progress.ts';
import { grade, result, startAttempt } from './quiz.ts';
import { questionSet, passedAttempt } from './contracts.fixtures.ts';
import { validateQuestions, validateManifest } from './source-validation.ts';
import { defaultSources } from './default-sources.ts';
const attempt=(id='M01')=>{
 const snapshot={...structuredClone(questionSet),trainingId:id as typeof questionSet.trainingId};
 const a=startAttempt(snapshot,passedAttempt.questions.provenance);a.answers=snapshot.questions.map(q=>q.options.findIndex(o=>o.id===q.correctOptionId));return a;
};
test('a new learner can only begin at the first module',()=>{
 const p=emptyProgress();assert.equal(status('M01',p),'available');assert.equal(status('M02',p),'locked');assert.equal(status('unknown',p),'locked');
});
test('all repository source files conform to the runtime contracts and default paths',async()=>{
 for(const t of defaultSources.trainings) {
  const q=validateQuestions(JSON.parse(await readFile(new URL('../../../'+t.questions.path,import.meta.url),'utf8')),t.trainingId);
  const m=validateManifest(JSON.parse(await readFile(new URL('../../../'+t.content.path,import.meta.url),'utf8')),t.trainingId);
  for(const f of m.materials)assert.ok((await readFile(new URL('../../../'+f.path,import.meta.url),'utf8')).trim());
  const answers=q.questions.map(x=>x.options.findIndex(o=>o.id===x.correctOptionId));
  assert.equal(grade(q,answers)?.passed,true);
  answers[0]=(answers[0]+1)%q.questions[0].options.length;assert.equal(grade(q,answers)?.passed,true);
  answers[1]=(answers[1]+1)%q.questions[1].options.length;assert.equal(grade(q,answers)?.passed,false);
 }
});
test('grading rejects missing, sparse, excess and invalid answers; historical snapshots survive updates',()=>{
 for(const answers of [[],[0,1,2],Array(4),[99,0,0,0],[-1,0,0,0],[0.5,0,0,0],[0,0,0,0,0]])assert.equal(grade(questionSet,answers),null);
 const a=attempt();const snapshot=structuredClone(a.snapshot);snapshot.questions[0].correctOptionId='guarantees';snapshot.version++;
 assert.equal(result('M01',a)?.correct,4);assert.equal(result('M02',a),null);
 assert.equal(grade(snapshot,a.answers)?.correct,3);
});
