# Hexagonal Architecture & Capstone

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Domain: ToolContract, PermissionClass, ExecutionOutcome. Application: Validate, Authorize, Execute, Audit. Ports: Registry, Policy, Executor, Idempotency, Audit. Adapters: JSON, MCP, LLM provider, database. Never let model provider become transaction authority.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Show complete sequence, threat model, retry strategy and test evidence to a reviewer.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
