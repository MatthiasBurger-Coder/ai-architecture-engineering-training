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

## Lokale Historie und Wiederherstellung

Abgeschlossene Wissenstests werden unveränderlich in IndexedDB (`ai-training-local`, Version 1) gespeichert: UUID, tatsächliche Start-/Abschlusszeit, Training, vollständiger Fragensnapshot mit Version und Commit, Antworten, Bewertungsregel, Punkte und erfüllte Vorgängerreferenzen. Wiederholungen ergänzen die Historie. Erneutes Speichern derselben ID und desselben Inhalts erzeugt kein Duplikat; abweichender Inhalt wird abgelehnt. Offene Tests bleiben bis zum Reload in der Sitzung.

Erst eine vollständig abgeschlossene Speichertransaktion zählt zum lokalen Lernpfad. Bei Schreibfehlern bleibt das Ergebnis sichtbar in der Sitzung, ohne Levelaufstieg; „Erneut speichern“ verwendet dieselbe ID. Vor einem neuen Teststart wird der persistierte Stand neu gelesen, auch wenn ein anderer Tab ihn geändert hat. Nach einem Neustart werden gültige Versuche und commitgebundene Lesemarkierungen wiederhergestellt. Frühere bestandene Versuche gelten auch nach einem Fehlversuch oder Quellenwechsel. Das Assessment Center zeigt die Historie pro Training samt Herkunft; gespeicherte Antworten und Erklärungen lassen sich auch ohne verfügbare Fragenquelle ansehen. Ein Selbsttest ersetzt keine unabhängige Kompetenzprüfung. Simulierte Evidence-/Reviewer-Checkboxen geben keine Levels frei.

`ai-training-demo-v1` wird ausschließlich gelesen und unverändert in `legacy` archiviert. Diese alten Demo-Daten enthalten keine verlässlichen historischen Zeitstempel oder Quellenstände und erzeugen deshalb keine qualifizierten Versuche, Lesemarkierungen oder Levels. Ohne neue Nachweise beginnt der Lernpfad bei M01. Wiederholte Migration desselben Rohwertes ist ein No-op; ein anderer Wert bei vorhandenem Archiv erzeugt einen sichtbaren Konflikt und erhält beide Werte. Beschädigte Altdaten bleiben als `corrupt` zugänglich.

**Training Administration** bietet „Speicher erneut laden“, „Sicherung exportieren“, „Rohdaten exportieren“ und lokalen JSON-Import per Textfeld. Eine Sicherung enthält das versionierte `LocalDataset`; eine zusätzliche Recovery-Datei erhält rohe Store-Werte samt Schlüsseln und den aktuellen LocalStorage-Wert. Die Recovery-Datei ist kein importierbarer qualifizierter Verlauf. Bei beschädigten Datensätzen werden gültige unabhängige Ketten weiterhin ausgewertet; betroffene und abhängige Versuche zählen nicht. Originale werden weder repariert noch gelöscht. Auch eine unbekannte Datenformat- oder DB-Version blockiert reguläre Schreibvorgänge und wird sichtbar gemeldet; der Rohdatenexport kann eine vorhandene neuere DB-Version lesend öffnen.

Ein Import validiert das gesamte Dataset und alle Voraussetzungsketten vor dem Schreiben und vereinigt die Daten atomar. Identische IDs sind idempotent, Konflikte brechen den gesamten Import ab. Bestehende Quellen bleiben erhalten. Quellen aus der Sicherung werden separat zur Prüfung angeboten und erst durch „Quellen lokal speichern“ aktiviert. „Offene Versuche verwerfen“ betrifft nur offene Sitzungstests; Historie, Lesemarkierungen, Altdaten und ausstehende Speicherungen bleiben erhalten.

Die Speicherung gehört zum **Browserprofil und zur Origin (Schema, Host, Port)**. Ein anderer Port, Host oder Browser hat einen eigenen Bestand. Privatmodus, gelöschte Browserdaten und automatische Speicherbereinigung können Datenverlust verursachen. Es gibt keine Synchronisierung oder garantierte Aufbewahrung durch den Browser; lokale JSON-Sicherungen ermöglichen die Wiederherstellung. Antworten, Ergebnisse, Versuch-IDs und Lesemarkierungen werden weder hochgeladen noch an GitHub angehängt. GitHub erhält ausschließlich GET-Anfragen mit Quellkoordinaten, ohne Credentials oder Referrer. Kein Konto und kein zentraler Backend-Dienst erforderlich.

Der optionale Browsercheck [scripts/check-runtime.mjs](scripts/check-runtime.mjs) benötigt ein separat installiertes Playwright mit `@playwright/test` und Chromium sowie einen laufenden Entwicklungsserver. Start: `node scripts/check-runtime.mjs`. `LEARNING_STUDIO_URL` setzt eine abweichende Serveradresse; `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_TEST_MODULE` und `PLAYWRIGHT_CHROMIUM` erlauben vorhandene lokale Installationspfade. Der Check verwendet kontrollierte API-Antworten, ein eigenes temporäres Browserprofil und schreibt Screenshots ins temporäre Systemverzeichnis.

[Verifikation zu #9](contracts/verification-issue-9.md) beschreibt Tests und Nachweisgrenzen. [Verträge](contracts/learning-contracts-v1.md), [Datenmodelle](src/app/contracts.ts) und [synthetische Fixtures](src/app/contracts.fixtures.ts) bleiben die Grundlage für #10–#13.

Der zusätzliche Browsercheck `node scripts/check-local-history.mjs` verwendet dieselben Playwright-Umgebungsvariablen. Er prüft mit einem temporären persistenten Profil auch das Schließen und Neustarten des Browsers, Speicherabbrüche, Wiederholungen, Migration, beschädigte Ketten und lokale Wiederherstellung. [Verifikation zu #10](contracts/verification-issue-10.md) dokumentiert den geprüften Stand.
