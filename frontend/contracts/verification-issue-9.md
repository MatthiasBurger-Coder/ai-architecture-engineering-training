# Verifikation · Issue #9

Geprüft am 24.10.2026 im Arbeitsstand auf Basis von Revision `e44ab3f9623106db57dc5194272f568b08967aa4`. Dieser Nachweis gehört zum gemeinsam reviewbaren Diff; es wurde keine neue Revision veröffentlicht und das Issue nicht geschlossen.

## Automatisierte Tests

`cd frontend && npm test`: **13 Tests bestanden**.

- [Quellenadapter, Validierung und Integration](../src/app/sources.test.ts): gemeinsame und getrennte Repository-Konfiguration; Branch, verschachtelter Branch, Commit, Lightweight- und annotierter Tag; exakte Ref-Antwort, zyklisches Tag; ungültige Pfade/Refs/Provider/Trainings/Fragen; Base64, UTF-8, leere/zu große Dateien; fehlende Ressourcen, Netzwerk, Berechtigungen und Rate Limits; unveränderte GET-Optionen ohne Credentials/Antwortdaten; Commit-Wechsel am laufenden Adapter, unveränderlicher Versuchsstand, feste Material-Commits, veraltete asynchrone Antworten, unabhängige Quellen, gesperrter neuer Fragenstand und Wiederholung; Markdown ohne aktive HTML-Inhalte und automatische Bilder.
- [Katalogdateien, Snapshots und Demo-Gates](../src/app/progress.test.ts): sämtliche neun Original-Manifeste und Fragensätze erfüllen den Vertrag; eingetragene Markdown-Dateien existieren; Single Choice und 75-%-Grenze; unvollständige/ungültige Antworten; Auswertung aus historischem Snapshot; sequenzielle Demo-Sperren und keine Übernahme alter Positionsantworten als neue Ergebnisse.

`cd frontend && npm run build`: Produktionsbuild erfolgreich. Keine Build-Synchronisierung und keine statischen Fragenimporte. Bereits lokal vorhandene `public/materials`-Altdateien werden über die Asset-Konfiguration vom Bundle ausgeschlossen.

## Browserintegration

Chromium mit Playwright, Entwicklungsserver über HTTP, Desktop 1440 × 1100 und Mobil 390 × 844. Der wiederholbare Ablauf steht in [scripts/check-runtime.mjs](../scripts/check-runtime.mjs). Die GitHub-API wurde mit kontrollierten Antworten abgefangen; reale Angular-Komponente, IndexedDB und Markdown-Darstellung blieben aktiv.

Ergebnis: **bestanden**, keine JavaScript-Laufzeitfehler und kein horizontaler Seitenüberlauf in Skill Tree, Learning Workspace, Assessment Center oder Training Administration. Die vorhandene Struktur, Farben und Navigation wurden anhand der Referenzbilder beibehalten.

Geprüfter Ablauf:

1. Getrennte Inhalts-/Fragenrepositories lokal speichern; doppelte Training-ID ablehnen, ohne Git-Anfrage und ohne Änderung des gültigen Standes.
2. Manifest laden, Markdown öffnen, relative Folgelektion am ursprünglichen Commit nachladen, Lesemarkierung setzen. Keine Ausführung von HTML und kein automatisches Bildladen.
3. Test starten, Antwort per Tastatur wählen, aktuellen Git-Commit aktualisieren und Fragenrepository wechseln. Der gestartete Versuch behält ursprünglichen Commit, Fragen und Antworten; neue Versuche verwenden den neuen Stand.
4. Gesperrtes Training bleibt gesperrt; Rückkehr zum begonnenen Training erhält den Versuch. Unvollständige Antworten erlauben keine Auswertung. Vollständiger Test wird anhand seines Snapshots ausgewertet.
5. Neuen leeren Fragensatz laden: sichtbarer `INVALID_DATA`-Fehler, kein Teststart. Gültige erneute Aktualisierung stellt Startfähigkeit wieder her, ohne Frontend-Neubau.
6. Vollständiger Seiten-Reload: Quellenkonfiguration bleibt in IndexedDB erhalten. Eine bestehende rohe LocalStorage-Demo-Zeichenfolge bleibt unverändert. Neue Sitzungsversuche werden nicht als dauerhaft gespeicherte Ergebnisse ausgegeben.
7. Desktop und schmale Mobilansichten visuell und auf Überlauf prüfen, einschließlich langer Commit-Angaben und Konfigurationseditor.

Der Browserdurchlauf erfasste 18 ausschließlich lesende API-Anfragen ohne Request-Body. Lokale Screenshot-Artefakte des Durchlaufs: `/tmp/issue9-assessment-desktop.png`, `/tmp/issue9-Training-Administration-mobile.png`, `/tmp/issue9-Learning-Workspace-mobile.png`, `/tmp/issue9-Assessment-Center-mobile.png` und `/tmp/issue9-Skill-Tree-mobile.png`. Diese temporären Artefakte sind kein dauerhaft veröffentlichtes Nachweispaket.

## Nachweisgrenzen

Es wurde kein GitHub-Repository verändert und keine Veröffentlichung vorgenommen. Die neuen `materials.json` und v1-Fragendateien müssen vor echtem Betrieb an einem konfigurierten öffentlichen Git-Ref verfügbar sein. Die kontrollierte Browserintegration belegt keinen erfolgreichen Abruf dieser bislang lokalen Dateien aus GitHub und keine Verfügbarkeit unter realen Rate Limits. Das ist in der [Betriebsanleitung](../README.md) ausdrücklich beschrieben; es gibt keinen stillen Fallback.

Die dauerhafte Versuchshistorie, vollständige Legacy-Archivierung, qualifizierte Levelketten und Kennzahlen sind Liefergegenstand von #10–#12; die Gesamtabnahme bleibt #13. Die in #9 weiter sichtbaren Gates sind ausdrücklich simuliert und gelten nur in der Sitzung.
