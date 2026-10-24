import { result, type Attempt } from './quiz.ts';
export interface Progress { passed: string[]; read: string[]; quizzes: Record<string, Attempt>; }

/** Demo graph: M09 is an optional track after M01; CAP still requires M08. */
export const ids = ['M01','M09','M02','M03','M04','M05','M06','M07','M08','CAP'];
export const prerequisites: Record<string,string[]> = {
 M01:[], M09:['M01'], M02:['M01'], M03:['M02'], M04:['M03'],
 M05:['M04'], M06:['M05'], M07:['M06'], M08:['M07'], CAP:['M08']
};

export function normalize(value: unknown): Progress {
 const p=value as Partial<Progress> | null;
 const quizzes: Record<string,Attempt>={};
 for(const id of ids){
  const candidate=p?.quizzes?.[id];
  if(result(id,candidate)) quizzes[id]={version:candidate!.version,answers:[...candidate!.answers]};
 }
 const passed: string[]=[];
 // Validate the full DAG from its roots. A forged later completion cannot bypass prerequisites.
 for(const id of ids){
  if(Array.isArray(p?.passed) && p.passed.includes(id) &&
     result(id,quizzes[id])?.passed &&
     (prerequisites[id]??[]).every(required=>passed.includes(required))) passed.push(id);
 }
 return {passed,quizzes,read:Array.isArray(p?.read)?p.read.filter((x):x is string=>typeof x==='string'):[]};
}
export function status(id:string, progress:Progress):'passed'|'available'|'locked' {
 if(!ids.includes(id)) return 'locked';
 if(progress.passed.includes(id)) return 'passed';
 return (prerequisites[id]??[]).every(required=>progress.passed.includes(required))?'available':'locked';
}
export function decide(id:string,progress:Progress,gates:boolean[]):Progress {
 if(!result(id,progress.quizzes[id])?.passed ||
    status(id,progress)!=='available' ||
    gates.length!==3 || !gates.every(Boolean)) return progress;
 return {...progress,passed:[...progress.passed,id]};
}
