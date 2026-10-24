# Metadatenfilter, Security Trimming und Reranking

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Relevanz allein genügt nicht. Treffer müssen anhand einer authentifizierten Identität und dokumentierter ACLs gefiltert werden; niemals vertrauliche Treffer an den Generator geben. Für Skalierung möglichst schon während Candidate Generation filtern; eine nachträgliche, korrekte Filterung ist eine zusätzliche Schutzgrenze, kann aber Recall senken.

Reranking kann Cross-Encoder, Pairwise/Pointwise LLM oder deterministische Fachsignale verwenden. Es erzeugt Kosten-/Latenztradeoffs; Evaluation muss vor und nach dem Reranker erfolgen.

**Aufgabe:** Mische öffentliche und interne Chunks in einer Anfrage. Prüfe, dass der Nutzer nur autorisierte Inhalte und Quellen erhält.

**Selbsttest:** Warum darf das LLM ACL-Filter nicht selbst entscheiden?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
