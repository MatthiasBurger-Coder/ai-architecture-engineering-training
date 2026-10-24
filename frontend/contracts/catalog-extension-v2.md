# Katalog-Erweiterung v2 (M09)

Status: implementierte Ergänzung zu [v1](learning-contracts-v1.md). Die v1-Objekte und die Kernfolge M01–M08 → CAP bleiben unverändert gültig. Quellen-, Manifest-, Fragen-, Versuchs- und Sicherungsobjekte mit `schemaVersion: 2` erlauben zusätzlich M09. Unbekannte Versionen und M09 in einem v1-Objekt werden abgelehnt. Die Bewertungsregel bleibt `single-choice-75-v1`.

## Trainingsidentitäten und Freigaben

- M01 hat keine Voraussetzung.
- M02 benötigt M01; M03 benötigt M02; M04 benötigt M03; M05 benötigt M04; M06 benötigt M05; M07 benötigt M06; M08 benötigt M07; CAP benötigt M08.
- M09 benötigt ausschließlich M01. Die optionale Spezialisierung sperrt M02–M08 und CAP nicht.
- Die vorhandenen stabilen IDs behalten ihre Bedeutung. Katalog und Voraussetzungen bleiben im Frontend, Quellen dürfen sie nicht verändern.

Die zentrale [Katalogregel](../src/app/catalog-policy.ts) enthält direkte Voraussetzungen und bildet deren transitive Vorgänger. Ein gespeicherter Versuch referenziert genau einen gültigen, bereits abgeschlossenen bestandenen Versuch für jeden transitiven Vorgänger: M09 und M02 jeweils nur M01; CAP unverändert M01 bis M08. Die Prüfung erfolgt auch innerhalb der Abschluss-/Importtransaktion. Es gibt keine Prefix-Freigabe über die sichtbare Kartenreihenfolge.

## Quellen und Bestandsdaten

Neue Profile verwenden eine v2-Quellenkonfiguration für alle zehn Trainings. Existierende v1-Konfigurationen werden unverändert gelesen und nicht automatisch ergänzt. In Training Administration bietet „M09-Quellen ergänzen“ einen v2-Konfigurationsentwurf an, erhält bestehende Koordinaten und verlangt zur Aktivierung den bewussten normalen Speichervorgang. Die vorhandenen Quellen werden nicht ersetzt. Das M09-Manifest und die M09-Fragen liegen als v2-Originale im Modul; kein statischer Fragenimport oder Build-Materialfallback.

Die v2-Objekte behalten dieselben Felder wie v1; der erweiterte ID-Raum ist ausschließlich über die Versionsnummer freigeschaltet. Ein v1-Versuch enthält weiterhin einen v1-Snapshot. Neue Abschlüsse übernehmen die Schemaversion ihres gestarteten Snapshots. Ein v2-Versuch darf gültige v1-Vorgänger referenzieren. Frühere Quellen-/Fragenstände, Antworten, Zeitstempel, Regeln und IDs werden weder umgeschrieben noch neu erfunden.

Die IndexedDB-Datenbank `ai-training-local` bleibt bei DB-Version 1 und unverändertem Storelayout einschließlich `meta/schemaVersion = 1`. Dieses kennzeichnet das bestehende Speicherlayout; die Version der einzelnen Vertragsobjekte wird separat validiert. Es gibt keinen destruktiven DB-Upgrade und keine Massenumschreibung von Historie. v1- und v2-Versuche können gemeinsam gespeichert werden. Alte Clients können v2-Objekte nicht auswerten; für diese bleibt der Rohdatenexport verfügbar.

Neue Exporte heißen `learning-studio-v2.json` und verwenden `LocalDataset.schemaVersion = 2`. Sie können unveränderte v1-Konfigurationen/-Versuche und neue v2-Objekte enthalten. Vollständige v1-Sicherungen bleiben importierbar, müssen aber ausschließlich v1-Konfigurationen/-Versuche und alte Training-IDs enthalten. Das Zusammenführen bleibt atomar und idempotent; vorhandene Quellen bleiben erhalten. M09 wird niemals aus alten Demo-Altdaten freigeschaltet.

## Oberfläche und Nachweise

Die fünf Ansichten, Navigation, vertikaler Lernbaum und Detailbereich bleiben erhalten. M09 erscheint nach M01 mit dem Hinweis „Optionale Spezialisierung nach M01“. Voraussetzungen, Anzahl der Trainings und Fortschrittsnenner folgen dem Katalog mit zehn Einträgen. Die lokale Selbsttestfreigabe und Wiederherstellung aus #10 bleiben erhalten; Demo-Checkboxen werden nicht zurückgebracht.

[Integrationstests](../src/app/catalog-policy.test.ts) prüfen Versionsgrenzen, v1-Bestandsschutz, M09-Speicherung und die vollständige Kernfolge ohne M09. Der [Browsercheck](../scripts/check-local-history.mjs) prüft M01 → M09 und parallel M01 → M02 einschließlich Herkunft, Vorgängerreferenzen, Speicherung und Browserneustart.
