# Capstone – Reproduzierbarer RAG-Engineering-Review

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Verbinde Ingestion, Chunking, drei Retrieval-Modi, ACLs, RRF, Context und Quellenbelege. Baue mindestens 12 Golden Queries eines eigenen technischen Korpus, darunter exakte IDs, Synonyme, veraltete Daten, geschützte Dokumente und negative Fragen. Vergleiche Retriever **unter identischen Rahmenbedingungen**.

**Definition of Done:** ausführbare Pipeline + Tests, Golden Set, mindestens zwei Konfigurationen, Messung von Recall@k/MRR/P95, nachvollziehbare Belege, Security-/Freshness-Nachweise und schriftliche Tradeoff-Entscheidung. Für CG kann die Pipeline hinter einer Retrieval-Port-Schnittstelle stehen; die Integration selbst ist hier nicht implementiert.

**Selbsttest:** Kannst du in zehn Minuten erklären, was dein Benchmark tatsächlich misst – und was nicht?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
