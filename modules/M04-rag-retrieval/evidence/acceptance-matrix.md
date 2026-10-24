# M04 Acceptance Criteria

| ID | Kriterium | Status | Evidence |
|---|---|---|---|
| M04-AC01 | Ingestion, Chunking, Provenance, Versionierung erklärt | [ ] | ingestion-review.md |
| M04-AC02 | Eigener Korpus und mindestens 12 Golden Queries dokumentiert | [ ] | retrieval-benchmark.md |
| M04-AC03 | Lexical/Dense/Hybrid verglichen und Tradeoffs begründet | [ ] | retrieval-benchmark.md |
| M04-AC04 | Recall@k, MRR, P95 reproduzierbar ausgewertet | [ ] | evaluation-review.md |
| M04-AC05 | ACL/PII- und Injection-Negativtests bestanden | [ ] | security-review.md |
| M04-AC06 | Upsert, Replay, Delete, Out-of-Order demonstriert | [ ] | streaming-review.md |
| M04-AC07 | Automatisierte Unit-Tests dokumentiert grün | [ ] | capstone-review.md |
| M04-AC08 | Grounding, Attribution, Grenzen und Capstone Review | [ ] | capstone-review.md |

**Gate:** 8/8 akzeptiert, Pflicht: AC02–AC07, dokumentierte Reviewer-Entscheidung.

```
Command: python -m unittest discover -s tests -v
Python:
Commit:
Observed:
Reviewer:
Decision: OPEN / ACCEPTED / BLOCKED
```
