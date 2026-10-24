import type { SourceConfiguration, SourceState, MaterialManifest, QuestionSet } from './contracts.ts';
import { GitSourceClient } from './git-source.ts';
import { SourceError, validateConfiguration, validateManifest, validateQuestions } from './source-validation.ts';
export type SourceKind='content'|'questions';
export class SourceStore {
  configuration:SourceConfiguration={schemaVersion:1,trainings:[]};
  states:Record<string,SourceState<MaterialManifest|QuestionSet>>={};
  private generations=new Map<string,number>();
  readonly client:GitSourceClient;
  private changed:()=>void;
  constructor(client=new GitSourceClient(),changed:()=>void=()=>{}) {this.client=client;this.changed=changed;}
  key(id:string,kind:SourceKind){return `${id}:${kind}`;}
  state(id:string,kind:SourceKind) {return this.states[this.key(id,kind)] || {state:'idle'} as const;}
  configure(input:unknown) {
    const next=validateConfiguration(input);
    for(const id of new Set([...this.configuration.trainings,...next.trainings].map(t=>t.trainingId)))for(const kind of ['content','questions'] as const) {
      const old=this.configuration.trainings.find(t=>t.trainingId===id)?.[kind];
      const source=next.trainings.find(t=>t.trainingId===id)?.[kind];
      if(JSON.stringify(old)!==JSON.stringify(source)) {
        const key=this.key(id,kind);this.generations.set(key,(this.generations.get(key)||0)+1);delete this.states[key];
      }
    }
    this.configuration=next;this.changed();
  }
  async load(id:string,kind:SourceKind) {
    const source=this.configuration.trainings.find(t=>t.trainingId===id)?.[kind];if(!source)return;
    const previous=this.state(id,kind);
    if(previous.state==='error' && previous.retryAt && Date.now()<Date.parse(previous.retryAt))return;
    const key=this.key(id,kind),generation=(this.generations.get(key)||0)+1;this.generations.set(key,generation);
    this.states[key]={state:'loading'};this.changed();
    try {
      const provenance=await this.client.resolve(source),raw=await this.client.json(provenance);
      const data=kind==='content'?validateManifest(raw,id):validateQuestions(raw,id);
      if(this.generations.get(key)===generation)this.states[key]={state:'ready',provenance,data};
    }catch(error) {
      const e=error instanceof SourceError?error:new SourceError('NETWORK','Quelle konnte nicht geladen werden.');
      if(this.generations.get(key)===generation)this.states[key]={state:'error',code:e.code,...(e.retryAt?{retryAt:e.retryAt}:{}),message:e.message};
    }finally{this.changed();}
  }
}
