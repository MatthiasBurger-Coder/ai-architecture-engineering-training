# Learning Studio · Angular-Prototyp

Lokales Frontend für den bestehenden Lernpfad M01–M08 und Capstone.

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

- **Skill Tree:** sequenzieller Lernpfad entsprechend dem Repository, Statusfilter, Suche, auswählbare Trainings und Voraussetzungen. Ein neues Profil beginnt bei M01.
- **Learning Workspace:** vorhandene Modulübersichten, Lektionen und Aufgaben als Markdown; separat gespeicherter Lesefortschritt. Mermaid-Diagramme werden vorerst als Quelltext angezeigt.
- **Assessment Center:** pro Training vier Multiple-Choice-Verständnisfragen mit genau einer richtigen Antwort je Frage. Ab drei richtigen Antworten (75 %) ist der Wissenstest bestanden. Die Auswertung zeigt richtige Antworten und Erklärungen; vor der Modulfreigabe sind Wiederholungen möglich. Erst ein bestandener Wissenstest, die drei ausdrücklich simulierten Nachweise für automatische Tests, Evidence und Reviewer-Zustimmung sowie das vorherige Modul erlauben die Demo-Freigabe. Praktische Tests oder Reviews werden weiterhin nicht ausgeführt.
- **Competency Dashboard:** Trainingsziele und durch Demo-Gates bestätigte Fähigkeiten, inklusive offener Voraussetzungen.
- **Training Administration:** Katalogübersicht und Zurücksetzen der lokalen Demo. Die Registrierung neuer Trainings ist als späterer Ausbau beschrieben.

Fortschritt liegt ausschließlich unter `ai-training-demo-v1` im Browser-LocalStorage. Er stellt keinen belastbaren Prüfungsnachweis dar. Quiz-Antworten werden mit einer Fragenversion gespeichert; das Ergebnis wird daraus neu berechnet. Frühere reine Checkbox-Freigaben ohne bestandenen Wissenstest werden beim Laden zurückgenommen, Lesemarkierungen bleiben erhalten. Ein Speicherfehler wird angezeigt. Kein Login, keine Synchronisierung zwischen Geräten und keine Backend-Verbindung.

## Lernmaterialien

`npm start` und `npm run build` synchronisieren Markdown-Dateien aus `../modules` und `../ROADMAP.md` nach `public/materials`. Dieses generierte Verzeichnis wird nicht eingecheckt. Änderungen an Lernmaterialien während eines laufenden Servers mit `npm run materials` übernehmen. Das Frontend verändert keine Trainingsdateien. Verweise auf Python- und andere nicht gespiegelte Dateien sind in diesem Prototyp nicht als Downloads verfügbar; die Originaldateien liegen weiterhin im Repository.

## Nächster Ausbau

Das Trainingsmodell liegt in `src/app/catalog.ts`, die browserlokale Freigabelogik in `src/app/progress.ts`, die Auswertung in `src/app/quiz.ts`. Die Fragen, Antwortmöglichkeiten, richtigen Antworten und Erklärungen gehören zum jeweiligen Training: `../modules/M*/assessment/quiz.json` beziehungsweise `../capstone/assessment/quiz.json`. Das Frontend importiert diese JSON-Dateien direkt; es gibt keine zweite Kopie der fachlichen Inhalte. `version` bezeichnet den Fragenstand, `questions` enthält `prompt`, `options`, den nullbasierten Antwortindex `correct` und `explanation`. Bei inhaltlichen Änderungen an Fragen oder Antworten die jeweilige `version` erhöhen, damit alte Antworten nicht neu interpretiert werden. Für die nächste Stufe ersetzt eine Spring-Boot-API den lokalen Zustand und liefert Katalog, Lernfortschritt und Assessment-Entscheidungen. Die deterministische Assessment Engine und Reviewer-Entscheidungen werden serverseitig autoritativ; PostgreSQL persistiert diese mit Evidence-Referenzen auf GitHub. Die Python-Labore bleiben unverändert. Eine separate Plattform-Assessment-Engine ist in diesem Checkout nicht enthalten.
