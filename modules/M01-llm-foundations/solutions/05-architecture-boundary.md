# Lösung 05 — Architekturgrenze

| Schritt | Einordnung | Begründung |
|---|---|---|
| Absicht extrahieren | kombiniert | LLM für Sprache, Schema- und Faktenprüfung deterministisch |
| betroffene Services ermitteln | kombiniert | LLM kann Hypothese bilden, Repository-/Graph-Abfrage liefert Evidenz |
| Berechtigung prüfen | deterministisch | Policy und Identity dürfen nicht probabilistisch sein |
| Rollout-Plan formulieren | kombiniert | LLM darf Entwurf liefern, Constraints und Validierung sind fix |
| Produktionsdeployment | nicht ohne Approval | Side Effect, Policy und explizite Freigabe erforderlich |
| Smoke-Test bewerten | kombiniert | Messwerte deterministisch, Interpretation ggf. LLM-unterstützt |
| Rollback auslösen | deterministisch / Approval nach Policy | Trigger, Scope und Recovery müssen reproduzierbar sein |

Die minimale Grenze ist `proposal → typed validation → authorization/policy → executor → verification`. Das LLM kennt dadurch weder automatisch die Berechtigung noch erhält es direkten Zugriff auf den Executor.
