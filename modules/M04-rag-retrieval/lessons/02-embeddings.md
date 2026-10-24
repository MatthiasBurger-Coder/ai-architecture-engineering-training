# Embeddings, Ähnlichkeit und Indexmodelle

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Embeddings approximieren Bedeutungsähnlichkeit numerisch. Cosine Similarity, Skalarprodukt und euklidische Distanz haben unterschiedliche Voraussetzungen; Normierung beeinflusst Ergebnisse. Modellwechsel kann Reindexierung erzwingen. Eine Vektordatenbank liefert Kandidaten, keine verifizierten Wahrheiten.

**Labor:** Die Standardbibliothek verwendet absichtlich transparente Hashing-Vektoren als didaktische Näherung, **keine trainierten semantischen Embeddings**. Sie demonstrieren Reproduzierbarkeit und Ranking, nicht die reale Qualität eines Embedding-Modells. Für Produktionsbenchmarks echte Embedding-Modelle und einen geeigneten Vektorindex ergänzen.

**Aufgabe:** Warum können OOV-/Synonymfragen im Hashing-Labor fehlschlagen? Kennzeichne diese methodische Grenze.

**Selbsttest:** Warum sind Scores verschiedener Retriever nicht ohne Normalisierung vergleichbar?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
