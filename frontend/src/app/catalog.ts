export interface Training { id: string; title: string; subtitle: string; outcome: string; hours: string; skills: string[]; }
export const trainings: Training[] = [
{id:'M01',title:'LLM Foundations',subtitle:'Das technische Fundament',outcome:'Was kann ein LLM technisch garantieren – und was nicht?',hours:'8–10 h',skills:['Tokens & Embeddings','Self-Attention','Engineering Boundaries']},
{id:'M02',title:'Tool Calling',subtitle:'Von Vorschlägen zu Verträgen',outcome:'Wie wird probabilistischer Output zu kontrollierbaren Softwareverträgen?',hours:'10–14 h',skills:['JSON Schema','Tool Contracts','Validation & Policy']},
{id:'M03',title:'MCP Engineering',subtitle:'Systeme sicher verbinden',outcome:'Wie werden externe Systeme standardisiert als KI-Tools verfügbar?',hours:'nach Umfang',skills:['Host / Client / Server','Transport','Authentifizierung']},
{id:'M04',title:'RAG & Retrieval',subtitle:'Wissen mit Herkunft',outcome:'Wie erhält das Modell belastbare externe Evidenz?',hours:'nach Umfang',skills:['Hybrid Retrieval','Reranking','Provenance']},
{id:'M05',title:'Context Engineering',subtitle:'Die richtige Information',outcome:'Welche Information bekommt das Modell für genau diesen Schritt?',hours:'nach Umfang',skills:['Context Assembly','Token Budgets','State & Evidence']},
{id:'M06',title:'Agentic Patterns',subtitle:'Planung mit klaren Grenzen',outcome:'Wann Workflow, wann LLM, wann Agent?',hours:'nach Umfang',skills:['Planner / Executor','ReAct','Deterministische Grenzen']},
{id:'M07',title:'Evaluation',subtitle:'Qualität messbar machen',outcome:'Wie beweisen wir, dass das System besser und nicht nur anders ist?',hours:'nach Umfang',skills:['Golden Sets','Regression','Cost & Latency']},
{id:'M08',title:'Security & Governance',subtitle:'Verantwortung als Architektur',outcome:'Wie bleiben Berechtigungen und Policies außerhalb des Modells?',hours:'nach Umfang',skills:['Prompt Injection','Least Privilege','Audit']},
{id:'CAP',title:'Governed Agentic System',subtitle:'Dein Capstone',outcome:'Alle Bausteine in einem überprüfbaren End-to-End-System verbinden.',hours:'nach Umfang',skills:['Referenzarchitektur','End-to-End Evidence','Architekturentscheidungen']}
];
