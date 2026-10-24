# Learning Studio · Angular-Prototyp

Lokales Frontend für den Lernpfad M01–M08 und Capstone. Die fünf Ansichten und der Lernbaum bleiben die Grundlage.

## Starten

Voraussetzung: Node.js 24.15 oder neuer innerhalb der Version 24 und npm.

```bash
cd frontend
npm ci
npm start
```

Danach `http://localhost:4200` öffnen. Der Entwicklungsserver bindet an `0.0.0.0`.

```bash
npm test
npm run build
```

Das Produktions-Bundle liegt in `dist/training/browser`. Start und Build kopieren keine Lernmaterialien und importieren keine Frageninhalte mehr.

## Quellen zur Laufzeit konfigurieren

**Training Administration** enthält eine lokale JSON-Konfiguration. Für jedes Training lassen sich **content** (Materialmanifest) und **questions** (Fragendatei) getrennt mit Repository, Ref und Pfad konfigurieren. Gleiche oder verschiedene öffentliche GitHub-Repositories sind zulässig. Beispiel für ein einzelnes Training:

```json
{
  "schemaVersion": 1,
  "trainings": [{
    "trainingId": "M01",
    "content": {
      "provider": "github-public",
      "repository": { "owner": "MatthiasBurger-Coder", "name": "ai-architecture-engineering-training" },
      "ref": { "kind": "branch", "value": "main" },
      "path": "modules/M01-llm-foundations/materials.json"
    },
    "questions": {
      "provider": "github-public",
      "repository": { "owner": "MatthiasBurger-Coder", "name": "ai-architecture-engineering-training" },
      "ref": { "kind": "branch", "value": "main" },
      "path": "modules/M01-llm-foundations/assessment/quiz.json"
    }
  }]
}
```

„Quellen lokal speichern“ validiert den gesamten neuen Stand und speichert ihn transaktional in IndexedDB (`ai-training-local`, Version 1, Store `settings`, Schlüssel `sources`). Ungültige Eingaben ändern die aktive Konfiguration nicht. Fehlende Trainings erhalten keine Ersatzquelle. Beim ersten Start wird der Katalog mit allen neun Quellen vorbelegt. **Die neuen Manifeste und das v1-Fragenformat müssen am konfigurierten Git-Ref veröffentlicht sein**; ein lokaler Checkout ändert GitHub nicht. Bis dahin zeigt die Anwendung einen Quellenfehler und verwendet keine Build-Kopie.

Im **Learning Workspace** beziehungsweise **Assessment Center** lädt die Anwendung die jeweilige Quelle bei Bedarf. „Laden / aktualisieren“ löst den Ref bewusst neu auf. Repository, angefragter Ref, Dateipfad und vollständiger Commit werden angezeigt. Materialien und relative Markdown-Verweise verwenden immer den Commit des geladenen Manifests. Fragen lösen ihren Commit unabhängig auf. Ein Quellenfehler beeinträchtigt nur die betroffene Quelle; erneutes Laden ist möglich. Bei GitHub-Limits wird eine angegebene Wartezeit eingehalten. Kein Polling, keine Authentifizierung, keine Tokens oder privaten Repositories.

## Inhalte und Fragen pflegen

Die versionierten Originale liegen unter `modules/M*/materials.json`, `modules/M*/assessment/quiz.json` und entsprechend unter `capstone/`. Es gibt keine zweite Fragenkopie im Frontend. Die Manifeste legen Reihenfolge, stabile Material-IDs, Titel, Art und wurzelrelative Markdown-Pfade fest. Die Modulübersichten sowie Lektionen und Aufgaben sind initial eingetragen; Capstone verweist auf `ROADMAP.md`.

Fragen verwenden den Vertrag aus [#8](contracts/learning-contracts-v1.md): `schemaVersion`, `trainingId`, positive `version` sowie stabile Frage- und Options-IDs mit `correctOptionId`. IDs bei späteren Änderungen beibehalten, statt sie anhand der aktuellen Reihenfolge neu zu vergeben. Bei fachlichen Änderungen `version` erhöhen. Unbekannte Felder, falsche Trainingszuordnung, doppelte IDs, leere Fragen und ungültige Antworten werden abgelehnt. Vor Teststart werden Fragenanzahl und Bestehensgrenze angezeigt: mindestens `ceil(3 * Fragenanzahl / 4)` richtige Antworten.

„Wissenstest starten“ erzeugt eine eigene Kopie von Fragen, Herkunft und Bewertungsregel mit UUID und Startzeit. Quellenwechsel und Aktualisierung ändern diesen Versuch nicht. Beim Trainingwechsel bleibt der Versuch bis zum Seiten-Reload erhalten; zurückwechseln setzt ihn mit den bisherigen Antworten fort. „Versuch abbrechen“ verwirft ihn bewusst, „Wissenstest wiederholen“ erlaubt einen neuen Start mit dem aktuellen Stand. Auswertung und Erklärungen beziehen sich stets auf den gestarteten Snapshot.

Markdown gilt als nicht vertrauenswürdig. HTML wird als Text dargestellt, Bilder werden nicht automatisch geladen, relative Markdown-Links werden lesend am gleichen Commit geöffnet. Andere Downloads und unsichere Links bleiben deaktiviert. Externe HTTPS-Links öffnen nur nach Nutzeraktion mit `noopener noreferrer`. Mermaid-Diagramme erscheinen als Quelltext.

## Lokaler Zwischenstand und Grenzen

Diese Lieferung implementiert **#9**, den Quellenadapter und dessen UI-Integration. Versuchshistorie, Archivierung der Demo-Altdaten, Export/Import und dauerhafte Level-Freigaben folgen in **#10 und #11**, Kennzahlen in **#12**. Die v1-IndexedDB-Stores werden bereits angelegt; bisher wird ausschließlich die Quellenkonfiguration gespeichert.

Wissenstestergebnisse, Lesemarkierungen und ausdrücklich simulierte Gates gelten in diesem Zwischenstand **nur für die aktuelle Sitzung**. Sie sind keine qualifizierten, dauerhaft gespeicherten Nachweise. Ein bestandener Sitzungstest und alle drei simulierten Nachweise erlauben weiterhin die sequenzielle Demo-Freigabe; Lesen allein reicht nicht. Reload beginnt bei M01. Quellenwechsel bewerten vorhandene Sitzungsergebnisse nicht neu. Vorhandenes `ai-training-demo-v1` bleibt unverändert für die spätere Migration erhalten und erzeugt keine neuen Levels. „Sitzung zurücksetzen“ löscht weder diese Altdaten noch gespeicherte Quellen.

GitHub erhält ausschließlich GET-Anfragen mit Quellkoordinaten, ohne Credentials oder Referrer. Antworten, Ergebnisse und Lesemarkierungen werden nicht übertragen. Kein Konto, keine Gerätesynchronisierung, kein zentraler Backend-Dienst. Browserprofil und Origin bestimmen den lokalen Konfigurationsbestand.

Der optionale Browsercheck [scripts/check-runtime.mjs](scripts/check-runtime.mjs) benötigt ein separat installiertes Playwright mit `@playwright/test` und Chromium sowie einen laufenden Entwicklungsserver. Start: `node scripts/check-runtime.mjs`. `LEARNING_STUDIO_URL` setzt eine abweichende Serveradresse; `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_TEST_MODULE` und `PLAYWRIGHT_CHROMIUM` erlauben vorhandene lokale Installationspfade. Der Check verwendet kontrollierte API-Antworten, ein eigenes temporäres Browserprofil und schreibt Screenshots ins temporäre Systemverzeichnis.

[Verifikation zu #9](contracts/verification-issue-9.md) beschreibt Tests und Nachweisgrenzen. [Verträge](contracts/learning-contracts-v1.md), [Datenmodelle](src/app/contracts.ts) und [synthetische Fixtures](src/app/contracts.fixtures.ts) bleiben die Grundlage für #10–#13.
