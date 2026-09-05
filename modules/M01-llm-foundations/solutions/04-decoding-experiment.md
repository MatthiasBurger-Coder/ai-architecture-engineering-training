# Lösung 04 — Decoding

Erwartete qualitative Ergebnisse:

| Konfiguration | Erwartung |
|---|---|
| Temperature 0.5 | scharfe Verteilung, meist Top-Token |
| Temperature 1.0 | Baseline-Verteilung |
| Temperature 1.8 | flachere Verteilung, mehr Varianz |
| Top-k 2 | nur die zwei höchsten Kandidaten bleiben |
| Top-p 0.80 | dynamische Kandidatenmenge bis kumulativ 0,80 |

Gleiche Seeds und gleiche Eingabeverteilung müssen gleiche Samples liefern. Das beweist nur Reproduzierbarkeit des Labors, nicht semantische Korrektheit. In der Abgabe müssen die tatsächlichen Häufigkeiten stehen; diese hängen vom Seed-Bereich und vom verwendeten Sampler ab.
