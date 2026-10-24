# Bestätigter Aufbau · 24.10.2026

## Anwendung und Navigation

Produkt: **AI Engineering · Learning Studio**, deutschsprachiges Trainings-Frontend für AI Architecture Engineering.

Die linke Navigation enthält in dieser Reihenfolge:

1. **Skill Tree** — Einstieg und Übersicht des Lernpfads.
2. **Learning Workspace** — Modulmaterialien, Lektionen, Aufgaben und Lesefortschritt.
3. **Assessment Center** — Tests, Evidence, Reviewer-Entscheidung und Gate-Ergebnis.
4. **Competency Dashboard** — erworbene Fähigkeiten und offene Voraussetzungen.
5. **Training Administration** — Trainingskatalog, später Registrierung von Fachtrainings und Spezialisierungen.

Die äußere Hülle besteht aus Seitenleiste mit Marke und Lernprofil, oberer Breadcrumb-Zeile und Hauptinhalt. Der Hauptinhalt beginnt mit Titel und kurzer Einführung, gefolgt von vier Kennzahlen: bestandene Trainings, verbleibende Schritte, Kompetenzen und Gesamtfortschritt. Inhalte dürfen dynamisch werden.

## Skill Tree

- Statusfilter: Alle Trainings, Verfügbar, Bestanden, Gesperrt; ergänzende Trainingssuche.
- Große Lernpfadfläche links mit Legende und vertikaler Verbindungslinie.
- Pro Training: nummerierter Knoten, Modulkennung, Status, Titel, kurze Einordnung und Aufwand, soweit belegt.
- Detailfläche rechts: Status, Modulkennung, Titel, Leitfrage, Lernziele, Voraussetzung und Aktion zum Öffnen.
- Auswahl einer gesperrten Karte zeigt Voraussetzungen; Öffnen des Trainings bleibt gesperrt.
- Desktop: Lernbaum und Detailfläche nebeneinander. Mobil: kompakte Navigation und Detailfläche unterhalb des Lernbaums, ohne horizontalen Seitenüberlauf.

Bestehende Reihenfolge: M01 LLM Foundations → M02 Tool Calling → M03 MCP Engineering → M04 RAG & Retrieval → M05 Context Engineering → M06 Agentic Patterns → M07 Evaluation → M08 Security & Governance → CAP Governed Agentic System.

Dies ist der bestätigte initiale Katalog. Explizit beauftragte neue Fachtrainings oder Spezialisierungen dürfen ihn erweitern, ohne die Grundstruktur der Anwendung zu ersetzen.

## Weitere Ansichten

- Learning Workspace: Trainingsauswahl, Materialnavigation und Lesebereich; Lernen führt zum zugehörigen Assessment.
- Assessment Center: Trainingsauswahl, klare Gate-Bedingungen und nachvollziehbares Ergebnis. Aktuell drei ausdrücklich simulierte Bestätigungen für Tests, Evidence und Reviewer.
- Competency Dashboard: Übersicht je Training mit Fähigkeiten, Status und fehlenden Voraussetzungen; Rückweg zum Training.
- Training Administration: aktueller Katalog und Zurücksetzen des lokalen Demo-Fortschritts. Neue Trainings sind noch nicht über eine API registrierbar; diese Fähigkeit ist später ergänzbar.

## Gestaltung

Helle Arbeitsoberfläche mit weißer Seitenleiste und weißer Kopfzeile, leicht getöntem Hintergrund, feinen Trennlinien, zurückhaltenden Schatten und runden Karten. Primärfarbe ist dunkles Grün, ergänzt durch Salbei-/Olivtöne. Verfügbar verwendet warme Gold-/Bernsteintöne, Bestanden Grün und Gesperrt entsättigte neutrale Töne. Status wird zusätzlich mit Text bezeichnet. Keine alleinige Farbcodierung.

Bestehende zentrale Farben: Hintergrund `#f6f7f4`, Text `#263b35`, Primäraktion `#334e36`; Schriftfamilien DM Sans und Manrope mit Sans-Serif-Fallback. Bestehende Breakpoints: 1500, 1150, 900 und 680 Pixel. Diese Werte beschreiben die Referenz; gezielte Korrekturen für Lesbarkeit und Barrierefreiheit sind zulässig, wenn die visuelle Richtung und Struktur bestehen bleiben.

Die Referenzbilder zeigen 1440 Pixel Desktop-Breite beziehungsweise 390 Pixel Mobil-Breite. Bildhöhe und Inhalte ergeben sich aus dem vollständigen Lernpfad.

## Quellen und technische Grenzen

- `frontend/src/app/app.html`: Ansichten und Layout.
- `frontend/src/styles.css`: Gestaltung und responsive Regeln.
- `frontend/src/app/app.ts`: Interaktionen und lokaler Zustand.
- `frontend/src/app/catalog.ts`: aktueller Trainingskatalog.
- `frontend/src/app/progress.ts`: sequenzielle Demo-Freigaben.
- `frontend/scripts/materials.mjs`: Spiegelung bestehender Markdown-Lernmaterialien.
- `frontend/README.md`: Start, Funktionsumfang und bekannte Grenzen.

Die Anwendung ist Angular; geplant sind Spring Boot für REST, Benutzer- und Trainingsverwaltung, eine deterministische Assessment Engine, PostgreSQL für Fortschritt und Prüfungsentscheidungen sowie GitHub für versionierte Materialien und Evidence. Backend-Anbindung soll die bestätigte Oberfläche weiterverwenden. Python-Labore bleiben eigenständig; eine separate Plattform-Assessment-Engine wurde im initialen Checkout nicht gefunden.

LocalStorage und Demo-Gates sind austauschbare Prototypdetails. Keine echten Nachweise aus dem Vorhandensein von Lernmaterialien oder Referenzlösungen ableiten. Lesen allein bedeutet nicht bestanden.
