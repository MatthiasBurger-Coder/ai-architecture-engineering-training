# Lösung 06 — M01-Syntheseprüfung

Eine akzeptable Lösung sieht strukturell so aus:

```text
Operator request
 → LLM extracts service + symptoms + requested action
 → schema/type validation
 → repository/runtime evidence lookup
 → service existence + environment + incident-state checks
 → authorization + restart policy + approval
 → idempotent restart executor
 → health/readiness verification
 → immutable audit record
```

Das Modell darf Diagnosehypothesen und einen Restart-Vorschlag liefern. Es darf weder die Identität prüfen noch die Restart-Erlaubnis selbst erteilen. Evidence muss Quelle, Zeitpunkt und Version enthalten. Bei fehlender oder widersprüchlicher Evidenz lautet der kontrollierte Zustand `needs_more_evidence` oder `conflict_detected`, nicht eine erfundene Diagnose.

Mögliche Fehlermodi sind falscher Service, veralteter Status, Prompt Injection im Log, fehlende Berechtigung, doppelter Restart, Healthcheck-Fehler und unvollständiger Auditdatensatz.
