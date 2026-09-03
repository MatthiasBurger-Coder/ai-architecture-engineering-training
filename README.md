# AI Architecture Engineering Training

Ein praxisorientiertes Gap-Closing-Programm für erfahrene Software Engineers auf dem Weg zu **AI Automation / Agentic Systems / AI Architecture Engineering**.

Dieses Repository ist gleichzeitig **Trainingsumgebung, Engineering-Labor und prüfbares Portfolio**. Ziel ist nicht, KI-Tools bedienen zu lernen, sondern robuste KI-gestützte Systeme analysieren, entwerfen, implementieren, absichern und messen zu können.

## Zielbild

Nach Abschluss kann ein unbekannter Geschäftsprozess analysiert und begründet zerlegt werden in:

- deterministische Prozessschritte,
- semantische LLM-Aufgaben,
- Retrieval/RAG,
- Tool Calls,
- agentische Planung,
- MCP-basierte Integrationen,
- Policy- und Approval-Gates,
- Evaluation und Observability.

Die Abschlusskompetenz lautet:

> Ich kann entscheiden, **wo KI sinnvoll ist, wo sie nicht entscheiden darf, welche Capabilities und Tools benötigt werden und wie das Gesamtsystem reproduzierbar, sicher und messbar betrieben wird.**

## Trainingsprinzip

Jedes Modul folgt derselben Struktur:

1. **Kurze Vorstellung des Inhalts**
2. **Beispiel / Diagramm**
3. **Trainingserfolg / messbare Acceptance Criteria**
4. **Übungen**
5. **Lösungen / Referenzlösungen**
6. **Evidence** als technischer Nachweis

Eine Checkbox wird nicht durch Lesen abgeschlossen, sondern erst durch nachgewiesene Kompetenz.

## Roadmap

- [ ] **M01 – LLM & Transformer Foundations** — Tokens, Embeddings, Attention, Context Window, Probabilistik
- [ ] **M02 – Structured Output & Tool Calling** — JSON Schema, Tool Contracts, Validation, Side Effects
- [ ] **M03 – MCP Engineering** — Host/Client/Server, Discovery, Tools, Transport, API→MCP Mapping, Auth
- [ ] **M04 – RAG & Retrieval Engineering** — Chunking, Embeddings, Hybrid Retrieval, Filtering, Reranking, Provenance
- [ ] **M05 – Context Engineering** — Context Assembly, Budgets, State, Evidence, Tool Context
- [ ] **M06 – Agentic Patterns & Planning** — Workflow vs. Agent, ReAct, Planner/Executor, Supervisor, deterministic boundaries
- [ ] **M07 – Evaluation & Observability** — Golden Sets, Retrieval/Tool/Task Metrics, Regression, Cost, Latency
- [ ] **M08 – AI Security & Governance** — Prompt Injection, Tool Poisoning, Least Privilege, Approval, Audit, EU AI Act
- [ ] **CAPSTONE – Governed Agentic Automation System** — vollständige Referenzarchitektur

## Lernpfad

```text
LLM Foundations
      ↓
Structured Output / Tool Calling
      ↓
MCP Engineering
      ↓
RAG / Retrieval
      ↓
Context Engineering
      ↓
Agentic Planning
      ↓
Evaluation
      ↓
Security / Governance
      ↓
CAPSTONE
```

## Definition of Done des Gesamttrainings

Das Training ist bestanden, wenn für einen unbekannten Business Case nachvollziehbar gezeigt werden kann:

```text
Business Goal
     ↓
Process Analysis
     ↓
Intent / Context / Situation
     ↓
Retrieval / Evidence
     ↓
Planner
     ↓
Capability Resolution
     ↓
Policy / Authorization
     ↓
Tool / MCP Selection
     ↓
Controlled Execution
     ↓
Validation
     ↓
Audit + Evaluation
```

Dabei müssen Entscheidungen begründet werden können: **Warum deterministisch? Warum LLM? Warum RAG? Warum Agent? Warum MCP? Welche Sicherheitsgrenze? Wie wird Erfolg gemessen?**

## Repository-Struktur

```text
ai-architecture-engineering-training/
├── README.md
├── ROADMAP.md
├── ARCHITECTURE.md
├── SECURITY.md
├── modules/
│   ├── M01-llm-foundations/
│   ├── M02-tool-calling/
│   ├── M03-mcp-engineering/
│   ├── M04-rag-retrieval/
│   ├── M05-context-engineering/
│   ├── M06-agentic-patterns/
│   ├── M07-evaluation-observability/
│   └── M08-security-governance/
├── labs/
└── capstone/
```

## Geschätzter Aufwand

**50–70 fokussierte Stunden** inklusive Implementierung und Evidence. Vorwissen wird per Challenge geprüft und nicht künstlich erneut trainiert.

## Module

| Modul | Kernfrage | Praktischer Nachweis |
|---|---|---|
| M01 | Was kann ein LLM technisch garantieren – und was nicht? | Erklärung + Experimente |
| M02 | Wie wird probabilistischer Output zu kontrollierbaren Softwareverträgen? | Tool Contracts + Validator |
| M03 | Wie werden externe Systeme standardisiert als KI-Tools verfügbar? | MCP Server + Client + Mapping |
| M04 | Wie erhält das Modell belastbare externe Evidenz? | gemessene Retrieval-Pipeline |
| M05 | Welche Information bekommt das Modell für genau diesen Schritt? | Context Builder |
| M06 | Wann Workflow, wann LLM, wann Agent? | Pattern-Entscheidung + Agent Lab |
| M07 | Wie beweisen wir, dass das System besser und nicht nur anders ist? | Eval Harness + Quality Gate |
| M08 | Wie verhindern wir, dass probabilistische Entscheidungen zur Sicherheitsgrenze werden? | Red-Team + Policy Gate |
| Capstone | Funktioniert alles zusammen? | End-to-End System + Evidence |

Siehe [ROADMAP.md](./ROADMAP.md) für die detaillierten Module und Acceptance Criteria.
