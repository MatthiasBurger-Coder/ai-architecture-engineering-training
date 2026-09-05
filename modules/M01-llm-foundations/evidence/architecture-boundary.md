# Evidence — Architekturgrenze

| Step | Classification | Failure cost | Deterministic boundary / control |
|---|---|---|---|
| Intent extraction | | | |
| Service identification | | | |
| Authorization | | | |
| Plan formulation | | | |
| Production deployment | | | |
| Smoke test | | | |
| Rollback | | | |

## Boundary

```text
LLM proposal → typed validation → authorization/policy → executor → verification
```

## Entscheidung

<!-- Begründe, warum kein LLM-Output die Policy- oder Berechtigungsprüfung
umgehen darf. Nenne eine Alternative und ihr Risiko. -->

