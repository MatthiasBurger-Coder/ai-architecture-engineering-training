# Übung 05 — LLM oder deterministische Grenze?

Ordne die folgenden Schritte einer automatisierten Deployment-Pipeline ein:

1. Ticket in eine strukturierte Absicht umwandeln;
2. betroffene Services aus Repository-Evidenz ermitteln;
3. prüfen, ob der anfragende Operator berechtigt ist;
4. einen Rollout-Plan formulieren;
5. Produktionsdeployment ausführen;
6. Smoke-Test-Ergebnis bewerten;
7. bei Fehlern Rollback auslösen.

Für jeden Schritt entscheide: `LLM-geeignet`, `deterministisch`, `kombiniert` oder `nicht ohne Approval`. Begründe die Entscheidung anhand von Fehlerkosten, Reproduzierbarkeit und Side Effects. Entwirf anschließend eine minimale Boundary:

```text
LLM proposal → schema validation → policy/approval → executor → verification
```

Kein LLM-Output darf die Policy- oder Berechtigungsprüfung umgehen.
