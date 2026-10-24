# Keyword-, Dense- und Hybrid-Retrieval

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Keyword/BM25 passt häufig gut zu exakten Identifikatoren, Fehlercodes, Klassen- und Methodennamen. Dense Retrieval kann Paraphrasen besser erfassen. Hybrid Retrieval kombiniert beide; eine robuste Alternative zur Mischung numerischer Rohscores ist Reciprocal Rank Fusion: RRF(d) = Σ 1/(k + rank_i(d)). Fehlende Treffer tragen 0 bei.

**Labor:** Vergleiche einen einfachen lexikalischen TF-IDF-Retriever, einen didaktischen Hashing-Vektorretriever und RRF. Die Implementierung ist **keine BM25-Referenz**; dokumentiere dies ausdrücklich.

**Aufgabe:** Stelle Fragen mit wortgleichen Kennungen und indirekten Formulierungen gegenüber. Miss Recall@k, MRR und Latenz.

**Selbsttest:** Was kann eine Hybrid-Fusion gegenüber einer reinen Vektorsuche verbessern, ohne dass sie garantiert überlegen ist?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
