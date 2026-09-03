# Detailed Training Roadmap

> Zielgruppe: erfahrener Software-/Backend-/Architektur-Engineer. Dieses Training wiederholt keine allgemeinen Programmier-, REST-, Docker-, CI/CD- oder Architekturgrundlagen.

---

# M01 — LLM & Transformer Foundations

## 1. Kurze Vorstellung

Ziel ist kein ML-Forschungsniveau. Benötigt wird ein belastbares mentales Modell von **Tokenisierung → Embeddings → Transformer/Self-Attention → Context Window → Decoding/Sampling** und der daraus folgenden Grenze zwischen probabilistischer und deterministischer Software.

## 2. Beispiel

```text
Text
 ↓
Tokenizer
 ↓
Tokens
 ↓
Embeddings + Position
 ↓
Transformer / Self-Attention
 ↓
Logits / Wahrscheinlichkeitsverteilung
 ↓
Decoding
 ↓
Nächstes Token
```

Beispiel-Frage: Warum kann `llm(input)` bei gleichem fachlichen Problem andere Ergebnisse erzeugen als eine klassische deterministische Funktion?

## 3. Trainingserfolg

Nachweisbar erklären können:

- Token vs. Embedding
- semantische Ähnlichkeit im Vektorraum
- Query/Key/Value als Arbeitsmodell von Attention
- Self-Attention und Kontextbezug
- Context Window
- Training vs. Inference
- Logits, Temperature, Top-p/Decoding
- Ursachen von Halluzinationen
- warum ein LLM keine Policy- oder Transaktionsgrenze ist

**Gate:** 10-Minuten-Whiteboard-Erklärung ohne Hilfsmittel + kleines Experiment mit unterschiedlichen Decoding-Einstellungen.

## 4. Übungen

1. Erkläre Token und Embedding mit einem eigenen Software-Engineering-Vergleich.
2. Zeichne den Datenfluss eines Transformer-Inference-Schritts.
3. Erkläre, warum mehr Context nicht automatisch bessere Antworten erzeugt.
4. Teste denselben Prompt mehrfach mit unterschiedlichen Sampling-Parametern und protokolliere die Varianz.
5. Entscheide für fünf Prozessschritte, ob LLM-Output direkt ausführbar sein darf.

## 5. Lösungen

- Token = diskrete Repräsentationseinheit; Embedding = dichter numerischer Vektor.
- Attention gewichtet Beziehungen zwischen Repräsentationen innerhalb des verfügbaren Kontexts.
- Mehr Context kann irrelevante/konfligierende Information und Kosten erhöhen.
- LLM-Ausgaben sind grundsätzlich als untrusted/probabilistic proposals zu behandeln, wenn sie Side Effects auslösen können.

---

# M02 — Structured Output & Tool Calling

## 1. Kurze Vorstellung

Dieses Modul verbindet probabilistische Modellentscheidungen mit typisierten Softwareverträgen. Kern sind **Structured Outputs, JSON Schema, Tool Contracts, Validation und Side-Effect-Klassen**.

## 2. Beispiel

```text
User
 ↓
LLM
 ↓ Tool proposal
{
  "name": "get_issue",
  "arguments": {"issue_id": 62}
}
 ↓
Schema Validation
 ↓
Policy
 ↓
Executor
```

## 3. Trainingserfolg

- Tool Schema entwerfen
- Required/optional/enum/range/pattern korrekt modellieren
- Tool Description so schreiben, dass Auswahlgrenzen klar sind
- Structured Output validieren
- Tool Result strukturiert zurückführen
- READ / WRITE / DESTRUCTIVE / PRIVILEGED klassifizieren
- Tool Selection von Authorization trennen
- Idempotenz und Retry-Risiken erkennen

**Gate:** Drei produktionsnahe Tool Contracts inklusive Tests und Permission Metadata.

## 4. Übungen

Entwirf `get_issue`, `create_issue`, `search_repository`, `update_issue`, `delete_repository` inklusive Input-/Output-Schema, Side Effects und Permission Class. Baue absichtlich ungültige Tool Calls und teste deren Ablehnung.

## 5. Lösungen

`get_issue` ist READ; `create/update_issue` sind WRITE; `delete_repository` ist DESTRUCTIVE/CRITICAL. Schema-Validität allein autorisiert keinen Call. Kritische Tools benötigen externe Policy und ggf. Human Approval.

---

# M03 — MCP Engineering

## 1. Kurze Vorstellung

MCP wird als Integrationsprotokoll praktisch beherrscht: **Host, Client, Server, Discovery, Tools, Resources, Prompts, Transport, Auth und Mapping auf bestehende APIs**.

## 2. Beispiel

```text
AI Host / CG
    ↓
MCP Client
    ↓ MCP
MCP Server
    ↓ mapping
Legacy REST API
```

REST:

```text
GET /api/issues/{id}?comments=true
```

MCP Tool:

```text
get_issue(issue_id: integer!, include_comments: boolean=false)
```

Mapping:

```text
issue_id          → path.id
include_comments  → query.comments
credential        → Authorization header
```

## 3. Trainingserfolg

- Wire-Level Request/Response lesen
- `tools/list` / `tools/call` verstehen
- Tool `inputSchema` und `outputSchema` lesen
- Transport- und Lifecycle-Modell erklären
- existierenden Server starten und inspizieren
- eigenen Server vor eine bekannte REST-API setzen
- MCP Client implementieren
- API→MCP-Mapping dokumentieren
- Fehler, Timeout und Server-Unavailability behandeln
- Auth und Credential Boundary erklären

**Gate:** eigener MCP Server + eigener Client + mindestens drei Tools + automatisierte Contract-/Integrationstests.

## 4. Übungen

1. Fremden MCP Server inspizieren.
2. Tool Discovery protokollieren.
3. Legacy-Test-API mit mindestens drei Endpoints bereitstellen.
4. MCP-Fassade implementieren.
5. 1:1 API-Tool und ein höherwertiges Tool bauen, das mehrere API-Calls kapselt.
6. Server-Ausfall simulieren.
7. Capability→MCP-Tool-Mapping implementieren.

## 5. Lösungen

MCP standardisiert die konsumierbare Tool-Schnittstelle, nicht das Upstream-Mapping. Das Mapping gehört in den Server/Adapter. Ein Serverausfall muss als kontrollierter Capability-/Tool-Fehler behandelt werden; ein LLM darf keine nicht autorisierte Ersatzaktion erfinden.

---

# M04 — RAG & Retrieval Engineering

## 1. Kurze Vorstellung

RAG wird als messbare Retrieval-Pipeline behandelt, nicht als Synonym für Vector DB.

## 2. Beispiel

```text
Documents
 ↓ Parse
Chunks + Metadata
 ↓
Index (lexical/vector)

Query
 ↓ Query Transformation
Retrieval
 ↓ Filter
Hybrid Merge
 ↓ Rerank
Context Selection
 ↓
LLM
```

## 3. Trainingserfolg

- Chunking-Strategien vergleichen
- Embeddings sinnvoll einsetzen
- Keyword/BM25 vs. Vector vs. Hybrid erklären
- Metadata Filtering
- Reranking
- Top-k und Context Budget
- Provenance/Citations
- Retrieval-Evaluation
- Freshness und Versionierung berücksichtigen

**Gate:** Benchmark auf eigenem Dokument-/Repository-Korpus mit Golden Queries; Entscheidung anhand gemessener Qualität.

## 4. Übungen

Baue Keyword-, Vector-, Hybrid- und Hybrid+Reranker-Varianten. Erstelle mindestens 20 Golden Queries mit erwarteter Evidenz. Miss Recall@k, MRR/nDCG oder begründet gewählte Metriken sowie Latenz.

## 5. Lösungen

Es gibt keinen universell besten Retriever. Gewonnen hat die Pipeline, die für den definierten Korpus und die Zielaufgaben die Quality Gates bei vertretbaren Kosten/Latenzen erfüllt.

---

# M05 — Context Engineering

## 1. Kurze Vorstellung

Context wird als bewusst konstruiertes Laufzeitartefakt behandelt: **Task + State + Evidence + History + Tools + Policies innerhalb eines Budgets**.

## 2. Beispiel

```text
System Rules ──────┐
Task ──────────────┤
Situation ─────────┤
Process State ─────┤
RAG Evidence ──────┼→ Context Builder → Model
Tool Results ──────┤
Allowed Tools ─────┤
Policy ────────────┘
```

## 3. Trainingserfolg

- Context Sources klassifizieren
- trusted/untrusted Content trennen
- Context Budget verwalten
- Relevanz und Freshness berücksichtigen
- History komprimieren
- Tool Results integrieren
- Context Provenance nachvollziehbar halten
- Minimal-, Maximal- und adaptive Strategien messen

**Gate:** Context Builder mit reproduzierbarer Auswahlentscheidung und Budget Enforcement.

## 4. Übungen

Baue für denselben Task drei Context-Strategien: minimal, maximal, adaptiv. Miss Task Success, Tokenverbrauch und Latenz. Injiziere irrelevante sowie widersprüchliche Dokumente.

## 5. Lösungen

Ziel ist nicht maximaler Context, sondern der kleinste hinreichende, relevante und vertrauenswürdig eingeordnete Context.

---

# M06 — Agentic Patterns & Planning

## 1. Kurze Vorstellung

Ziel ist die Architekturentscheidung zwischen **deterministischem Workflow, LLM-Step, Tool Calling, ReAct, Planner/Executor, Supervisor und Multi-Agent**.

## 2. Beispiel

```text
Known path? ── yes → deterministic workflow
    │ no
Semantic decision only? ── yes → bounded LLM step
    │ no
Unknown solution path? ── yes → planner/agent
                               ↓
                         policy constrained
```

## 3. Trainingserfolg

- Patterns erklären und vergleichen
- Agentic Complexity nur bei echtem Nutzen einsetzen
- Stop Conditions und Budgets definieren
- Planner von Executor trennen
- deterministische Invarianten schützen
- Human Approval platzieren
- Multi-Agent nur begründet einsetzen

**Gate:** Architecture Decision Record für mindestens fünf Business Cases + implementierter bounded Planner/Executor-Lab.

## 4. Übungen

Klassifiziere u.a. Rechnungsfreigabe, Support-Klassifikation, unbekannte Repository-Migration, Produktionsdeployment und Geldtransfer. Implementiere einen Agent Loop mit maximaler Schrittzahl, Tool Allowlist und explizitem Done-State.

## 5. Lösungen

Regeln/Transaktionen bleiben deterministisch; semantische Klassifikation kann bounded LLM sein; offene Analyse kann Planung benötigen. Agenten dürfen keine Autorisierungsgrenze ersetzen.

---

# M07 — Evaluation & Observability

## 1. Kurze Vorstellung

LLM-Systeme benötigen Engineering-Qualitätsnachweise: **Golden Sets, komponentenbezogene Metriken, End-to-End Task Success, Regression, Cost und Latency**.

## 2. Beispiel

```text
Golden Dataset
      ↓
System Version A/B
      ↓
Retrieval metrics
Tool-selection accuracy
Argument accuracy
Task success
Safety violations
Latency
Tokens / Cost
      ↓
Quality Gate
```

## 3. Trainingserfolg

- Offline-/Online-Evals unterscheiden
- Golden Dataset pflegen
- Retrieval und Generation getrennt messen
- Tool Selection/Arguments messen
- End-to-End Task Success definieren
- deterministische Assertions und model-based judging sinnvoll trennen
- Regression Gate in CI integrieren
- Traces/Events für Agent Runs modellieren

**Gate:** Eval Harness mit mindestens 50 Fällen und CI-fähigem Quality Gate.

## 4. Übungen

Ändere Prompt, Retriever, Tool Description und Modell jeweils separat. Miss Auswirkungen. Füge bekannte Failure Cases als Regression Tests hinzu.

## 5. Lösungen

Änderungen werden nicht nach subjektivem Eindruck übernommen. Definierte Metriken und Schwellenwerte entscheiden; Kosten-/Latenzregressionen gehören ebenfalls zur Bewertung.

---

# M08 — AI Security & Governance

## 1. Kurze Vorstellung

Probabilistische Komponenten werden niemals zur alleinigen Sicherheitsgrenze. Behandelt werden **Prompt Injection, Indirect Injection, Tool Poisoning, Exfiltration, Excessive Agency, Credential Boundaries, Least Privilege, Approval, Audit und Governance**.

## 2. Beispiel

```text
Untrusted Repository Content
          ↓
       Retrieval
          ↓
         LLM
          ↓ proposal
    Schema Validator
          ↓
      Policy Engine
          ↓
 Authorization / Scope
          ↓
 Human Approval (if required)
          ↓
       Executor
          ↓
        Audit
```

## 3. Trainingserfolg

- Direct/Indirect Prompt Injection unterscheiden
- untrusted Data als Daten und nicht als Autorität behandeln
- Tool Poisoning erkennen
- Least-Privilege Tool Exposure
- Credential Isolation
- Read/Write/Destructive Policies
- Human-in-the-loop
- vollständige Audit Chain
- Datenschutz-/Governance-Grundlagen
- EU-AI-Act-Grundstruktur und AI Literacy einordnen

**Gate:** dokumentiertes Threat Model + Red-Team-Suite + technische Policy Enforcement.

## 4. Übungen

Versuche über Dokumente `delete_issue`, `read_secret`, `send_secret` und `modify_production` auszulösen. Manipuliere Tool Descriptions. Simuliere kompromittierten MCP Server. Prüfe Auditierbarkeit.

## 5. Lösungen

Prompt-Regeln allein sind keine Security Boundary. Kritische Entscheidungen müssen außerhalb des LLM durch Schema, Policy, Authorization, Approval und Executor-Enforcement kontrolliert werden.

---

# CAPSTONE — Governed Agentic Automation System

## 1. Inhalt

Ein Unternehmen besitzt **GitHub, Ticketing/Wissenssystem und eine Legacy REST API**. Ein Engineering-Auftrag soll analysiert, mit Evidenz angereichert, geplant und teilweise automatisiert ausgeführt werden.

## 2. Zielarchitektur

```text
User
 ↓
Intent / Situation
 ↓
Context Builder ← Retrieval / Evidence
 ↓
Planner
 ↓
Capability Resolver
 ↓
Policy / Authorization
 ↓
Process / Execution Controller
 ↓
MCP Client Layer
 ├─ Source-Control MCP
 ├─ Ticketing MCP
 └─ Legacy MCP
 ↓
External Systems
 ↓
Validation / Audit / Evaluation
```

## 3. Abnahmekriterien

Das Capstone muss nachweisen:

- mindestens drei externe Tool-Familien
- mindestens ein selbst gebauter MCP Server
- Tool Discovery und typisierte Contracts
- RAG mit gemessener Retrieval-Qualität
- expliziter Context Builder
- mindestens ein deterministischer und ein agentischer Pfad
- Capability/Tool Resolution
- Policy Enforcement und mindestens ein Approval Gate
- Failure/Timeout/Retry-Verhalten
- Audit Trail
- Eval Suite
- Security Red-Team Cases
- Architektur- und Threat-Model-Dokumentation
- reproduzierbarer lokaler Start

## 4. Abschlussprüfung

Der Kandidat erhält einen neuen Business Case und muss ohne vorgegebene Lösung begründen:

1. Welche Schritte deterministisch bleiben.
2. Wo ein LLM sinnvoll ist.
3. Wo Retrieval benötigt wird.
4. Ob ein Agent erforderlich ist.
5. Welche Capabilities und Tools benötigt werden.
6. Welche MCP-Integrationen sinnvoll sind.
7. Welche Aktionen Approval benötigen.
8. Wie Qualität, Sicherheit, Kosten und Latenz gemessen werden.

## 5. Bestehensdefinition

Bestanden ist das Training, wenn die Lösung nicht nur funktioniert, sondern **architektonisch begründet, getestet, messbar, sicherheitsbegrenzt und reproduzierbar** ist.
