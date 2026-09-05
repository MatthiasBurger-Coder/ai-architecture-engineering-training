# Beispiel 02 — Attention als gewichtete Kontextaggregation

Die Rechnung aus `exercises/02-attention-by-hand.md` verwendet drei Keys und Values. Der erste Key passt am stärksten zur Query `[1,0]`; nach Softmax wird der erste Value deshalb stärker berücksichtigt.

```text
Query ── Vergleich ──> Keys ── Softmax-Gewichte ──> Values
```

Wichtig: Die Gewichte sind kontext- und layerabhängig. Sie sind kein universelles Erklärungs- oder Relevanzmaß für die gesamte Modellentscheidung.
