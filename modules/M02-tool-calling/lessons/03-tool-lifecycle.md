# Tool Calling Lifecycle

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Discovery → tool proposal → parse → validate → authorize → execute → verify result → report. Keep correlation IDs and bounded retries. Return stable codes INVALID_JSON, INVALID_TOOL, SCHEMA_VIOLATION, PERMISSION_DENIED, CONSENT_REQUIRED, NOT_FOUND, EXECUTION_ERROR. Never expose secrets in errors.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: When may tool output become a system instruction? Never.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
