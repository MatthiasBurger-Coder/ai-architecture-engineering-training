# PR #15 · Integration nach #9 und #10

Prüfstand: 24.10.2026. [PR #15](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/pull/15), bisheriger Head `4e3fbfd`, integriert mit `main` bei [`b072691`](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/commit/b072691e615714911fdbad00bac4e0d4e10e51c5). Umsetzung ausschließlich im separaten Worktree `ai-architecture-engineering-training-pr15` auf `fix/pr-15-integration`; der gemeinsame Hauptcheckout bleibt auf `main` unverändert.

## Behobenes Problem

Der ursprüngliche M09-PR änderte das alte Frontend mit statischen JSON-Imports und Demo-Gates. Nach den Änderungen aus #9/#10 kollidierte er in sechs Dateien mit Laufzeitquellen, unveränderlichen Snapshots und IndexedDB-Historie. Eine bloße Übernahme seiner alten Frontenddateien würde diese Funktionen zurücksetzen; eine unversionierte zusätzliche Training-ID würde den v1-Vertrag verletzen.

Die Integration erhält die Quellen-/Speicherfunktionen aus `main`, ergänzt ein M09-Laufzeitmanifest und Fragen mit stabilen IDs und implementiert die [v2-Katalogerweiterung](catalog-extension-v2.md). M09 benötigt ausschließlich M01; M02–M08 und CAP bleiben unabhängig von der optionalen Spezialisierung. Katalog, UI-Voraussetzungen und persistierte Vorgängerreferenzen verwenden dieselbe zentrale Regel. Bestehende v1-Versuche und Konfigurationen werden nicht umgeschrieben. Eine bestehende Quellenkonfiguration erhält M09 nur nach bewusster Ergänzung und Speicherung.

## Lokale Ergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` unter `frontend/` | erfolgreich |
| `npm test` | 28 Tests bestanden, darunter vier neue Tests zu DAG, Versionsgrenzen, v1-Bestandsschutz und M09-Persistenz |
| `npm run build` | erfolgreich; Produktionsbundle rund 329 kB |
| `node scripts/check-runtime.mjs` | erfolgreich: Quellenadapter, Commitbindung, Fehler/Wiederholung, Tastatur, Konfigurations-Reload und ausdrückliche v1→v2-M09-Ergänzung ohne Ersetzen vorhandener Quellen; 18 lesende API-Anfragen |
| `node scripts/check-local-history.mjs` | erfolgreich: M09 vor M01 gesperrt, nach M01 unabhängig von M02 verfügbar; v2-Abschluss mit exakter M01-Referenz, paralleler M02-Abschluss, Speicherfehler/Retry, Import/Export, Browserneustart und defekte Ketten; 21 lesende API-Anfragen |
| Python `unittest discover -s tests -v` im M09-Referenzlabor | 8 Tests bestanden |
| JSONL-Validierung des M09-Referenzlabors | SFT: 3, DPO: 3, Eval: 4 Datensätze; keine Hold-out-Leakage |
| `docker compose config --quiet` im M09-Referenzlabor | erfolgreich |
| `git diff --check` | erfolgreich |

Die Browserprüfungen liefen mit Chromium und kontrollierten GitHub-Antworten gegen den Worktree-Server auf Port 4202. Desktop 1440 px und Mobil 390 px zeigen keinen horizontalen Überlauf und keine Laufzeitfehler. Der zusätzliche M09-Desktop-Screenshot liegt temporär unter `pr15-m09-assessment-desktop.png`; beide Browserchecks erzeugen weitere Screenshots im System-Temp-Verzeichnis. Die fünf Ansichten und die visuelle Grundlage bleiben erhalten.

## Grenzen

Keine Ausführung von CUDA/GPU-Training, DPO oder der externen VRAM-Peakmessung auf der Zielhardware. Offline-Tests und Compose-Konfiguration ersetzen keinen Trainingsnachweis, keine Javac-/JUnit-Abnahme und keinen Beleg für das 4096-MiB-Zusatzbudget. Kontrollierte Git-Antworten belegen die Browserintegration, nicht die Veröffentlichung des M09-Moduls am konfigurierten Git-Ref. PR #15 bleibt bis zur fachlichen/hardwarebezogenen Abnahme ein Draft; diese Reparatur führt keinen automatischen Merge aus.
