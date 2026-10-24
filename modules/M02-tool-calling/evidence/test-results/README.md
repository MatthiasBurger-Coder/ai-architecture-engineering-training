# Testresultate dokumentieren

Führe aus dem Modulverzeichnis aus:

```bash
python -m unittest discover -s solutions/reference -p 'test_*.py' -v
```

Für deine eigene Implementation ergänze den eigenen Testbefehl.
Bewahre stdout/stderr im Protokoll auf. Mindestens angeben:

- UTC-Datum, Python-Version, installierte Paketversionen.
- Commit oder SHA-256-Dateihashes des getesteten Codes.
- Ausgeführter Befehl, Exitcode, Anzahl Tests, failures/errors/skips.
- Welche Grenzen wurden geprüft? Welche explizit nicht?
- Keine Rohargumente mit vertraulichen Daten oder Credentials.

Für Negativtests zusätzlich Zustand vor/nach festhalten. Ein Error allein
beweist nicht die Abwesenheit einer Mutation. Bei NOT_RUN den konkreten
Blocker nennen; erst nach tatsächlichem Lauf in PASS ändern.
