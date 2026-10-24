# Diagrammnachweise

Erstelle zwei eigene Mermaid-Diagramme:

1. Trust Boundaries: Modell, Host, Policy, Handler/Backend. Zeige, wo Input
   untrusted ist und wo Identity/Grants herkommen.
2. Ereignisfolge: Write, verlorene Antwort, Retry, Journalprüfung, Reconciliation.

Prüfe mit einem Reviewer:

- Kann ein Modellargument direkt an Credentials oder Approval gelangen?
- Werden fehlende, verweigerte und unbekannte Ergebnisse unterschieden?
- Ist Call-Korrelation auch bei mehreren Requests sichtbar?
- Steht die Policy vor Ausführung und vor möglicher Datenoffenlegung?

Ein Bild ohne Erklärung zählt nicht. Verlinke die Diagramme in acceptance.md.
