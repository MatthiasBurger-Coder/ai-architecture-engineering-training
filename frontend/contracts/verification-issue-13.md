# Gesamtabnahme · Issue #13

Prüfdatum: 25.10.2026. Geprüfter Anwendungskandidat: `dd35b59aff59d372b01feba01a92a96fa6b069b7`; Abnahmebericht und Betriebsdoku veröffentlicht in `bfde834` auf `main`. Tests, Build und Browserchecks liefen gegen den geprüften Arbeitsbaum auf Basis des Anwendungskandidaten. Ältere Browsernachweise zu #9–#11 stammen aus den dort ausgewiesenen Revisionen und sind ergänzende Historie.

## Ergebnis

**Gesamtabnahme teilweise bestanden, Epic-Abschluss weiter offen.** `npm test`, `npm run build` und alle drei Browserchecks bestehen auf dem dokumentierten Arbeitsbaum-Kandidaten. Der Netzwerknachweis basiert auf kontrollierten GitHub-API-Fixtures und beweist keinen Live-GitHub-Zugriff. Ein echter Browser-Netzwerkmitschnitt des Kandidaten bleibt offen; das Epic #7 wird daher nicht zum Abschluss empfohlen.

## FE-01–FE-06

| Kriterium | Implementierungsstand | Prüfschritt / Test | Ergebnis und Nachweis |
| --- | --- | --- | --- |
| FE-01 · Lerninhalte aus Git | Implementiert: getrennte Laufzeitquelle, Ref-/Commitauflösung, manuelle Aktualisierung und sichtbare Fehler; [git-source.ts](../src/app/git-source.ts), [source-settings.ts](../src/app/source-settings.ts) | `sources.test.ts`; `check-runtime.mjs` mit zwei kontrollierten Repositoryquellen, Refresh, fehlender/ungültiger Quelle und Retry | **Bestanden** in Unit- und Browsercheck am Kandidaten. Browser nutzt kontrollierte API-Fixtures. |
| FE-02 · Fragen aus Git und Versuchssnapshot | Implementiert: unabhängige Fragenquelle, strikte Vertragsprüfung, unveränderlicher Snapshot; [quiz.ts](../src/app/quiz.ts), [source-validation.ts](../src/app/source-validation.ts) | `sources.test.ts`, `grading.test.ts`; `check-runtime.mjs` prüft Fragen-/Quellenwechsel während eines offenen Versuchs und Tastaturbedienung | **Bestanden** in Unit- und Browsercheck am Kandidaten. |
| FE-03 · Dauerhafte lokale Ergebnisse | Implementiert: transaktionale IndexedDB-Historie, Wiederholungen, Migration, Export/Import und Recovery; [local-store.ts](../src/app/local-store.ts) | `local-store.test.ts`; `check-local-history.mjs` prüft Migration/Konflikt, Beschädigung, Transaktionsabbruch/Retry, Reload und Browserneustart im selben Profil | **Bestanden** in Unit- und Browsercheck am Kandidaten. |
| FE-04 · Ausschließlich lokaler Selbsttrainingsbetrieb | Implementiert/dokumentiert: kein Konto oder Anwendungsbackend; Quelldaten werden lesend aus öffentlichem GitHub geladen, Lerndaten bleiben in der Browser-Origin; [Betriebsdokumentation](../README.md#lokale-historie-und-wiederherstellung) | Browserchecks beobachten ausschließlich kontrollierte GET-Quellenabrufe (18 bzw. 21), ohne Antworten/Ergebnisse an Request anzuhängen | **Teilweise bestanden.** Fixture-Nachweis besteht; echter Browser-Netzwerkmitschnitt gegen den Kandidaten bleibt offen. |
| FE-05 · Auswertung lokaler Lernerfolge | Implementiert: lokale Historienkennzahlen, Versuche je Training, letzter/bester Score und Lesemarkierungen getrennt; [app.html](../src/app/app.html), [progress.ts](../src/app/progress.ts) | `npm test`; Runtime- und Historien-Browserchecks führen gespeicherte Versuche in die lokale Auswertung und prüfen die Ansichten | **Bestanden** für die getesteten Abläufe und Ansichten am Kandidaten. |
| FE-06 · Freigabe nur nach qualifiziertem Bestehen | Implementiert: ganzzahlige 75-%-Grenze, vollständige Antworten, gespeicherte Vorgängerkette und Fail-closed bei Speicherfehler; [catalog-policy.ts](../src/app/catalog-policy.ts), [quiz.ts](../src/app/quiz.ts) | Unit-Tests; `check-level-gates.mjs` prüft direkte gesperrte Aktionen, 2/3 vs. 3/3, Wiederherstellung und Speicherfehler | **Bestanden** in Unit- und Browsercheck am Kandidaten. |

## Kandidatenprüfungen

Ausgeführt unter `frontend/` mit Node.js 24.19.0 und npm 11.7.0:

- `npm test`: **37 bestanden, 0 fehlgeschlagen**.
- `npm run build`: **erfolgreich**, Angular Produktionsbundle 333.13 kB initial (87.80 kB geschätzter Transfer).
- `git diff --check`: erfolgreich nach den Dokumentationsänderungen.
- Browserchecks gegen frisch gestarteten Entwicklungsserver auf Port 4203, HTTP 200: `check-runtime.mjs` **bestanden** (18 GET-only API-Fixtures); `check-local-history.mjs` **bestanden** (21 GET-only API-Fixtures, kompletter Browserneustart); `check-level-gates.mjs` **bestanden**.
- Alle Browserchecks prüften Desktop 1440 px und Mobil 390 px; fünf Ansichten, Tastaturnavigation und keinen horizontalen Überlauf. Keine JavaScript-Laufzeitfehler.
- Installiert für die lokale Abnahme: Playwright / `@playwright/test` 1.64.1 per `npm install --no-save`; Chromium 1248 im Benutzer-Cache `/home/micro/.cache/ms-playwright`. `package.json` und Lockfile wurden dabei nicht geändert; die Browserwerkzeuge sind deshalb nicht projektseitig reproduzierbar installiert.

Die automatisierten und Browsertests decken die geforderten Quellen-, Validierungs-, Speicher-, Migrations-, Bewertungs- und Gatefälle am Arbeitsbaum-Kandidaten ab. Die Browserchecks ersetzen keinen echten Netzwerkverkehr: API-Antworten wurden kontrolliert. Getesteter Anwendungscode und Abhängigkeitssperre entsprechen Commit `dd35b59aff59d372b01feba01a92a96fa6b069b7`; der veröffentlichte Bericht liegt in `bfde834`. Die älteren Berichte #9–#11 bleiben historische Zusatznachweise.

## Offene Abnahmepunkte

- Echten Browser-Netzwerkmitschnitt eines dokumentierten lokalen Laufs sichern. Die kontrollierten API-Fixtures belegen, was die Tests absenden, aber nicht den Live-Netzwerkpfad.

## Betriebsmodell

Voraussetzungen, Start, Quellenkonfiguration, Datenbindung an Browserprofil und Origin, Migration, Sicherung/Wiederherstellung, Fragenversionen und Einschränkungen sind in der [Frontend-Betriebsdokumentation](../README.md) beschrieben. Der Selbsttrainingsmodus benötigt keinen zentralen Server, Login oder Cloud-Persistenz. GitHub wird ausschließlich lesend und ohne Zugangsdaten für öffentliche Inhalte angesprochen. Antworten, Ergebnisse und Berichte verbleiben lokal. Der lokale Selbsttest ist kein unabhängiger Kompetenznachweis.
