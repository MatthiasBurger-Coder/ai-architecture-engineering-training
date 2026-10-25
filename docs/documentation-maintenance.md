# Dokumentation pflegen und prüfen

## Wann aktualisieren?

Aktualisiere die betroffenen Dokumente im selben Änderungszweig, wenn sich eine dokumentierte Schnittstelle oder ein Laufzeitverhalten ändert, ein Lernziel/Gate angepasst wird, eine Abhängigkeit oder Startanleitung geändert wird, Security-/Betriebsgrenzen betroffen sind oder ein Link-/Qualitätscheck einen Fehler findet.

## Review-Ablauf

1. Ermittle die betroffenen Leserpfade und maßgeblichen Verträge; aktualisiere den nächsten Einstieg und die detaillierte Quelle.
2. Prüfe Aussagen gegen Code, Konfiguration, Tests oder konkrete Trainings-Gates. Trenne implementiertes Verhalten, Zielarchitektur und geplante Arbeit.
3. Führe `npm run docs:check` im Repository-Stamm aus.
4. Für Änderungen an der Learning-Studio-Anwendung oder ihrer Dokumentation prüfe zusätzlich die passenden Frontend-Tests und den Build (`cd frontend && npm test && npm run build`). Bei reinen Textänderungen sind sie optionale Regressionsprüfungen.
5. Bei Moduländerungen verwende die fachlichen Prüfungen des Moduls; dokumentiere fehlende optionale Hardware-/Browser-Evidence ausdrücklich.
6. Reviewer prüfen fachliche Korrektheit, Links und Abgleich mit der Implementierung. Bei Security-Gates muss die zuständige fachliche Prüfung erhalten bleiben.

Der Autor der Änderung aktualisiert die Dokumentation; der normale Code-/Content-Reviewer prüft sie mit. Für ein Review, das eigene fachliche Kompetenz voraussetzt, wird ein geeigneter Modul- oder Security-Reviewer benannt. Automatisierte Checks ersetzen diese Verantwortung nicht.

## Automatischer Check

`npm run docs:check` (Node.js 24.x, im Repository-Stamm) ruft `frontend/scripts/check-docs.mjs` ohne zusätzliche Pakete auf. Der Check sammelt versionierte Markdown-Dateien außerhalb von `.git`, generierten Frontend-Verzeichnissen und `node_modules`; prüft relative Markdown-Links und lokale Anker sowie einfache Leerzeilen-/Überschriftenregeln. Externe URLs werden nicht abgefragt.

Der Checker ist bewusst klein und offline: er validiert weder vollständige CommonMark-Syntax noch fachliche Aussagen, Bilddarstellung, alle HTML-Linkformen oder externe Link-Erreichbarkeit. Neue Markdown-Syntax kann eine Verbesserung des Parsers erfordern. Ein Fehler wird mit Quelldatei und Link/Regel ausgegeben und liefert einen Exit-Code ungleich null.

Der GitHub-Workflow `.github/workflows/m09-learning-checks.yml` führt `npm run docs:check` im vorhandenen Learning-Studio-Job aus. Änderungen an allgemeinen Dokumenten lösen den Job aus; der Workflow ist deshalb um passende Pfade ergänzt. M09-spezifische Offline-Checks bleiben auf Änderungen im M09-Referenzbereich begrenzt.

## Zusammenhang

Einstieg: [README](../README.md) · Überblick: [Systemübersicht](system-overview.md) · Leserpfade und Befunde: [Audit](documentation-audit.md) · Inhaltsformen: [Vorlagen](templates/README.md)
