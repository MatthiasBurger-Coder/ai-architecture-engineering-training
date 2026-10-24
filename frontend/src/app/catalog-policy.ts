import type { TrainingId } from './contracts.ts';
/** v1 remains frozen; v2 adds an optional branch without changing the core path. */
export const coreIds = ['M01','M02','M03','M04','M05','M06','M07','M08','CAP'] as const;
export const trainingIds = ['M01','M09','M02','M03','M04','M05','M06','M07','M08','CAP'] as const;
export const prerequisites:Record<string,TrainingId[]>={
  M01:[],M09:['M01'],M02:['M01'],M03:['M02'],M04:['M03'],M05:['M04'],M06:['M05'],M07:['M06'],M08:['M07'],CAP:['M08'],
};
export const supportedVersion=(v:unknown):v is 1|2=>v===1 || v===2;
export const knownTraining=(id:unknown,version:unknown)=>supportedVersion(version) && (version===1?coreIds:trainingIds).some(x=>x===id);
/** Every ancestor is persisted in the completion, as required by v1 as well. */
export function ancestors(id:string):TrainingId[]{
  const all=new Set<TrainingId>();
  const visit=(value:string)=>{for(const p of prerequisites[value] || []){visit(p);all.add(p);}};visit(id);
  return trainingIds.filter(x=>all.has(x));
}
