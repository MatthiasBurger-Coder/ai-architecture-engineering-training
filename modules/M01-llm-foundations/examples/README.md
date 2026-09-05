# Beispiele und Diagramme

Das Labor ist absichtlich klein und transparent. Es benötigt nur die Python-Standardbibliothek.

```bash
python llm_foundations_lab.py
```

Enthaltene Demonstrationen:

- Toy-Tokenisierung und Embedding-Lookup;
- scaled dot-product Self-Attention;
- Logits und Softmax;
- Temperature-, Top-k- und Top-p-Entscheidungen;
- reproduzierbares Sampling mit Seed.

Die Ergebnisse dienen dem Verständnis, nicht dem Benchmarking realer Foundation Models.

## Lernbeispiele

- [`01-tokenization/`](01-tokenization/) — Tokens, Kosten und Budgetierung
- [`02-attention/`](02-attention/) — gewichtete Kontextaggregation
- [`03-decoding/`](03-decoding/) — Logits, Temperature, Top-k und Top-p
- [`04-context-budget/`](04-context-budget/) — Auswahl und Truncation
- [`05-boundary/`](05-boundary/) — Proposal gegen Executor-Grenze
