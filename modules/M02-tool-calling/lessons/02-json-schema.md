# JSON Schema Contracts

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Specify object properties, required, type, minimum, minLength, maxLength, pattern, enum and additionalProperties:false. Output must be validated too. Optional means absent is permitted; null must be explicitly admitted. Version breaking contracts.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Evaluate missing keys, boolean-as-integer, extra admin property and negative issue ID: reject all.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
