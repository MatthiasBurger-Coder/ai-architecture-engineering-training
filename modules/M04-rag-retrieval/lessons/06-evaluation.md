# Golden Queries, Rankingmetriken und Performance

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Trenne Retrieval- und Generationsevaluation. Golden Queries enthalten Frage, erlaubte Gold-Dokumente, Nutzerkontext und ggf. erwartete Fakten. Recall@k = Queries mit mindestens einem relevanten Treffer in Top k / Queries (vereinfachte Hit-Rate; bei mehreren relevanten Dokumenten echten Recall = gefundene relevante / alle relevanten berechnen). MRR = mittlerer Kehrwert des Ranges des ersten relevanten Treffers. Zusätzlich Precision@k, nDCG@k, Citation Correctness, Faithfulness, P50/P95 Latenz, Speicher-/Tokenkosten und Freshness Lag messen.

**Aufgabe:** Schreibe Messprotokoll, bestimme Baseline, verbessere ein Verfahren und dokumentiere Regressionen. Kleine synthetische Korpora sind nur Unit-Level, keine Produktionsvalidierung.

**Selbsttest:** Weshalb darf ein hoher Recall@5 bei schlechter ACL-Durchsetzung niemals als bestanden gelten?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
