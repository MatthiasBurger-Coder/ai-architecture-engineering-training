# Beispiel 03 — Logits zu Samples

Das Toy-Labor verwendet feste Logits und verändert ausschließlich die Decoding-Konfiguration. So wird isoliert sichtbar, dass Temperature, Top-k und Top-p die Auswahlverteilung ändern.

```text
logits → temperature scaling → softmax → filtering → sampling
```

Ein fairer Vergleich hält Logits, Label-Reihenfolge und Seed-Bereich konstant. Die Sample-Häufigkeit ist eine Beobachtung der Konfiguration, keine Bewertung der faktischen Qualität.
