import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalize, status, decide } from './progress.ts';
import { quizzes, grade, result } from './quiz.ts';
const attempt=(id:string)=>({version:quizzes[id].version,answers:quizzes[id].questions.map(q=>q.correct)});
test('a new learner can only begin at the first module',()=>{
 const p=normalize(null); assert.equal(status('M01',p),'available');assert.equal(status('M02',p),'locked');assert.equal(status('unknown',p),'locked');
});
test('a gate requires a passed quiz and all evidence and cannot skip prerequisites',()=>{
 const p=normalize(null);assert.equal(decide('M01',p,[true,true,true]),p);
 const ready={...p,quizzes:{M01:attempt('M01'),M03:attempt('M03')}};
 assert.equal(decide('M01',ready,[true,false,true]),ready);assert.equal(decide('M03',ready,[true,true,true]),ready);
 const next=decide('M01',ready,[true,true,true]);assert.equal(status('M02',next),'available');assert.equal(status('M01',next),'passed');assert.equal(decide('M01',next,[true,true,true]),next);
});
test('stored data cannot introduce gaps, legacy checkbox passes or invalid structures',()=>{
 assert.deepEqual(normalize({passed:['M01','M03','CAP'],quizzes:{M01:attempt('M01')},read:[1,'lesson']}),{passed:['M01'],quizzes:{M01:attempt('M01')},read:['lesson']});
 assert.deepEqual(normalize('invalid'),{passed:[],read:[],quizzes:{}});
 assert.deepEqual(normalize({passed:['M01'],read:['lesson']}),{passed:[],read:['lesson'],quizzes:{}});
});
test('all trainings have valid questions and the 75 percent boundary is enforced',()=>{
 for(const id of ['M01','M02','M03','M04','M05','M06','M07','M08','CAP']){
  const answers=attempt(id).answers;
  assert.equal(quizzes[id].questions.length,4);
  for(const q of quizzes[id].questions){assert.ok(q.explanation.length>0);assert.ok(q.correct>=0&&q.correct<q.options.length);}
  assert.deepEqual(grade(id,answers),{correct:4,total:4,required:3,passed:true});
  answers[0]=(answers[0]+1)%3;assert.equal(grade(id,answers)?.passed,true);
  answers[1]=(answers[1]+1)%3;assert.equal(grade(id,answers)?.passed,false);
 }
});
test('incomplete or invalid answers and stale quiz versions cannot yield a result',()=>{
 for(const answers of [[],[0,1,2],Array(4),[99,0,0,0],[-1,0,0,0],[0.5,0,0,0]])assert.equal(grade('M01',answers),null);
 assert.equal(grade('unknown',[0,0,0,0]),null);
 assert.equal(result('M01',{...attempt('M01'),version:0}),null);
 assert.deepEqual(normalize({quizzes:{M01:{...attempt('M01'),version:0},M02:{version:1,answers:[99]},CAP:null}}).quizzes,{});
});
test('quiz results survive storage and failed attempts cannot unlock a gate',()=>{
 const p={...normalize(null),quizzes:{M01:attempt('M01')}};
 assert.deepEqual(normalize(JSON.parse(JSON.stringify(p))),p);
 const failed={...p,quizzes:{M01:{version:1,answers:[0,1,0,0]}}};
 assert.equal(result('M01',failed.quizzes.M01)?.passed,false);
 assert.equal(decide('M01',failed,[true,true,true]),failed);
});
