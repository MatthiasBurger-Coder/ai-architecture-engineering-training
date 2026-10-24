# Referenzlösung 02 — Gewichte, GGUF, NF4 und Q4_K_S

> Erst nach eigenem Versuch lesen.

GGUF Q4_K_S: komprimierte Inferenzgewichte; BF16/FP16: höherpräzise Modellgewichte; NF4: 4-bit-Basis für effizientes Adaptertraining; LoRA: kleine trainierbare Delta-Gewichte. Ein Adapter referenziert ein konkretes Basismodell mit passenden Layern und Matrizen und kann nicht auf andere Modellgrößen übertragen werden.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
