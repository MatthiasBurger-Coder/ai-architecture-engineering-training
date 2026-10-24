import type { CompletedAttempt, ReadMarker } from './contracts.ts';
import { resumeAttempt } from './quiz.ts';
import { readIdentity } from './local-data.ts';
import type { Attempt } from './quiz.ts';
export interface Progress { passed: string[]; read: string[]; quizzes: Record<string, Attempt>; }
export const ids = ['M01','M02','M03','M04','M05','M06','M07','M08','CAP'];
export function emptyProgress():Progress { return {passed:[],read:[],quizzes:{}}; }
export function status(id: string, progress: Progress): 'passed' | 'available' | 'locked' {
  const i=ids.indexOf(id);
  if(i<0) return 'locked';
  if(progress.passed.includes(id)) return 'passed';
  return i===0 || progress.passed.includes(ids[i-1])?'available':'locked';
}
/** Input consists exclusively of validated, transactionally persisted attempts. */
export function fromHistory(attempts:CompletedAttempt[],read:ReadMarker[]):Progress {
  const passed:string[]=[],quizzes:Record<string,Attempt>={};
  for(const id of ids){
    const history=attempts.filter(a=>a.trainingId===id).sort((a,b)=>a.completedAt.localeCompare(b.completedAt)||a.id.localeCompare(b.id));
    if(history.length)quizzes[id]=resumeAttempt(history.at(-1)!);
    if(passed.length===ids.indexOf(id) && history.some(a=>a.score.passed))passed.push(id);
  }
  return {passed,quizzes,read:read.map(readIdentity)};
}
