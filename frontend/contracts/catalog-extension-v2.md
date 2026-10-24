# Katalog-Erweiterung v2 (M09)

**Status: Design-Spezifikation, nicht implementierte Quellen-/Persistenzmigration.** Die verbindliche v1-Spezifikation von Issue #8 bleibt unverändert und beschreibt M01–M08 plus CAP als lineare Folge. Die Demo verwendet jetzt einen **separaten Katalog-Gate-Graphen**.

## Trainingsidentitäten und Freigaben
- M01: Eingang ohne Vorgänger.
- M02: M01; M03: M02; M04: M03; M05: M04; M06: M05; M07: M06; M08: M07; CAP: M08.
- **M09:** M01 als alleinige Voraussetzung. M09 ist optional und darf M02–M08 und CAP nicht sperren.
- ID M09 bleibt bei zukünftigen Erweiterungen stabil; die fachliche Bedeutung wird nicht still geändert.

## Migration des angekündigten IndexedDB- und GitHub-Quellenmodus
Ein neuer *versionierter* Katalogvertrag muss Trainings-IDs und DAG-Voraussetzungen abbilden. Existierende v1-Historien bleiben unverändert; bei Migration werden frühere bestandene Vorgänger beibehalten, keine fehlenden M09-Versuche als bestanden erfunden. Ein Abschluss muss tatsächliche und gültige Vorgängerreferenzen nachweisen, nicht bloß eine fortlaufende Prefix-Liste. Erweiterte Prüfungen und Persistenz müssen die beschriebene Datenstruktur, den Herkunftsnachweis und die Freigaberegel eigenständig implementieren. Keine unversionierte Änderung an vorhandenen v1-Vertragsobjekten vornehmen.

## Unveränderte UI
Die fünf bestätigten Ansichten, der vertikale Lernbaum, der Detailbereich, die Auswahlmöglichkeiten und die simulierten Nachweise bleiben erhalten. M09 ist lediglich ein zusätzliches Training mit eigenem Eingangsgate; dies ist **keine** Umgestaltung.
