import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, result, startAttempt, completeAttempt, resumeAttempt, gradingRule } from './quiz.ts';
import { questionSet, passedAttempt } from './contracts.fixtures.ts';
import type { QuestionSet } from './contracts.ts';
function questions(count:number):QuestionSet {
  return {...structuredClone(questionSet),questions:Array.from({length:count},(_,i)=>({...structuredClone(questionSet.questions[0]),id:`q-${i}`}))};
}
test('single-choice 75 percent uses integer thresholds for every score around small and large boundaries',()=>{
  for(const count of [1,3,4,5,7,99,100]){
    const q=questions(count),required=Math.ceil(3*count/4);
    for(let earned=0;earned<=count;earned++){
      const answers=Array.from({length:count},(_,i)=>i<earned?0:1);
      assert.deepEqual(grade(q,answers),{correct:earned,total:count,required,passed:earned>=required},`${earned}/${count}`);
    }
  }
});
test('malformed and empty snapshots cannot produce a passing result even through a direct grading call',()=>{
  for(const q of [questions(0),{...questionSet,schemaVersion:99},{...questionSet,questions:[questionSet.questions[0],questionSet.questions[0]]},{...questionSet,questions:null}]){
    assert.equal(grade(q as QuestionSet,[]),null);
  }
  assert.equal(grade(undefined,[]),null);
});
test('starting a test rejects invalid provenance as well as invalid questions',()=>{
  const p=passedAttempt.questions.provenance;
  for(const invalid of [{...p,commit:'abc'},{...p,commit:'A'.repeat(40)},{...p,source:{...p.source,path:'../quiz.json'}},{...p,extra:'unknown'}]){
    assert.throws(()=>startAttempt(questionSet,invalid));
  }
  assert.throws(()=>startAttempt(questions(0),p));
});
test('historical rule identity depends on field values and not JSON property order',()=>{
  const a=resumeAttempt(passedAttempt);
  a.rule={displayDecimals:2,pointsPerCorrect:1,threshold:{denominator:4,numerator:3},id:'single-choice-75-v1'};
  assert.equal(result('M01',a)?.correct,3);
  assert.deepEqual(completeAttempt(a,passedAttempt.completedAt).score,passedAttempt.score);
});
test('missing, sparse, excess and invalid positional answers never complete a test',()=>{
  const a=resumeAttempt(passedAttempt);
  for(const answers of [[],[0,0,0],Array(4),[0,0,0,0,0],[0,0,0,-1],[0,0,0,NaN],[0,0,0,Infinity],[0,0,0,0.1]]){
    assert.equal(result('M01',{...a,answers}),null);assert.throws(()=>completeAttempt({...a,answers},passedAttempt.completedAt));
  }
});
test('unknown or changed grading rules cannot complete or reinterpret a historical test',()=>{
  const a=resumeAttempt(passedAttempt);
  for(const rule of [{...gradingRule,extra:true},{...gradingRule,threshold:{numerator:2,denominator:4}},{...gradingRule,threshold:{...gradingRule.threshold,extra:true}},{...gradingRule,id:'other-rule'},{...gradingRule,pointsPerCorrect:2}]){
    const changed={...a,rule:rule as typeof gradingRule};assert.equal(result('M01',changed),null);assert.throws(()=>completeAttempt(changed,passedAttempt.completedAt));
  }
});
