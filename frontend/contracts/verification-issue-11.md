# Verifikation · Issue #11

Prüfdatum: 25.10.2026. [Issue #11](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/11) auf Basisrevision [`fb04dd5`](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/commit/fb04dd587859c37c6c997bceee8cc3e601c25e5b). Prüfkandidat: Branch `feature/11-persisted-level-gates`; die zugehörige PR-/Issue-Verknüpfung benennt den veröffentlichten Commit. Fachliche Grundlage sind der [v1-Vertrag](learning-contracts-v1.md) und seine [M09-Erweiterung](catalog-extension-v2.md).

Die grundlegende transaktionale Freigabe wurde bereits mit #10 und PR #15 integriert. Diese Lieferung schließt die Abnahme für #11 mit zusätzlichen Grenzprüfungen und Korrekturen an den Validierungsgrenzen ab.

## Korrekturen

- Direkte Bewertungsaufrufe validieren den vollständigen Fragensatz. Ein leerer Fragensatz erzeugt keinen scheinbar bestandenen 0/0-Test. Start und Abschluss lehnen unzulässige Herkunft oder Bewertungsregeln ab.
- Sitzungsanzeige und gespeicherte Daten erkennen dieselbe Regel unabhängig von ihrer JSON-Feldreihenfolge; unbekannte Felder oder geänderte Konstanten bleiben unzulässig. Historische Fragen werden weiter ausschließlich aus ihrem Snapshot bewertet.
- Der Start erfasst den jüngsten gültigen gespeicherten Vorgänger, der zu diesem Zeitpunkt bereits abgeschlossen war. Ein Abschluss mit späterem Datum wird nicht verwendet. Ein Start mit ausschließlich zukünftigen Vorgängern zeigt den Fehler der Systemuhr, ohne Zeiten zu verändern.
- Bei erneutem Lesefehler verfallen zwischengespeicherte Auswertungen im Arbeitsspeicher bis zur Wiederherstellung. Die Datenbank und offene Sitzungsversuche bleiben erhalten. Auch die direkte Abgabe wird bei fehlendem Speicherzugriff blockiert.

## Zuordnung zur Abnahme

| Kriterium | Nachweis | Ergebnis |
| --- | --- | --- |
| Neues Profil beginnt bei M01; gesperrte Trainings inspizierbar, aber weder start- noch bestehbar | `progress.test.ts`, `catalog-policy.test.ts`, direkter M02-Start-/Abschlussversuch und gesperrter Detailbutton in `check-level-gates.mjs` | bestanden |
| Regel und Punktzahl vor Start; deterministische 75-%-Grenze | `grading.test.ts`: alle Punktzahlen bei 1, 3, 4, 5, 7, 99 und 100 Fragen; Browser: vor Start 3/3 benötigt, 2/3 scheitert und 3/3 besteht | bestanden |
| Aufstieg erst nach gültigem, erfolgreich gespeichertem Abschluss und gültigen Vorgängern | Transaktionsabbruch nach erfolgreichem Einzel-`add`, Retry mit derselben ID und Reload in `local-store.test.ts` / `check-local-history.mjs` | bestanden |
| Fehlende, falsche, unvollständige oder ungültige Daten und Speicherfehler geben kein Level frei | Neue Bewertungs-/Herkunfts-/Regel-Negativtests; Browser mit leeren/fehlenden Fragen, unvollständiger Abgabe, Fehlversuch und erneutem Speicher-Lesefehler | bestanden |
| Lesen, Demo-Checkboxen, Navigation und isolierte Flags ersetzen kein Ergebnis; keine simulierte Zusatzpflicht | `local-store.test.ts`: Lesemarker und isoliertes Metadaten-Flag ohne Aufstieg; strikter Sicherungsvertrag; erfolgreicher Browserabschluss ohne Checkboxen | bestanden |
| Direktauswahl und Wiederherstellung respektieren die vollständige Kette | Direkte Aktionshandler-Aufrufe, beschädigte gespeicherte Vorgänger und ausgeschlossene abhängige Versuche; vollständiger Kernpfad ohne M09 in `catalog-policy.test.ts` | bestanden |
| Wiederholung bleibt möglich; späterer Fehlversuch erhält früheres Bestehen | Append-only Historie, spätere Fehlversuche und Browserneustart im selben Profil in `local-store.test.ts` / `check-local-history.mjs` | bestanden |
| Quellenwechsel und Migration deuten alte Antworten nicht um | `sources.test.ts`, `check-runtime.mjs`, Roharchivierungs-/Migrationstests; zusätzlicher Browser-Reload mit neu angeordneten Regelfeldern und unverändertem Ergebnis | bestanden |
| Lesefortschritt, Wissenstest und praktische Kompetenznachweise bleiben getrennt | Assessment nennt lokalen Selbsttest und fehlenden unabhängigen Kompetenznachweis; keine Evidence-/Reviewer-Pflichtcheckboxen; bestehende fünf Ansichten erhalten | bestanden |

M09 bleibt eine ausdrücklich optionale Spezialisierung nach M01. M02–M08 und CAP werden dadurch nicht gesperrt. Diese Erweiterung verändert die Abnahme der Kernfolge nicht.

## Ausgeführte Prüfungen

- `npm test` unter `frontend/`: **37 Tests bestanden**; acht neue Bewertungs-/Startgrenztests und ein zusätzliches Test-Szenario zu isolierten Freigabe-Flags.
- `npm run build`: erfolgreich; initiales Produktionsbundle rund 330 kB, innerhalb des bestehenden Budgets.
- `node scripts/check-runtime.mjs`: erfolgreich, 18 lesende API-Anfragen; Quelleneinstellungen, getrennte Repositories, Fragen-/Commitwechsel, Fehler/Wiederholung, Tastatur und Konfigurations-Reload.
- `node scripts/check-local-history.mjs`: erfolgreich, 21 lesende API-Anfragen; persistierter Aufstieg, optionaler M09-Zweig, Schreibabbruch/Retry, Wiederholungen, zweiter Tab, Import/Export, beschädigte Ketten und vollständiger Browserneustart.
- `node scripts/check-level-gates.mjs`: erfolgreich; direkte gesperrte Aktionen, fehlende/ungültige Fragen, unvollständige Abgabe, 2/3-/3/3-Grenze, wiederholte Verarbeitung, historischer Regel-Reload, verlorener Speicherzugriff und Wiederherstellung.
- Der neue Browsercheck prüft alle fünf Ansichten mit 1440 und 390 px, Navigation per Tastatur und fehlenden horizontalen Überlauf. Keine Browser-Laufzeitfehler. Screenshots des Lernbaums entstehen im System-Temp-Verzeichnis als `issue11-tree-1440.png` und `issue11-tree-390.png`.
- `git diff --check`: erfolgreich.

## Reproduktion und Grenzen

Die Browserchecks wurden mit separat installiertem Playwright und Chromium gegen den Angular-Entwicklungsserver auf Port 4201 ausgeführt. `LEARNING_STUDIO_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_TEST_MODULE` und `PLAYWRIGHT_CHROMIUM` entsprechen der [Betriebsdokumentation](../README.md). Der neue Check verwendet zusätzlich Angulars Debug-API für echte Handleraufrufe bei umgangenen UI-Sperren. Dieser Nachweis gilt für den Entwicklungsmodus; der Produktionsmodus wird durch den erfolgreichen Build geprüft, nicht durch Debug-API-Aufrufe.

GitHub-Antworten und Commits in den Browserprüfungen sind kontrollierte Fixtures. Schreib-/Lesefehler und Uhrgrenzen werden gezielt simuliert. Das ist kein Nachweis für Manipulationssicherheit gegen den lokalen Gerätebesitzer, unabhängige Reviewer-Identitäten oder praktischen Kompetenzerwerb. Die Dashboard-Auswertung (#12) und Gesamtabnahme (#13) bleiben eigenständige offene Arbeitspakete; das Epic wird mit #11 nicht als abgeschlossen gemeldet.
