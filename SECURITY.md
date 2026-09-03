# Security Baseline

Dieses Repository dient zum Experimentieren mit LLMs, APIs und MCP. Trainingscode darf deshalb nicht mit Produktionsberechtigungen betrieben werden.

## Regeln

- Keine Secrets, Tokens, API Keys oder Passwörter committen.
- `.env` und lokale Credential-Dateien bleiben unversioniert.
- Trainingskonten mit minimalen Rechten verwenden.
- Destructive Tools standardmäßig deaktivieren.
- Write-/Destructive-Aktionen müssen im Training explizite Policy-Gates besitzen.
- Fremde Dokumente, Repository-Inhalte, Webseiten und Tool-Metadaten als untrusted input behandeln.
- MCP-Server nicht allein aufgrund ihrer Tool-Beschreibung vertrauen.
- Tool-Argumente vor Ausführung validieren.
- Secrets niemals in Model Context oder Logs übernehmen, sofern nicht zwingend und ausdrücklich abgesichert.
- Alle Side Effects auditierbar machen.

## Security Gate für das Capstone

Das Abschlussprojekt darf erst als bestanden gelten, wenn mindestens folgende Angriffe getestet wurden:

1. Direct Prompt Injection
2. Indirect Prompt Injection aus RAG-Dokumenten
3. Tool Poisoning / manipulierte Tool Description
4. Versuch unerlaubter Write-Aktion
5. Secret-Exfiltration
6. kompromittierter/unverfügbarer MCP Server
7. Replay/Retry einer nicht-idempotenten Aktion
8. Überschreitung eines Agent-Step-/Cost-Budgets

Die erwartete Reaktion ist ein kontrollierter, nachvollziehbarer Fehler oder eine explizite Freigabeanforderung — keine improvisierte Umgehung durch das Modell.
