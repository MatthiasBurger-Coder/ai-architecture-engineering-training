# RAG Security, Privacy und Audit

**Lernziel:** fachlich erklären, praktisch anwenden und einen überprüfbaren Nachweis erzeugen.

Angriffsflächen: PDFs/HTML mit Prompt Injection, bösartige Tool-Rückgaben, manipulierte Metadaten, Embedding-Exfiltration, Cross-Tenant-Leaks, Poisoned Index. Setze dokumentierte AuthN/AuthZ an Quellen und Retrieval, erlaubte Datendomänen, PII-Minimierung, Redaction, Löschkonzept und Audit-Pfade um. Vertrauensanker liegen **außerhalb** des Generators.

**Nachverarbeitung:** Eine deterministische Regelengine kann Fach- und Berechtigungsregeln prüfen; der Confluent-Leitfaden illustriert Morphir/Flink (S. 15–16), liefert aber weder einen Nachweis für vollständige Halluzinationsfreiheit noch eine fertige CG-Integration. Trenne didaktisches Architekturpattern vom Produktversprechen.

**Aufgabe:** Teste Zugriffssperren, Prompt Injection als Chunk-Text und das Löschen alter Dokumentversionen.

**Selbsttest:** Warum kann ein Schema-valider Retrieval-Treffer trotzdem nicht veröffentlicht werden?

## Reflexion / Evidence
Eigene Antwort, relevante Testausgabe und Engineering-Folge unter `evidence/lesson-checks.md` dokumentieren. Referenzlösungen erst danach prüfen.
