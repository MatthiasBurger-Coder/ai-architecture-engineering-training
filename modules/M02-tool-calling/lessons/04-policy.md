# Permissions & Policy

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
READ, WRITE, DESTRUCTIVE and PRIVILEGED describe side effects, not grants. Bind authorization to authenticated actor, requested resource, tenant and operation. Human approval is an external attestation, not a string inside the tool arguments. Scope-check before and at commit where needed.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Why does schema-valid create_issue still require authorization? Because syntax cannot approve side effects.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
