# Learning Studio: Quellen-, Bewertungs- und Speicherkontrakte v1

Status: verbindliche Zielspezifikation für [#8](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/8), Grundlage des [Epics #7](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/7). Stand: 24.10.2026. Änderungen an diesen Entscheidungen erfolgen versioniert in Git. Eine inkompatible Änderung erhöht die betroffene `schemaVersion` beziehungsweise die Bewertungsregel-ID; bestehende Historie wird nicht umgedeutet.

Die [TypeScript-Datenmodelle](../src/app/contracts.ts) und [Beispieldaten](../src/app/contracts.fixtures.ts) gehören zum Vertrag. TypeScript ersetzt keine Laufzeitvalidierung. **Diese Lieferung implementiert keine Git-Abfragen, Migration, Persistenz oder neue Level-Freigabe.** Implementierungs- und Prüfzustand stehen im [Vertragsreview](review-issue-8.md).

## 1. Geltung und Zuständigkeit

Ein Level ist eine stabile Training-ID aus `M01` bis `M08` und `CAP`, in genau dieser Reihenfolge. Katalog und Reihenfolge bleiben im Frontend; Quellen können weder Trainings hinzufügen noch Voraussetzungen ändern. Ein späterer Ausbau des Katalogs benötigt einen neuen Katalogvertrag. Die fünf Ansichten und der Lernbaum mit Detailbereich bleiben erhalten. Training Administration konfiguriert Quellen und lokale Daten, Learning Workspace zeigt Inhalte, Assessment Center führt Tests aus, Competency Dashboard wertet lokale Ergebnisse aus.

Das Ziel ist persönliches Selbsttraining ohne Konto, zentralen Anwendungsserver oder Cloud-Persistenz. Ein bestandener Wissenstest ist keine unabhängige Zertifizierung praktischer Kompetenz. Simulierte Tests/Evidence/Reviewer sind im Zielmodus keine zusätzliche Freigabebedingung. Die Referenzarchitektur und Python-Labore des Trainings bleiben eigenständiger Lernstoff.

| Vertrag | Umsetzung und Verantwortung | Voraussetzung |
| --- | --- | --- |
| Quellen, Materialmanifest, Fragen und Laufzeitschutz | Frontend #9 | dieser Vertrag; initiale Manifeste und Formatumstellung der Modulfragen gehören zu #9 |
| IndexedDB, Verlauf, Migration, Export/Import | Frontend #10 | dieser Vertrag; unabhängig vom fertigen Git-Adapter mit Fixtures umsetzbar |
| Bewertung und sequenzielle Freigabe | Frontend #11 | validierte Quellen aus #9, transaktionaler Speicher aus #10 |
| Lokale Kennzahlen | Frontend #12 | validierter Verlauf aus #10, Abschlussintegration nach #11 |
| Gesamtbetrieb und Laufzeitnachweise | Qualitätssicherung #13 | #9–#12 gegen denselben Stand |

## 2. Quellenvertrag (FE-01, FE-02, FE-04)

`SourceConfiguration` enthält pro konfiguriertem Training genau ein `TrainingSources` mit getrennten `content`- und `questions`-Quellen. Nicht konfigurierte Trainings sind sichtbar, aber ohne ladbare Materialien beziehungsweise ausführbaren Test. Doppelte oder unbekannte Training-IDs machen die gesamte neue Konfiguration ungültig. Ein partieller Konfigurationsstand ist zulässig; fehlende Quellen werden nicht heimlich durch Build-Dateien ersetzt.

- Die aktuelle Laufzeit liest ausschließlich den im Frontend-Build bereitgestellten lokalen Checkout. Bestehende Konfigurationsfelder `provider`, `repository` und `ref` bleiben zur Wahrung gespeicherter Konfigurationen vorhanden, werden aber nicht verwendet. Es gibt keine GitHub-/Raw-Aufrufe und keine Authentifizierung.
- Die Pfade bezeichnen Dateien ab Repository-Wurzel. Der Sync-Schritt vor `npm start` und `npm run build` stellt `modules/`, `capstone/` und `ROADMAP.md` unter `frontend/public/training-content/` bereit.
- Ref ist explizit `branch`, `tag` oder `commit`. Branch-/Tagnamen sind nicht leer und entsprechen gültigen Git-Refnamen (keine Steuerzeichen, Leerzeichen, `..`, `@{`, `~^:?*[\\`, leere Segmente, führender/abschließender Slash, abschließender Punkt oder `.lock`-Segment; keine mit Punkt beginnenden Segmente). Commit ist ein vollständiger kleingeschriebener SHA mit 40 Hexzeichen. Keine mehrdeutigen Kurz-SHAs oder implizite Default-Branch.
- `path` bezeichnet eine Datei ab Repository-Wurzel: bei Inhaltsquellen ein JSON-Materialmanifest, bei Fragenquellen eine JSON-Fragendatei. Pfade bestehen aus nicht leeren Segmenten mit Buchstaben, Ziffern, `_`, `-`, `.`; `.`/`..`, Backslashes, URLs, `%`, Query/Fragment und führende Slashes sind verboten. Materialien enden auf `.md`, Manifest/Quiz auf `.json`. Das ist eine bewusst begrenzte v1-Pfadmenge.
- Konfiguration ist lokal und ohne Neubau änderbar. Speichern validiert sie zuerst; „Aktualisieren“ löst den Ref bewusst neu auf. Änderungen an einem Feld verwerfen den Ladezustand der betroffenen Quelle. Langsame Antworten einer früheren Konfiguration dürfen aktuelle Daten nicht überschreiben. Content und Fragen sind unabhängig; dasselbe Repository und unterschiedliche Refs/Pfade sind zulässig. Eine defekte Inhaltsquelle blockiert keinen gültigen Test und umgekehrt.

### Lokaler lesender Zugriff

1. `ResolvedSource` verwendet eine lokale Checkout-Kennung, keine GitHub-Commitauflösung.
2. Manifeste, Materialien und Fragen werden als same-origin-Dateien unter `training-content/{path}` geladen. UTF-8-Text ist auf 1 MB begrenzt; JSON und fachliche Schemas werden vor Verwendung validiert.
3. Relative Materiallinks werden ebenfalls aus dem lokalen Checkout geladen. Die Herkunftsanzeige nennt „Lokaler Checkout“ und den relativen Dateipfad.
4. Es erfolgen keine HTTP-Aufrufe an GitHub oder andere externe Quellen. Das Lesen lokaler Assets enthält keine Antworten, Ergebnisse oder Historie.

### Materialmanifest und Darstellung

`MaterialManifest` hat `schemaVersion: 1`, dieselbe `trainingId` wie die Konfiguration und mindestens einen Materialeintrag mit nicht leerem Titel, eindeutigem `id`, `kind` (`overview`, `lesson`, `exercise`) und eindeutigem `.md`-Pfad. Alle Pfade sind wurzelrelativ im selben Repository/Commit; keine Verzeichnisrekursion erforderlich. Reihenfolge im Array ist die Navigation. Material-IDs und Fragen-/Options-IDs sind 1–100 Zeichen aus `[A-Za-z0-9_-]`.

Markdown wird als nicht vertrauenswürdig behandelt: kein ausführbares HTML, Skript oder eingebetteter aktiver Inhalt. Keine automatisch geladenen externen Bilder, Fonts oder Frames aus Quellen. Relative Markdown-Links dürfen nur im gleichen Commit über den Adapter geöffnet werden; andere relative Dateien werden als nicht unterstützter Download angezeigt. Externe HTTPS-Links nur nach bewusster Nutzeraktion mit `noopener noreferrer` öffnen, niemals lokale Daten anhängen. Fehler eines Materials betreffen dessen Lesebereich; das validierte Manifest und andere Einträge bleiben nutzbar. Leere/ungültige UTF-8-Dateien sind `INVALID_DATA`.

### Zustände und Fehler

`SourceState<T>` ist `idle`, `loading`, `ready` oder `error`. Nur vollständig validierte Daten erzeugen `ready`. Initiale Fehler erlauben keinen Teststart. Aktualisierungsfehler kennzeichnen den aktuellen Stand als nicht verfügbar; keine stille Rückkehr zu einer älteren Quelle. Bereits gestartete Versuche und persistierte Historie bleiben davon unabhängig. Lokale Datei- und Validierungsfehler können nach Korrektur der Checkout-Datei erneut geladen werden.

| Fehlercode | Ursache | Sichtbare Reaktion |
| --- | --- | --- |
| INVALID_CONFIG | unzulässige Koordinaten, unbekannte/mehrfache Trainingszuordnung | Feldbezogene Korrektur, keine Anfrage |
| UNSUPPORTED_SOURCE | anderer Provider/Host oder explizit private Quelle | Hinweis auf öffentliche GitHub-Quellen, keine Authentifizierung anfordern |
| FILE_NOT_FOUND | Checkout-Datei fehlt | Pfad und lokalen Checkout prüfen |
| NETWORK | lokale Datei konnte nicht gelesen werden | Entwicklungsserver/Build-Ausgabe und Wiederholaktion prüfen |
| INVALID_DATA | ungültiges JSON, Schema, falsche Zuordnung, leere oder zu große Datei | Quelldatei und konkretes Validierungsfeld prüfen; kein Test/Freigabe |

## 3. Fragen, Versuchsbindung und Bewertung (FE-02, FE-03, FE-06)

`QuestionSet` ist ein JSON-Objekt mit exakt den dokumentierten Feldern. Für alle v1-Vertragsobjekte gilt: erforderliche Felder müssen existieren, unbekannte Felder/Schema-Versionen werden abgelehnt, keine Typkonvertierung, alle Zahlen endlich. Nicht leere Texte dürfen nach `trim()` nicht leer sein. Arrays sind dicht; `null`, Lücken und Duplikate sind keine Antworten.

- `schemaVersion` ist 1, `trainingId` muss zur konfigurierten Training-ID passen. `version` ist eine positive sichere Ganzzahl und wird bei jeder fachlichen Änderung an Prompt, Optionen, richtiger Antwort oder Erklärung erhöht. Commit plus Quelle bleibt auch bei versehentlich nicht erhöhter Version unterscheidbar.
- Mindestens 1, maximal 100 Fragen. Eindeutige Frage-IDs pro Fragensatz, je 2–10 Optionen mit eindeutigen Options-IDs und nicht leeren, innerhalb der Frage unterschiedlichen Texten. Genau ein `correctOptionId` muss auf eine dieser Optionen zeigen. Prompt und Erklärung sind nicht leer; maximale Textlänge je Feld 10.000 Zeichen. Fragen sind Single Choice, keine Teilpunkte oder Negativpunkte.
- Alle Fragen werden in Dateireihenfolge ohne Zufallsauswahl gestellt. Ein Versuch verlangt genau eine vorhandene Option für jede Frage, keine zusätzlichen oder doppelten Frage-IDs. Unvollständige oder ungültige Antworten sind kein abgeschlossener Versuch, kein Fehlversuch und kein speicherbares Ergebnis.
- Beim Start werden UUID v4 (`crypto.randomUUID()`), tatsächliche UTC-Startzeit, vollständiger validierter Fragensnapshot, `ResolvedSource`, Regel und erfüllte Vorgängerreferenzen in den Sitzungsspeicher übernommen. Der Snapshot ist eine unabhängige Kopie. Quellenwechsel, Aktualisierung oder Trainingwechsel ändern ihn nicht. Bei offenem Versuch muss ein Wechsel im Assessment bewusst den Versuch abbrechen oder zum alten Versuch zurückkehren; kein Vermischen. Reload verwirft unvollständige Sitzungsversuche, abgeschlossene Historie bleibt erhalten.
- Beim Abschluss werden `completedAt` (UTC ISO 8601 mit Millisekunden) und `CompletedAttempt` erzeugt. Ende darf nicht vor Beginn liegen; bei zurückgestellter Systemuhr ist eine sichtbare Korrektur erforderlich, keine erfundene Zeit. Keine Herkunftsangabe kommt aus der aktuellen statt der gestarteten Quelle.

Verbindliche Regel `single-choice-75-v1`: jede richtige Antwort 1 Punkt, sonst 0. `possible = Fragenanzahl`, `earned = Anzahl richtiger Antworten`, `required = ceil(3 * possible / 4)`, `passed = earned >= required`. Ganzzahlige Rechnung entscheidet; Anzeige auf zwei Nachkommastellen kaufmännisch runden: `floor((10000 * earned + possible / 2) / possible) / 100` Prozent. Ein angezeigter gerundeter Wert entscheidet niemals das Bestehen. Grenze vor Start anzeigen.

| Richtig / Fragen | Erforderlich | Anzeige | Ergebnis |
| --- | --- | --- | --- |
| 2 / 4 | 3 | 50,00 % | nicht bestanden |
| 3 / 4 | 3 | 75,00 % | bestanden |
| 2 / 3 | 3 | 66,67 % | nicht bestanden |
| 3 / 5 | 4 | 60,00 % | nicht bestanden |
| 4 / 5 | 4 | 80,00 % | bestanden |
| 1 / 1 | 1 | 100,00 % | bestanden |

Die aktuell vorhandenen `quiz.json` mit Positionsindizes bleiben bis #9 im Prototypformat. #9 stellt die Originaldateien auf diesen Vertrag um: `trainingId`, `schemaVersion`, stabile fachlich gepflegte Frage-/Options-IDs, `correctOptionId`; keine zweite Inhaltskopie. Neue Regeln dürfen nicht unter der alten Regel-ID laufen.

## 4. Lokaler Speicher und Freigabe (FE-03–FE-06)

**Entscheidung: IndexedDB**, Datenbank `ai-training-local`, DB-Version 1. Eine abgeschlossene Versuchshistorie enthält komplette Fragenstände und wächst über LocalStorage hinaus. IndexedDB ermöglicht asynchrone, atomare Schreibvorgänge über mehrere Stores. LocalStorage wird ausschließlich zum Lesen/Erhalten von `ai-training-demo-v1` verwendet. Kein automatischer Fallback zu einer flüchtigen Speicherung mit erfolgreicher Freigabe.

| Store / Schlüssel | Inhalt |
| --- | --- |
| `attempts` / `id` | unveränderliche `CompletedAttempt`, Index `trainingId` |
| `settings` / `sources` | eine `SourceConfiguration` |
| `read` / kanonische JSON-Tupelidentität | `ReadMarker`; Identität aus Training, Owner/Repo kleingeschrieben, Commit, Pfad, Material-ID |
| `legacy` / `ai-training-demo-v1` | unveränderte rohe Zeichenfolge, Importzeit und Status |
| `meta` / `schemaVersion` | Datenformat 1 |

`LocalDataset` ist der logische versionierte Export dieser Daten, nicht ein neuer autoritativer `passed`-Store. Persistierte Versuche enthalten alle in `CompletedAttempt` definierten Angaben. `prerequisites` enthält für jedes vorangehende Training genau eine Referenz auf einen gültigen gespeicherten bestandenen Versuch. M01 hat `[]`. Keine simulierten Gate-Felder, keine Freigabe-Flags. IDs und Bewertungsdaten werden auch beim Wiederherstellen überprüft.

### Atomarer Abschluss und Wiederholungen

1. Start prüft die aus persistenten Daten abgeleiteten Voraussetzungen; ein gesperrtes Training lässt sich inspizieren, aber weder durch Navigation noch direkte Aktion starten/abschließen.
2. Abschluss validiert Snapshot, Antworten, Regel und Zeitangaben. Score wird aus diesem Snapshot berechnet. Eine `readwrite`-Transaktion auf `attempts` prüft sämtliche Vorgängerreferenzen erneut und fügt den Versuch hinzu. Vorgänger müssen bereits abgeschlossen sein (`completedAt <= startedAt`) und eine gültige azyklische Kette bilden. Referenzen sind eindeutig und müssen zur Training-ID passen. Keine rückwirkende Freigabe zuvor unzulässiger Versuche.
3. Erst `transaction.oncomplete` erlaubt „dauerhaft gespeichert“ und Aktualisierung der Levelanzeige. Erfolgreiches einzelnes `put`/`add` reicht nicht. Quota-/Security-/Abbruchfehler zeigen „nicht gespeichert“, behalten das Ergebnis in der Sitzung und ermöglichen erneutes Speichern mit derselben ID. Kein Levelaufstieg bis zur erfolgreichen Transaktion. Blockierter DB-Upgrade meldet den zu schließenden anderen Tab; keine Löschung als Reparatur.
4. Wiederholtes Speichern derselben ID mit identischem Inhalt ist idempotent, ein unterschiedlicher Inhalt unter derselben ID wird abgelehnt. Ein neuer Test hat eine neue ID; ein Fehlversuch überschreibt niemals einen älteren Versuch. Mehrere Tabs werden durch DB-Transaktionen koordiniert, lesen nach Abschluss neu und bieten vor jedem Start einen aktuellen Gate-Stand.

### Wiederherstellen und Ableiten

Bei Start/Import wird jeder Versuch strukturell und fachlich validiert: Quelle/Commit, übereinstimmende Training-ID, Snapshot, Regel-ID und Konstanten, vollständige Antworten, neu berechneter Score und Voraussetzungskette. Die Neuberechnung verwendet ausschließlich den gespeicherten Snapshot; weder aktuelle Git-Daten noch aktuelle statische Quiz-Imports dürfen alte Antworten neu bewerten. Ein manipuliertes `score.passed` genügt nicht. Ungültige Datensätze werden sichtbar als nicht auswertbar behandelt und bleiben zur Wiederherstellung erhalten; keine automatische Reparatur erfundener Angaben. Abhängige Versuche einer defekten Kette zählen ebenfalls nicht.

Für jedes Training zählt mindestens ein gültiger, erfolgreich persistierter bestandener Versuch mit erfüllter Voraussetzungskette. Die längste lückenlose Folge dieser Trainings bestimmt erreichte Levels und das nächste verfügbare Training. Spätere Fehlversuche widerrufen Bestehen nicht. Ein neuer Browserstand beginnt mit M01. Fehlende Fragenquellen verhindern neue Tests, nicht die Anzeige gültiger historischer Ergebnisse.

**Quellen-/Versionswechsel widerrufen erworbene Levels nicht.** Training-ID ist die fachliche Levelidentität; Quelle, Pfad, Ref, Commit, Fragensatzversion und Regel sind historische Versuchsmerkmale. Ein neuer Stand gilt für neu gestartete Tests. Alte Ergebnisse bleiben mit Herkunft und Versionshinweis sichtbar. Kein automatisches Reassessment, keine Antwortübernahme in neue Versuche. Bei grundlegend anderer Bedeutung eines Trainings darf dessen ID nicht wiederverwendet werden. Lesefortschritt hat eigene commitgebundene Marker und beeinflusst kein Gate; neue Materialstände gelten zunächst als ungelesen.

## 5. Migration, Beschädigung und Wiederherstellung (FE-03, FE-04, FE-06)

Das alte Format hat nur `passed`, `read` und `quizzes` mit Versionsnummer/Positionsantworten, aber keine Versuchs-ID, historischen Zeitstempel, unveränderlichen Fragenstand, Commit oder Bewertungsregel. Deshalb werden daraus **keine qualifizierten neuen Versuche oder Levels erzeugt**, auch wenn Antworten aktuell richtig erscheinen.

1. Vor jeder Änderung rohe Zeichenfolge aus `ai-training-demo-v1` lesen. Bei Zugriffsfehler Migration als blockiert anzeigen, keinen Erfolg melden. Nicht existierender Schlüssel benötigt keine Migration.
2. In einer IDB-Transaktion `legacy` lesen und, wenn noch nicht vorhanden, unter festem Schlüssel unverändert archivieren; tatsächliches `importedAt`, `archived` bei gültigem alten Objekt, sonst `corrupt`. Altes Objekt: nur bekannte Felder, `passed`/`read` Stringarrays, `quizzes` optionales Objekt mit positiven ganzzahligen Versionen und Arrays nicht negativer ganzzahliger Antworten; keine Aussage über damalige Richtigkeit. Auch unbekannte/teilweise Formen werden roh erhalten, aber als `corrupt` gekennzeichnet.
3. Den LocalStorage-Schlüssel weder löschen noch normalisieren/überschreiben. Keine erfundenen IDs, Commit-SHAs, Abschlusszeiten oder Punktestände für Altdaten. Archiv separat als „Demo-Altdaten, kein qualifizierter Verlauf“ zugänglich halten. Alte Lesepfade bleiben im Archiv einsehbar, werden ohne Herkunft keinem neuen Commit zugeordnet. Neue Lesemarkierungen funktionieren unabhängig.
4. Archivschlüssel ist der Migrationsmarker: erneuter Start mit identischen Altdaten ist ein No-op. Bei anderer roher Zeichenfolge und bereits vorhandenem Archiv Konflikt anzeigen, beide Datenbestände erhalten (LocalStorage und Archiv), Export beider ermöglichen; Archiv nicht überschreiben. Kein partieller Migrationserfolg bei Transaktionsabbruch.
5. UI erläutert nach Migration: Demo-Fortschritt erhalten, neue Levels beginnen mangels historischer Nachweise bei M01. Die Daten dürfen nicht als verschwunden erscheinen. Nutzer kann den Wissenstest erneut ablegen; das erzeugt einen echten neuen lokalen Versuch mit aktuellen Angaben.

DB nicht lesbar, unbekannte DB-/Exportversion oder beschädigte aktuelle Datensätze: Fehler und betroffenen Umfang anzeigen, nichts automatisch löschen, keine Freigabe aus ungeprüften Daten. Gültige unabhängige Ketten dürfen weiter ausgewertet werden. Wiederherstellung erfolgt durch erneuten Speicherzugriff oder expliziten lokalen JSON-Export/Import im bestehenden Administrationsbereich. Export umfasst `LocalDataset` und, bei Korruption/Konflikt, zusätzlich eine getrennte rohe Recovery-Datei mit unveränderten betroffenen Werten; diese ist kein importierbarer qualifizierter Verlauf.

Import validiert das gesamte Dataset einschließlich aller Ketten vor dem Schreiben, vereinigt in einer Transaktion, behandelt identische IDs idempotent und lehnt Konflikte unter bestehenden IDs ab. Bestehende Einstellungen werden beim Zusammenführen beibehalten; die Quellenkonfiguration einer Sicherung wird zur bewussten separaten Übernahme angeboten. Ungültige Daten oder unbekannte Versionen ändern den Bestand nicht. Export/Import bleibt auf dem Gerät, kein Upload. Ein Reset löscht Daten nur nach ausdrücklicher Nutzeraktion mit Hinweis auf Export; auch Legacy-Archiv/LocalStorage sind dann explizit Teil der Löschentscheidung, nie Nebenwirkung einer Migration.

Browserprofil, Origin (Schema/Host/Port) und Browserdaten bestimmen die Speichergrenze: anderer Port/Host ist ein anderer Datenbestand; Privatmodus und Löschen von Browserdaten können Verlust bewirken. Keine Synchronisierung, kein garantierter Schutz vor Browser-Eviction; Export ist der Wiederherstellungsweg. Kein Schutzversprechen gegen lokale Manipulation durch den Gerätebesitzer. Regelmäßige Sicherungen sind eine lokale Nutzerentscheidung.

## 6. Auswertung und konkrete Beispiele (FE-05)

Nur validierte qualifizierte Versuche zählen zu Kennzahlen. Pro Training: Anzahl abgeschlossener Versuche, letztes Ergebnis nach `completedAt` (bei Gleichheit lexikografische Versuch-ID), bestes Ergebnis nach exaktem Verhältnis `earned/possible` (Kreuzmultiplikation); bei Gleichheit jüngstes Ergebnis, dann lexikografisch größte ID. Historische Stände vergleichend anzeigen und je Versuch Version/Commit/Regel nennen; keine Gleichwertigkeit verschieden schwerer Fragen behaupten. Bestehensstatus folgt der gültigen Kette, nicht dem letzten Score. Gesamtfortschritt = bestandene Levels / 9, Anzeige analog auf zwei Dezimalstellen. Leere Historie: 0 Versuche, letztes/bestes Ergebnis „–“, 0 %, M01 verfügbar. Demo-Altdaten und nicht auswertbare Datensätze separat zählen/anzeigen, niemals als qualifizierte Versuche. Lesemarkierungen ändern keine dieser Zahlen.

Die ausführbaren TypeScript-Beispieldaten sind **synthetisch**, ihre Commit-SHAs sind keine Behauptung über existierende Git-Objekte. Sie sind zukünftige Testeingaben, keine erfolgreich ausgeführten Integrationstests.

| Beispiel in `contracts.fixtures.ts` | Erwartung | FE |
| --- | --- | --- |
| `sameRepository`, `separateRepositories` | getrennte konfigurierbare Quellen, gleiches oder anderes Repository zulässig | 01, 02 |
| `invalidSources`, `sourceFailures` | ungültiger Pfad/Ref/Provider/Zuordnung vor Anfrage abweisen; Netzwerk-/HTTP-Fehler wie Tabelle behandeln | 01, 02, 04 |
| `questionSet`, `invalidQuestions` | stabile Zuordnung, Single Choice; leere/falsche/mehrdeutige Daten verhindern Teststart | 02, 06 |
| `passedAttempt`, `failedRetry`, `changedVersionAttempt` | drei M01-Versuche, letztes Ergebnis 4/4, bestes 4/4, M01 weiterhin bestanden, Gesamt 1/9 = 11,11 % | 03, 05, 06 |
| `inFlightUpdate` | Start mit Version 1/SHA a; Laden Version 2/SHA b ändert diesen Versuch nicht | 02, 03 |
| `legacyValid`, `legacyCorrupt`, `migrationScenarios` | rohe Archivierung, keine erfundenen Nachweise, Wiederholung ohne Duplikat; Konflikt/Schreibfehler erhält Original | 03, 04, 06 |
| `restoreScenarios` | Score-Flag, fehlende Vorgänger, unvollständige Antworten oder Konflikt qualifizieren nicht; Speicherabbruch gibt kein Level frei | 03, 06 |
| `levelScenarios` | späterer Fehlversuch und Quellenwechsel behalten Freigabe; bloßes Lesen nicht | 05, 06 |

Nachfolgeprüfungen müssen darüber hinaus echte Adapterantworten, IndexedDB-Transaktionen, Reload/Neustart und Netzwerkmitschnitt abdecken; Beispieldaten allein erfüllen FE-01–06 nicht.
