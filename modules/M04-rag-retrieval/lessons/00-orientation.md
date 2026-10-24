# RAG als überprüfbare Engineering-Pipeline

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

RAG nutzt zur Anfragezeit externe Informationen, statt Modellgewichte bei jeder Aktualisierung zu ändern. Zwei Pfade sind zu unterscheiden: Ingestion (Quelle → Parse → Chunk → Metadaten → Index) und Query (Anfrage → Retrieval → Reranking → Kontext → Generator → Belege). Groundedness ist keine Garantie: ein Modell kann selbst mit korrektem Kontext falsche Schlüsse ziehen.

**Datenvertrag:** Ein Chunk benötigt stabile id, document_id, source, version, text, Berechtigungsmetadaten und Zeitstempel. Eine Antwort sollte konkrete Beleg-IDs und Status bei Nichtwissen enthalten.

**Aufgabe:** Zeichne getrennte Ingestion- und Query-Sequenzen. Benenne die fünf wichtigsten Fehlermodi (veralteter Index, verfehlte Passage, Prompt Injection, falscher Scope, unbelegte Antwort).

**Selbsttest:** Warum ist ein korrektes Embedding kein Beleg für korrekte Antworten?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
