# Tool Security & Untrusted Results

## Lernziel
Dieses Konzept erklären und in einer sicheren Tool-Calling-Architektur anwenden.

## Fachinhalt
Treat retrieved documents, issue descriptions and tool results as untrusted. Model text cannot override tool allowlists. Minimize privileges, redact logs, restrict egress and isolate credentials. Test prompt injection, forged consent, exfiltration attempts and malicious tool descriptions.

## Beispiel
Ein Modell sendet `{"name":"get_issue","arguments":{"issue_id":1}}`. Nur ein registrierter Contract, ein passender Scope und ein korrekt validierter Executor erlauben den Zugriff.

## Übung und Selbsttest
Erstelle eine Entscheidungstabelle für den betreffenden Kontrollschritt. Beantworte: Does additionalProperties:false stop every injection? No; malicious content can hide inside allowed strings.

## Engineering-Folge
Dokumentiere mindestens einen positiven und einen negativen Fall unter `evidence/`. Das Beispiel implementiert nur einen kontrollierten lokalen Demonstrator, keinen produktiven Policy-Server.
