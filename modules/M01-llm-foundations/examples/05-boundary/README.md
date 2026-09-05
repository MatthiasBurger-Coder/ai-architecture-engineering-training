# Beispiel 05 — LLM-Output als Proposal

```json
{
  "service": "payments",
  "environment": "staging",
  "strategy": "rolling"
}
```

Dieses JSON ist noch keine Deployment-Erlaubnis. Ein Schema-Validator prüft Struktur und Wertebereiche; ein Resolver prüft die Existenz des Services; eine Policy prüft Identität und Freigabe; erst danach darf ein deterministischer Executor starten.
