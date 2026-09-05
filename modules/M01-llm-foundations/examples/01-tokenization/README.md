# Beispiel 01 — Tokenisierung als Kosten- und Budgetgrenze

## Ziel

Mache sichtbar, dass Wortanzahl, Zeichenanzahl und Tokenanzahl unterschiedliche Größen sind.

## Experiment

Verwende das Toy-Labor für mehrere Inputs:

```text
deploy service now
deploy   service   now
payment-service/v2/status
Änderung der Produktionskonfiguration
```

Der vorhandene Toy-Tokenizer ist absichtlich nur ein Whitespace-Split. Dokumentiere, warum er für Code, Satzzeichen und Mehrsprachigkeit keine reale Tokenisierung ersetzt.

## Engineering-Frage

Welche Eingaben müssen in einem produktiven Context Builder mit dem echten Modelltokenizer gezählt werden? Erwartet werden Systemprompt, Chat-Template, Tool-Schemas, User-Input, Retrieval-Evidenz, Toolresultate und Antwortreserve.
