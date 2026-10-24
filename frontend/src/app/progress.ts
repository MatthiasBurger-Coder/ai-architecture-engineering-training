import { result, type Attempt } from './quiz.ts';
export interface Progress { passed: string[]; read: string[]; quizzes: Record<string, Attempt>; }
export const ids = ['M01','M02','M03','M04','M05','M06','M07','M08','CAP'];
export function normalize(value: unknown): Progress {
  const p=value as Partial<Progress> | null;
  const quizzes: Record<string, Attempt>={};
  for(const id of ids) {
    const attempt=p?.quizzes?.[id];
    if(result(id,attempt)) quizzes[id]=structuredClone(attempt!);
  }
  const passed: string[]=[];
  for(const id of ids) { if(Array.isArray(p?.passed) && p.passed.includes(id) && result(id,quizzes[id])?.passed) passed.push(id); else break; }
  return {passed,quizzes,read:Array.isArray(p?.read)?p.read.filter((x): x is string=>typeof x==='string'):[]};
}
export function status(id: string, progress: Progress): 'passed' | 'available' | 'locked' {
  const i=ids.indexOf(id);
  if(i<0) return 'locked';
  if(progress.passed.includes(id)) return 'passed';
  return i===0 || progress.passed.includes(ids[i-1])?'available':'locked';
}
export function decide(id: string, progress: Progress, gates: boolean[]): Progress {
  if(!result(id,progress.quizzes[id])?.passed || status(id,progress)!=='available' || gates.length!==3 || !gates.every(Boolean)) return progress;
  return {...progress,passed:[...progress.passed,id]};
}
