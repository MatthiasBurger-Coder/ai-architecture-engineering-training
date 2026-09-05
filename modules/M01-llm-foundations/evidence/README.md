# Evidence für M01

Evidence muss zeigen, dass Kompetenz demonstriert wurde. Kopiere keine Referenzlösung als Nachweis. Eigene Artefakte dürfen als Markdown, PNG/SVG, CSV oder Textprotokoll abgelegt werden.

## Erwartete Artefakte

```text
evidence/
├── README.md
├── acceptance-matrix.md
├── system-model.md
├── attention-calculation.md
├── context-budget.md
├── decoding-experiment.md
├── architecture-boundary.md
├── lesson-checks.md
└── whiteboard-review.md
```

## Qualitätsregeln

- Experimentprotokolle enthalten Datum, Python-Version, Seed, Parameter und Beobachtung.
- Screenshots allein sind kein ausreichender Nachweis; der auszuführende Befehl und die Kernergebnisse müssen lesbar sein.
- Jede Architekturentscheidung nennt mindestens Risiko, Alternative und Boundary.
- Ein nicht erfülltes Kriterium bleibt `[ ]` und erhält eine kurze Blockerbeschreibung.
- Die Evidence enthält keine echten API-Schlüssel, personenbezogenen Daten oder Produktionsgeheimnisse.
