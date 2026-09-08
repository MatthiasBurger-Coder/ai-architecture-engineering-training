# Ausführbare Referenz: lokaler Tool-Executor

## Dateien und Start

- [catalog.json](catalog.json): fünf Contracts mit Input, Output und Permission-Metadaten.
- [envelope.schema.json](envelope.schema.json): anbieterneutrale Proposal.
- [result.schema.json](result.schema.json): Success/Error-Union.
- [runtime.py](runtime.py): Parser, Validator, Policy, Journal, vier Fake-Handler.
- [demo.py](demo.py): Read, verweigerter Write, freigegebener Write, Replay, Delete-Deny.
- [test_runtime.py](test_runtime.py): Schema-, Zustands- und Negativtests.

Vom Modulroot nach Installation aus der [Modulübersicht](../../README.md):

```bash
python solutions/reference/demo.py
python -m unittest discover -s solutions/reference -p 'test_*.py' -v
```

Erwartet: Call c-1 liefert Issue 1, c-2 APPROVAL_REQUIRED, c-3 und c-4
dieselbe angelegte Issue-ID 2. c-5 sucht mit limit=1, c-6 ändert Issue 1 auf
Version 2, c-7 liefert VERSION_CONFLICT und c-8 TOOL_DISABLED.
Am Ende stehen issue_count=2, issue_1_version=2 und die bereinigte Auditspur.

## Wie du den Code liest

Beginne bei execute, folge dann den Schemas, Context und den Handlern.
finish erzeugt ein Resultat und einen allowlist-basierten Auditeintrag.
approve simuliert eine externe Freigabe und ist **kein modellseitiges Tool**.

Der Katalog ist die Quelle der Verträge. Die Handler-Allowlist enthält keine
dynamischen Imports, keine Shell und keinen Löschhandler. Zusätzlich zur
Schema-Prüfung erzwingt update_issue die erwartete Ressourcen-Version.

## Grenzen, die du im Review nennen musst

- Sequenzieller Fake; nicht threadsicher, keine Persistenz, kein Netzwerk.
- Grants und Approvals werden durch den Testhost gesetzt; keine echte Identity-
  oder Signaturprüfung. approve nicht als öffentliche API exponieren.
- Kein globaler LLM-Step-/Token-/Zeitbudgetcontroller, nur Batch-Calllimit.
- Idempotenzjournal überlebt keinen Neustart. Kein verteiltes Exactly once.
- Pending-Einträge brauchen in Produktion Reconciliation, TTL- und Crashkonzept.
- Nur syntaktische Canonicalization; fehlende Defaultwerte werden nicht ergänzt.
- Ausgaben mit vertraulichem Inhalt benötigen produktiv Feld-/Datenfreigaben;
  das Labor verwendet ausschließlich synthetische Inhalte.
- Audit ist eine In-Memory-Liste ohne dauerhafte Integritätssicherung und ohne
  vollständige produktive Operation-Provenance.
- Die Referenz beweist keine Modell-Auswahlqualität und keine MCP-Kompatibilität.

Diese Einschränkungen sind ausdrücklich Teil der Lernaufgabe; entferne sie
nicht aus einem Abnahmebericht, nur weil alle Unit-Tests grün sind.
