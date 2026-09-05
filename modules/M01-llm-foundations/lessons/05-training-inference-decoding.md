# Kapitel 05 — Training, Inference und Decoding

## Lernziel

Nach diesem Kapitel kannst du Parameterlernen und Antwortgenerierung trennen und erklären, wie Decoding die beobachtete Varianz beeinflusst.

## 1. Training

Im Training werden Eingabesequenzen verwendet, um Vorhersagefehler zu berechnen. Ein Optimierungsverfahren verändert Parameter so, dass der Loss über die Trainingsaufgaben sinkt. Training umfasst Daten, Zieldefinition, Optimierer, Regularisierung, Checkpoints und Evaluation. Das Ergebnis sind Parameter, keine Sammlung garantiert abrufbarer Fakten.

## 2. Inference

Bei der Inference werden die Parameter auf einen konkreten Kontext angewendet. Der Forward Pass erzeugt Aktivierungen und am Ende Logits für mögliche nächste Tokens. Üblicherweise werden dabei keine Modellgewichte verändert. Kontext und Decoding-Konfiguration gehören zum einzelnen Lauf.

## 3. Logits und Softmax

Logits sind rohe, relative Scores. Softmax erzeugt daraus:

```text
pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)
```

Die Werte summieren sich zu 1 und können als Auswahlverteilung verwendet werden. Sie sind keine objektiven Wahrheitswahrscheinlichkeiten. Ein Token kann mit hoher Modellwahrscheinlichkeit falsch sein.

## 4. Temperature, Top-k und Top-p

Temperature skaliert die Logits vor Softmax. Kleine Werte machen die Verteilung spitzer, größere Werte flacher. Top-k lässt nur die k wahrscheinlichsten Kandidaten zu. Top-p sortiert Kandidaten und behält die kleinste Menge, deren kumulative Wahrscheinlichkeit mindestens `p` erreicht. Danach wird normalerweise renormalisiert.

Diese Verfahren verändern Auswahlvarianz und Stil, aber sie erzeugen kein fehlendes Wissen. Deterministische Einstellungen machen ein Modell nicht wahrheitsgarantiert; Sampling-Einstellungen machen ein Modell nicht automatisch kreativ im menschlichen Sinn.

## 5. Reproduzierbarkeit

Reproduzierbarkeit verlangt mindestens gleiche Modellversion, Tokenizer, Input, System-/Toolkonfiguration, Decodingparameter und kontrollierte Zufallsquelle. Anbieter können zusätzlich Hardware- oder Kernelunterschiede haben. Ein Seed ist deshalb ein nützliches Experimentmerkmal, aber keine universelle mathematische Garantie über alle Laufzeiten.

## Selbsttest

- Was wird beim Training verändert?
- Warum ist hohe Tokenwahrscheinlichkeit keine Wahrheitswahrscheinlichkeit?
- Was muss neben dem Seed für einen fairen Decoding-Vergleich konstant bleiben?

