# Parsing, Chunking und Dokumentidentität

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Parsing darf nicht stillschweigend Tabellen, Absätze, Überschriften, Code oder Zeitstempel zerstören. Chunking-Strategien: feste Größe, absatz-/satzbasiert, semantisch, hierarchisch; Overlap verbessert möglichen Recall, erhöht aber Dubletten und Kosten. Vergleiche Chunkgrößen **im eigenen Golden-Query-Benchmark** statt pauschal beste Werte zu behaupten.

**Stabile Versionierung:** IDs auf Dokument-/Chunk-Version beziehen; Updates ersetzen alte Chunks; Deletes und Rechteänderungen propagieren. Unstrukturierten Fließtext anders als stark strukturierte Kennungen behandeln. Der Confluent-Leitfaden warnt ausdrücklich davor, alles unreflektiert zu vektorisieren (S. 8).

**Aufgabe:** Chunking für technische ADRs mit Codeblöcken und Tabellen entwerfen; Grenzen und Überschriften nachvollziehbar halten.

**Selbsttest:** Warum darf eine gelöschte Quelldatei nicht als alter Vektor-Chunksatz verbleiben?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
