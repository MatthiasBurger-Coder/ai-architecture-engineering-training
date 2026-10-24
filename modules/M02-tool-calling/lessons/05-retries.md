# Idempotency, Retry & Revision

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Timeout after a write has unknown outcome. CREATE needs stable idempotency keys, payload hashing and atomic persisted deduplication. UPDATE should guard against stale revisions. READ retry is usually easier but still subject to rate limits. Demo uses in-memory state only.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Same key + different payload? Reject with IDEMPOTENCY_CONFLICT.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
