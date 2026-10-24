# M02 Acceptance Criteria

| ID | Prüfung | Status | Evidence |
|---|---|---|---|
| M02-AC01 | JSON, Schema, Authorization korrekt differenziert | [ ] | lesson-checks.md |
| M02-AC02 | Drei vollständige Contracts inkl. Input/Output | [ ] | contracts-review.md |
| M02-AC03 | Mindestens acht negative Tests ausgeführt | [ ] | negative-tests.md |
| M02-AC04 | READ/WRITE/DESTRUCTIVE korrekt klassifiziert | [ ] | policy-review.md |
| M02-AC05 | Consent unabhängig vom Modell nachgewiesen | [ ] | policy-review.md |
| M02-AC06 | Replay + Revision-Konflikt reproduziert | [ ] | retry-experiment.md |
| M02-AC07 | Alle automatisierten Tests grün | [ ] | negative-tests.md |
| M02-AC08 | Threat Model und Architektur-Review | [ ] | architecture-review.md |

**Gate**: 8/8 Kriterien + Reviewer-Entscheidung. Materialgenerierung gilt ausdrücklich nicht als bestandener Lernnachweis.

```text
Command: python -m unittest discover -s tests -v
Python:
Commit:
Ergebnis:
Reviewer:
Decision: OPEN / ACCEPTED / BLOCKED
```
