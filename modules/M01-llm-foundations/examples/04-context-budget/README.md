# Beispiel 04 — Context Budget

Das Budgetbeispiel aus Übung 03 zeigt eine harte Grenze: Nach Systemregeln, Task, Tool-Schema, Historie und Antwortreserve bleiben nur bestimmte Tokens für Evidenz. Auswahl muss deshalb explizit und auditierbar sein.

```text
Budget → Pflichtbestandteile → Filter → Ranking → Truncation/Abstention
```

Ein abgeschnittenes Dokument darf nicht stillschweigend als vollständig behandelt werden. Speichere ausgewählte Quelle, Version, Offset und Tokenanzahl.
