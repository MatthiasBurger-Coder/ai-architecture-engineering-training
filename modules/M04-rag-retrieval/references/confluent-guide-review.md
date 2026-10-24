# Quellenkritik: Confluent Developer's Guide to RAG with Data Streaming

**Quelle:** Confluent Inc., *The Developer's Guide to RAG with Data Streaming* (2025). Grundlage ist die vom Nutzer bereitgestellte 21-seitige deutsche Übersetzung; das PDF wird aus urheberrechtlichen Gründen hier nicht kopiert. 

## Fachlicher Gehalt (quellengebunden)
- S. 3–4: RAG-Einstieg, Chunking → Embeddings → Vector Store → Kontext.
- S. 5–6: Vier Confluent-orientierte Bausteine: Datenanreicherung, Inferenz, Workflows, Nachverarbeitung.
- S. 7–10: Stream Ingestion, Chunking, Embeddings, Schema/Data Governance; Hinweis, strukturierte IDs und Aggregationen nicht pauschal zu vektorisieren.
- S. 11–12: Stream-Orchestrierung des Anfragepfads; Kafka/Flink/Vektorstore/LLM.
- S. 13–14: mehrstufige Agentenworkflows, Cache und Datenzugriffe.
- S. 15–16: Nachverarbeitung, Regeln und Morphir-Beispiel.
- S. 17–19: Referenzarchitekturen für Retail, Finanzmarkt und Jobportal.
- S. 20–21: Kundenstimmen, Confluent Cloud und Registrierung.

## Kritik / Abgrenzung
Es handelt sich um ein kommerzielles Whitepaper, **nicht** um neutrale Studienunterlagen. Vendor-abhängige Aussagen und Nutzenversprechen sind Beispiele, kein Architekturbeweis. Es fehlen tiefe Retrieval-Metriken, BM25-vs-Dense-Benchmarks, reproduzierbare E2E-Evaluierung und eine systematische Batch-vs-Streaming-Entscheidung.

## Was M04 zusätzlich lehrt (eigene Erweiterung)
Hybrid Retrieval/RRF, Golden Queries, Recall/MRR, ACL Security Trimming, prompt-injection-resistente Context Assembly, Tombstones, Event-Reordering, Regressionstests und Kosten-/Latenzbewertung.

## Didaktische Nutzung
Im Streaming-Kapitel als kritische Sekundärquelle behandeln; Architekturkonzepte in einen herstellerneutralen Datenvertrag übersetzen. Kein Branding/Cloud-Account erforderlich. Morphir ist lediglich eine optionale Ausprägung deterministischer Nachverarbeitung.
