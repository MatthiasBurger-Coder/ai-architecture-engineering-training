# Architekturentscheidung dokumentieren

Erstelle ein ADR in Markdown mit:

1. Kontext: Welche semantische Aufgabe soll das LLM übernehmen?
2. Invarianten: Was muss unabhängig vom Modell garantiert bleiben?
3. Entscheidung: Verträge, Schema-Draft, Policy, Approval, Idempotenz.
4. Alternativen: Freitextparser, generisches Admin-Tool, direkter SDK-Aufruf.
5. Konsequenzen: Aufwand, Fehlermodi, Daten-/Scopegrenzen.
6. Produktionslücken: Persistenz, Parallelität, Freigabeablauf, Reconciliation.
7. Nachweise: konkrete Tests und Diagramme.

Eine gute Entscheidung erklärt beispielsweise, warum ein Approval allein nicht
genügt und warum der Idempotenzkey an eine fachliche Operation gebunden bleibt.
Referenziere die konkreten eigenen Artefakte statt „Tests grün“ zu behaupten.
