# Training Reference Architecture

## Zweck

Die Module sind keine isolierten Tutorials. Jedes Modul liefert ein Bauteil für eine gemeinsame Referenzarchitektur.

```text
                         ┌────────────────────┐
                         │       User         │
                         └─────────┬──────────┘
                                   ↓
                         Intent / Situation
                                   ↓
             ┌──────────── Context Builder ────────────┐
             │                     ↑                   │
             │              Retrieval / RAG            │
             │                     ↑                   │
             │              Knowledge Sources          │
             └─────────────────────┬───────────────────┘
                                   ↓
                                Planner
                                   ↓
                         Capability Resolver
                                   ↓
                         Policy / Authorization
                                   ↓
                      Process / Execution Control
                                   ↓
                           MCP Client Layer
                         /         |          \
                        /          |           \
                 MCP Server    MCP Server    MCP Server
                     ↓              ↓             ↓
                External A     External B      Legacy API
                                   ↓
                         Validation / Audit
                                   ↓
                          Evaluation / Traces
```

## Architekturprinzipien

1. **LLM output is a proposal, not authority.**
2. **Tool availability is not authorization.**
3. **Deterministic invariants remain outside the model.**
4. **External content is untrusted by default.**
5. **Every side effect must be attributable and auditable.**
6. **Retrieval quality must be measured.**
7. **Agentic complexity requires justification.**
8. **Integration contracts are typed and validated.**
9. **Failures are explicit states, not prompts to improvise.**
10. **Quality includes correctness, safety, latency and cost.**

## Evidence Model

Jedes Modul sollte folgende Evidence liefern:

```text
evidence/
├── acceptance.md
├── test-results/
├── diagrams/
├── measurements/
└── decisions/
```

`acceptance.md` beantwortet:

- Was wurde gebaut?
- Welche Acceptance Criteria wurden erfüllt?
- Welche Tests beweisen das?
- Welche Messwerte liegen vor?
- Welche Grenzen/Trade-offs wurden entdeckt?
- Welche offenen Punkte bleiben?

## Lernmodus

Vor jedem Modul kann eine Challenge durchgeführt werden. Wird das Gate bereits ohne Lernmaterial bestanden, wird das Modul als **validated prior knowledge** dokumentiert und nicht künstlich wiederholt.
