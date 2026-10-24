# Learning Studio · Angular-Prototyp

Lokales Frontend für den bestehenden Lernpfad M01–M08, optionale M09-Spezialisierung und Capstone.

## Starten

Voraussetzung: Node.js 24.15 oder neuer innerhalb der Version 24 und npm.

```bash
cd frontend
npm ci
npm start
```

Danach `http://localhost:4200` öffnen.

```bash
npm test
npm run build
```

Das Produktions-Bundle liegt in `dist/training/browser`.

## Enthaltene Ansichten

- **Skill Tree:** Lernpfad mit M01→M02–M08→CAP und paralleler M09-Spezialisierung ab M01, Statusfilter, Suche, auswählbare Trainings und Voraussetzungen. Ein neues Profil beginnt bei M01.
- **Learning Workspace:** vorhandene Modulübersichten, Lektionen und Aufgaben als Markdown; separat gespeicherter Lesefortschritt. Mermaid-Diagramme werden vorerst als Quelltext angezeigt.
- **Assessment Center:** pro Training vier Multiple-Choice-Verständnisfragen mit genau einer richtigen Antwort je Frage. Ab drei richtigen Antworten (75 %) ist der Wissenstest bestanden. Die Auswertung zeigt richtige Antworten und Erklärungen; vor der Modulfreigabe sind Wiederholungen möglich. Erst ein bestandener Wissenstest, die drei ausdrücklich simulierten Nachweise für automatische Tests, Evidence und Reviewer-Zustimmung sowie das vorherige Modul erlauben die Demo-Freigabe. Praktische Tests oder Reviews werden weiterhin nicht ausgeführt.
- **Competency Dashboard:** Trainingsziele und durch Demo-Gates bestätigte Fähigkeiten, inklusive offener Voraussetzungen.
- **Training Administration:** Katalogübersicht und Zurücksetzen der lokalen Demo. Die Registrierung neuer Trainings ist als späterer Ausbau beschrieben.

Fortschritt liegt ausschließlich unter `ai-training-demo-v1` im Browser-LocalStorage. Er stellt keinen belastbaren Prüfungsnachweis dar. Quiz-Antworten werden mit einer Fragenversion gespeichert; das Ergebnis wird daraus neu berechnet. Frühere reine Checkbox-Freigaben ohne bestandenen Wissenstest werden beim Laden zurückgenommen, Lesemarkierungen bleiben erhalten. Ein Speicherfehler wird angezeigt. Kein Login, keine Synchronisierung zwischen Geräten und keine Backend-Verbindung.

## Lernmaterialien

`npm start` und `npm run build` synchronisieren Markdown-Dateien aus `../modules` und `../ROADMAP.md` nach `public/materials`. Dieses generierte Verzeichnis wird nicht eingecheckt. Änderungen an Lernmaterialien während eines laufenden Servers mit `npm run materials` übernehmen. Das Frontend verändert keine Trainingsdateien. Verweise auf Python- und andere nicht gespiegelte Dateien sind in diesem Prototyp nicht als Downloads verfügbar; die Originaldateien liegen weiterhin im Repository.

## Verbindliche Verträge für den lokalen Selbsttrainingsmodus

[Issue #8: Quellen-, Bewertungs- und Speicherkontrakte v1](contracts/learning-contracts-v1.md) legt die Grundlage für Epic #7 fest: getrennt konfigurierbare öffentliche GitHub-Quellen zur Laufzeit, unveränderliche Fragenstände, 75-%-Bewertung, lokale IndexedDB-Versuchshistorie und Freigabe erst nach erfolgreicher Speicherung. Demo-Altdaten werden unverändert archiviert; mangels historischer Herkunft entstehen daraus keine neuen qualifizierten Levels. [Datenmodelle](src/app/contracts.ts), [synthetische Beispieldaten](src/app/contracts.fixtures.ts) und [Vertragsreview mit Nachweisgrenzen](contracts/review-issue-8.md) gehören zur Spezifikation.

Diese Verträge sind noch nicht an die Anwendung angebunden. Die oben beschriebene Demo verwendet weiterhin statische Quellen, LocalStorage und simulierte Gates. Die Umsetzung folgt in #9–#12; die Gesamtabnahme in #13.

## Ausgangsmodell und weiterer Ausbau

Das Trainingsmodell liegt in `src/app/catalog.ts`, die browserlokale Freigabelogik in `src/app/progress.ts`, die Auswertung in `src/app/quiz.ts`. Die Fragen, Antwortmöglichkeiten, richtigen Antworten und Erklärungen gehören zum jeweiligen Training: `../modules/M*/assessment/quiz.json` beziehungsweise `../capstone/assessment/quiz.json`. Das Frontend importiert diese JSON-Dateien direkt; es gibt keine zweite Kopie der fachlichen Inhalte. `version` bezeichnet den Fragenstand, `questions` enthält `prompt`, `options`, den nullbasierten Antwortindex `correct` und `explanation`. Bei inhaltlichen Änderungen an Fragen oder Antworten die jeweilige `version` erhöhen, damit alte Antworten nicht neu interpretiert werden. Für den beauftragten lokalen Selbsttrainingsmodus gemäß Epic #7 sind weder Spring Boot noch PostgreSQL, ein Benutzerkonto oder ein zentraler Backend-Dienst vorgesehen. Ein erfolgreich gespeicherter Wissenstest mit erfüllten Voraussetzungen wird die simulierten Pflicht-Gates ersetzen. Antworten und Ergebnisse bleiben auf dem Gerät. Die Python-Labore bleiben eigenständige Übungen; eine separate Plattform-Assessment-Engine ist in diesem Checkout nicht enthalten.

## M09-Erweiterung des Demo-Katalogs

Das neue Modul M09 wird nach erfolgreich absolviertem M01 als unabhängige Spezialisierung freigegeben. M02 bleibt ebenfalls nach M01 verfügbar, und CAP benötigt weiterhin M08, nicht M09. Das Demo-Gate bleibt simuliert. Der getrennte normative Quellen-/Speicherkontrakt v1 aus Issue #8 verwendet bisher nur M01–M08 und CAP; eine spätere produktive Katalogv2-Migration muss versioniert umgesetzt werden. Siehe [Katalog-Erweiterung v2](contracts/catalog-extension-v2.md).
