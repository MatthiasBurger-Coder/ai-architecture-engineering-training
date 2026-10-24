# Streaming-RAG, CDC und Indexkonsistenz

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

**Quelle:** Confluent *The Developer’s Guide to RAG with Data Streaming* (2025; bereitgestellte deutsche Übersetzung), Abschnitte Datenanreicherung (S. 7–10), Inferenz (11–12), Workflows (13–14) und Nachverarbeitung (15–16). Der Leitfaden stellt Streaming und Flink/Kafka aus Anbieterperspektive dar; er belegt nicht, dass Confluent für jedes RAG-System notwendig ist.

**Vendor-neutrales Modell:** CRUD/CDC-Event → normalisieren → ACL/PII-Policy → Chunk/Embed → upsert/delete Index → Revision-Watermark → Query. Beachte Event-Reordering, mindestens-einmalige Zustellung, Idempotenz, Tombstones, Late Arrivals, Reindex und Backfills. Messgrößen sind Source-to-Index-Lag und Fehlerrate; zusätzliche Infrastruktur nur bei tatsächlichem Freshness-Bedarf.

**Labor:** In-Memory-Events demonstrieren Upsert, Replay und Delete ohne Broker. Optionaler Architektur-Transfer auf Kafka/RabbitMQ und andere Queues ist kein Nachweis tatsächlicher Exactly-once-End-to-End-Semantik.

**Aufgabe:** Entwerfe deterministischen Update/Delete-Test und eine Batch-vs-Streaming-Entscheidung mit Anforderungen.

**Selbsttest:** Wieso ersetzt Kafka allein keine atomare Konsistenz zwischen Quelldaten und Vektorindex?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
