# Referenz: Messung und Architekturentscheidung

Retrieval von Generation trennen. Recall@k zählt pro Query den Anteil der relevanten Dokumente, MRR den ersten Treffer, P95 die gemessene Tail-Latenz; Citation Correctness ist separat. Untersuche Golden-Query-Leakage, Korpusgröße, synthetische Formulierungen und Scope-Konflikte. Security Gate darf nicht durch hohe Relevanz überstimmt werden.

## Reviewfragen
Welche Messung belegt den Anspruch? Wo fehlt im lokalen Labor Produktionsfunktionalität? Welche Daten oder Rechte könnten unerlaubt offengelegt werden?
