import type { QuestionSet, ResolvedSource, GradingRule, CompletedAttempt } from './contracts.ts';
import { validateQuestions, validateSource, commitSha } from './source-validation.ts';
export const gradingRule:GradingRule={id:'single-choice-75-v1',threshold:{numerator:3,denominator:4},pointsPerCorrect:1,displayDecimals:2};
export interface Attempt {
  id:string; startedAt:string; snapshot:QuestionSet; provenance:ResolvedSource; rule:GradingRule; answers:number[]; prerequisites?:CompletedAttempt['prerequisites'];
}
export function startAttempt(snapshot:QuestionSet,provenance:ResolvedSource):Attempt {
  return structuredClone({id:crypto.randomUUID(),startedAt:new Date().toISOString(),snapshot:validateQuestions(snapshot,snapshot.trainingId),provenance,rule:gradingRule,answers:[]});
}
export function grade(quiz:QuestionSet|undefined, answers:readonly number[]) {
  if(!quiz || !Array.isArray(answers) || answers.length!==quiz.questions.length || !quiz.questions.every((q,i)=>Number.isInteger(answers[i]) && answers[i]>=0 && answers[i]<q.options.length))return null;
  const correct=quiz.questions.filter((q,i)=>q.correctOptionId===q.options[answers[i]].id).length;
  const required=Math.ceil(3*quiz.questions.length/4);
  return {correct,total:quiz.questions.length,required,passed:correct>=required};
}
export function result(id:string,attempt:Attempt|undefined) {
  if(!attempt)return null;
  try {
    validateQuestions(attempt.snapshot,id);validateSource(attempt.provenance.source);
    if(!commitSha(attempt.provenance.commit) || JSON.stringify(attempt.rule)!==JSON.stringify(gradingRule))return null;
    return grade(attempt.snapshot,attempt.answers);
  }catch{return null;}
}

export function completeAttempt(attempt:Attempt, completedAt=new Date().toISOString()):CompletedAttempt {
  if(completedAt<attempt.startedAt)throw Error('Systemuhr liegt vor dem Teststart. Bitte die Uhr korrigieren und erneut auswerten.');
  const score=grade(attempt.snapshot,attempt.answers);
  if(!score)throw Error('Bitte zuerst alle Fragen beantworten.');
  return structuredClone({schemaVersion:attempt.snapshot.schemaVersion,id:attempt.id,trainingId:attempt.snapshot.trainingId,startedAt:attempt.startedAt,completedAt,
    questions:{provenance:attempt.provenance,snapshot:attempt.snapshot},rule:attempt.rule,
    answers:attempt.snapshot.questions.map((q,i)=>({questionId:q.id,optionId:q.options[attempt.answers[i]].id})),
    score:{earned:score.correct,possible:score.total,required:score.required,passed:score.passed},prerequisites:attempt.prerequisites || []});
}
export function resumeAttempt(a:CompletedAttempt):Attempt {
  return structuredClone({id:a.id,startedAt:a.startedAt,snapshot:a.questions.snapshot,provenance:a.questions.provenance,rule:a.rule,
    answers:a.questions.snapshot.questions.map(q=>q.options.findIndex(o=>o.id===a.answers.find(x=>x.questionId===q.id)?.optionId)),prerequisites:a.prerequisites});
}
