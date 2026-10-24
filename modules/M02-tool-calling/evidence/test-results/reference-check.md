# Technische Referenzprüfung M02

Datum: 2026-09-08 (UTC). Status: PASS für lokale Referenztests.
Dies ist **keine persönliche Lernabnahme** und keine Produktionsfreigabe.

## Umgebung

Python 3.12.13; jsonschema 4.26.0; isoliertes venv.
Der Statusabruf der Paketinstallation meldete zunächst einen Abbruch.
Der anschließende Import und echte Testlauf bestätigten die verfügbare Version;
es wurde keine erneute Installation benötigt.

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| unittest discover -s solutions/reference -p 'test_*.py' -v | 40 Tests, 0 Failures/Errors, Exitcode 0 |
| solutions/reference/demo.py | Erfolg, issue_count=2, issue_1_version=2 |
| solutions/reference/verify_materials.py | Python-Syntax, JSON-Parsing, lokale MD-Links und Whitespace fehlerfrei |
| Katalogschemas beim Runtimeimport | Draft-2020-12-Schemaprüfung erfolgreich |

Befehle sind vom Modulverzeichnis mit aktiviertem venv auszuführen.
Vollständiger [Testlog](reference-tests.txt), [Demolog](reference-demo.txt).

## Identität der geprüften Dateien

SHA-256-Dateihashes (vor Veröffentlichung; unabhängig von späterer Commit-ID):

```text
756cc9e506ae4ee1a6f6c0507088b5cfc0dc8ba350fb2d2d46f1ffa72033adb6  requirements.txt
06d9b8b41e86d94c8d33e3cfade50d7b0e29a3ee9d365028ebf3c7b5809fb85d  solutions/reference/demo.py
06b4d6f04427f0c6f5d1024ad7946d8985ce37937c0428a7319ca5e978f09aad  solutions/reference/runtime.py
0f6164fa22e45f9e1c76e230eac11c183e66c83094a9eaf8ba3378c2faf94a57  solutions/reference/test_runtime.py
5d9c2991e11d274c037fe6adca27816228ab9aa52d42fb7ffcd69267461a0540  solutions/reference/verify_materials.py
2de9e625a6c4748740930ae39a698167628a7ae944c617d4dc2ecb1d6791cfbf  solutions/reference/catalog.json
310956d4c48cffc546539b37ed9fbb6b457d395bf3e3960a00e27dc77c542bc3  solutions/reference/envelope.schema.json
6fc41611d87c138ad45665971fdab56b90496001a5515ffa5a0547cc413453ef  solutions/reference/result.schema.json
```

## Grenzen

Keine Modellabfragen, keine realen GitHub-Mutationen durch das Labor, kein MCP-
Transport, keine Persistenz-/Parallelitäts-/Crash-Recovery-Garantie. Mermaid-
Quellblöcke sind enthalten; ein grafisches Rendering wurde hier nicht geprüft.
Die eigene AC-Abnahme bleibt bis zu den Lernnachweisen offen.
