# M04 Labor

```sh
cd modules/M04-rag-retrieval
python examples/rag_lab.py
python -m unittest discover -s tests -v
```

Nur Python-Standardbibliothek. Die Toy-Vektoren sind **keine trainierten Embeddings**, TF-IDF ist **nicht BM25** und die Antwortfunktion ist **extractive**, kein LLM. Damit lassen sich Ranking/Fusion/ACL/Event-Semantik reproduzierbar untersuchen, nicht Produktions-RAG-Qualität beweisen.

`corpus.json` enthält Mini-Engineeringwissen mit Access Labels und Revisionen, `golden.json` ein synthetisches Golden Set. Ersetze sie für echte Benchmarks durch eigenes, freigegebenes Korpus und mindestens 12 annotierte Fragen.
