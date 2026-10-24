import type { CompletedAttempt, ReadMarker } from './contracts.ts';
import { resumeAttempt } from './quiz.ts';
import { readIdentity } from './local-data.ts';
import type { Attempt } from './quiz.ts';
export interface Progress { passed: string[]; read: string[]; quizzes: Record<string, Attempt>; }
import { trainingIds, prerequisites } from './catalog-policy.ts';
export const ids:readonly string[]=trainingIds;
export { prerequisites } from './catalog-policy.ts';
export function emptyProgress():Progress { return {passed:[],read:[],quizzes:{}}; }
export function status(id: string, progress: Progress): 'passed' | 'available' | 'locked' {
  const i=ids.indexOf(id);
  if(i<0) return 'locked';
  if(progress.passed.includes(id)) return 'passed';
  return prerequisites[id].every(p=>progress.passed.includes(p))?'available':'locked';
}
/** Input consists exclusively of validated, transactionally persisted attempts. */
export function fromHistory(attempts:CompletedAttempt[],read:ReadMarker[]):Progress {
  const passed:string[]=[],quizzes:Record<string,Attempt>={};
  for(const id of ids){
    const history=attempts.filter(a=>a.trainingId===id).sort((a,b)=>a.completedAt.localeCompare(b.completedAt)||a.id.localeCompare(b.id));
    if(history.length)quizzes[id]=resumeAttempt(history.at(-1)!);
    if(history.some(a=>a.score.passed))passed.push(id);
  }
  return {passed,quizzes,read:read.map(readIdentity)};
}
