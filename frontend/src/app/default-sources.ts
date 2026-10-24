import type { SourceConfiguration, TrainingId, GitSource } from './contracts.ts';
const directories=['M01-llm-foundations','M02-tool-calling','M03-mcp-engineering','M04-rag-retrieval','M05-context-engineering','M06-agentic-patterns','M07-evaluation-observability','M08-security-governance'];
export const defaultSources:SourceConfiguration={schemaVersion:1,trainings:[...directories.map(d=>({id:d.slice(0,3) as TrainingId,path:`modules/${d}`})),{id:'CAP' as const,path:'capstone'}].map(t=>{
  const source=(path:string):GitSource=>({provider:'github-public',repository:{owner:'MatthiasBurger-Coder',name:'ai-architecture-engineering-training'},ref:{kind:'branch',value:'main'},path});
  return {trainingId:t.id,content:source(`${t.path}/materials.json`),questions:source(`${t.path}/assessment/quiz.json`)};
})};
