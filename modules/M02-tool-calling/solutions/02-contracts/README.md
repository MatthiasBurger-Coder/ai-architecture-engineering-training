# Lösung 02 — Fünf Verträge

Die vollständige, maschinenlesbare Lösung ist
[catalog.json](../reference/catalog.json). Der Katalog versieht jede Operation
mit input_schema, output_schema und Permission-Metadaten.

| Tool | Pflichtargumente | Ergebnis | Permission |
|---|---|---|---|
| get_issue | repository, issue_id | Issue inkl. Version | issues:read |
| search_repository | repository, query | matches, truncated | repository:read |
| create_issue | repository, title, body, idempotency_key | gespeichertes Issue | issues:write + Approval |
| update_issue | repository, issue_id, expected_version, idempotency_key; wenigstens title/state | neue Issue-Version | issues:write + Approval |
| delete_repository | repository, reason | theoretisch deleted/repository | repository:delete + privileged; disabled |

Die beiden WRITE-Tools teilen die Form des Issue-Outputs, aber nicht ihre
Semantik. Create erzeugt eine ID; Update benötigt eine vorhandene ID und
erwartete Version. Ein generischer Upsert würde diese Grenze verwischen.

Die optionalen include_comments und limit besitzen dokumentierte Defaults.
Der Validator ergänzt sie nicht; der Handler behandelt Weglassen ausdrücklich.
Null ist keine alternative Schreibweise für Weglassen. Ein leeres Update wird
durch anyOf abgewiesen; ein Update von Titel **und** Status ist erlaubt.

Typische Reviewfehler:

- required vergessen, sodass ein leeres Objekt gültig bleibt.
- additionalProperties nur auf der äußeren Ebene setzen.
- boolean true als „Integer 1“ akzeptieren.
- nur Success-Boolean statt gespeicherter Daten liefern.
- einen Delete-Erfolg behaupten, obwohl der Handler absichtlich nicht existiert.

Versionierung: Wird include_comments neu verpflichtend, ist das inkompatibel.
Ein Provideradapter kann ein engeres Schema verlangen; das ändert den kanonischen
Vertrag nicht automatisch und benötigt einen eigenen Kompatibilitätstest.
