# Context Assembly, Provenance und Abstention

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Context Assembly dedupliziert Chunks, priorisiert Belege, begrenzt Tokenbudget, erhält Metadaten und trennt Zitiertexte von Anweisungen. Antworten müssen auf Belege verweisen; fehlende Evidenz soll zu explizitem Nichtwissen führen. Ein Zitat allein beweist nicht, dass die zugeschriebene Aussage vom Chunk gedeckt wird – diese Zuordnung muss geprüft werden.

**Labor:** deterministische extractive Antwort für Golden Queries als transparente Baseline, statt ein generatives Modell als zuverlässigen Richter vorzutäuschen. Sie zeigt ausschließlich Retrieval- und Belegmechanik.

**Aufgabe:** Konzipiere einen nicht-extraktiven Generator und ein separates Faithfulness-Eval. Keine untrusted Inhalte als System-Nachrichten behandeln.

**Selbsttest:** Was unterscheidet source citation, retrieval relevance und factual faithfulness?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
