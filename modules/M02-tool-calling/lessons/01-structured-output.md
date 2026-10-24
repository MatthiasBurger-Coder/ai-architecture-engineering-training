# JSON & Structured Output

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Valid JSON means syntactically parseable text; schema validity checks the shape; semantic validity checks business rules; authorization checks the principal. Provider structured-output modes improve formatting reliability but do not enforce access control. Handle refusals and truncated outputs.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Is {issue_id:"1"} valid for an integer field? No; coercion must not silently cross a trust boundary.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
