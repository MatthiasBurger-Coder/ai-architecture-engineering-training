---
name: preserve-learning-studio
description: Bewahrt den vom Nutzer bestätigten Aufbau und die Gestaltung des Angular Learning Studios im Repository ai-architecture-engineering-training bei Frontend-Erweiterungen, Fehlerkorrekturen und Backend-Anbindungen. Nicht auf andere Anwendungen übertragen.
---

# Learning Studio bewahren

Der Nutzer hat den bestehenden Anwendungsaufbau am 24.10.2026 bestätigt und möchte ihn als feste Grundlage behalten. Entwickle Funktionen innerhalb dieses Aufbaus weiter. Ändere Navigation, Ansichtenstruktur oder visuelle Richtung nur, wenn der Nutzer eine entsprechende Änderung ausdrücklich beauftragt. Eine allgemeine Feature-Anforderung ist kein Auftrag zum Redesign. Spätere ausdrückliche Nutzeranweisungen haben Vorrang.

## Vor einer Änderung

- Prüfe, dass du im Learning-Studio-Projekt arbeitest: Root-README „AI Architecture Engineering Training“, Angular-Anwendung unter `frontend/`.
- Lies [references/baseline.md](references/baseline.md) für die bestätigte Struktur und deren Zuständigkeiten.
- Bei sichtbaren Änderungen betrachte die passenden Referenzbilder: [Desktop](references/desktop.png), [Mobil](references/mobile.png). Die Bilder dokumentieren den bestätigten Skill Tree mit leerem Demo-Profil; sie definieren keine exakten Text-, Fortschritts- oder Pixelwerte für jede Ansicht.
- Lies die betroffenen aktuellen Quelldateien. Bewahre vorhandene Nutzeränderungen; ein Referenzbild ist kein Anlass, sie zurückzusetzen.

## Änderungen einpassen

- Behalte die fünf Hauptansichten, ihre Reihenfolge, die linke Navigation sowie die Grundaufteilung mit Kopfzeile, Inhaltsbereich und Fortschrittsübersicht bei.
- Bewahre im Skill Tree die vertikale Trainingsfolge mit Verbindungslinie, auswählbaren Karten und eigenem Detailbereich. Ersetze diesen Aufbau nicht ungefragt durch ein Raster, Kanban-Board oder eine neue Visualisierungsbibliothek.
- Verwende die bestehende helle, ruhige Gestaltung mit Grün-/Salbeitönen, warmen Statusakzenten, abgerundeten Flächen und bestehender Typografie. Führe keine zweite Designsprache ein.
- Erweitere fachliche Inhalte in der zuständigen Ansicht. Backend-Integration, neue Lernmaterialien und interne Refactorings dürfen die bestätigte Benutzerführung beibehalten; sie benötigen keine zusätzliche Freigabe allein aufgrund dieses Skills.
- Halte Lesefortschritt, Assessment-Entscheidung und Kompetenznachweis getrennt. Lasse gesperrte Trainings inspizieren, aber nicht über UI-Aktionen ohne erfüllte Voraussetzungen starten oder bestehen.
- Kennzeichne Simulationen weiter als solche. Stelle lokale Checkboxen niemals als echte Test-, Evidence- oder Reviewer-Ergebnisse dar. Bei einer beauftragten Backend-Anbindung dürfen echte serverseitige Entscheidungen die Simulation ersetzen.
- Bewahre den Unterschied zwischen fachlichen Regeln und Demo-Implementierung: LocalStorage, drei Demo-Kompetenzen pro Modul und die konkrete Komponentenaufteilung sind keine dauerhaften Architekturvorgaben.

## Passend prüfen

Bei Codeänderungen `npm test` und `npm run build` unter `frontend/` ausführen. Bei sichtbaren Änderungen, sofern Browserprüfung verfügbar ist, Desktop und schmale Mobilansicht prüfen: Navigation, Karten, Detailbereich, Lesbarkeit, Tastaturbedienung und horizontaler Überlauf. Prüfe bei Änderungen an Fortschritt oder Gates außerdem Sperren, Freigabe und Speicherung. Neue Referenzbilder nur bei ausdrücklich beauftragter Änderung der gestalterischen Grundlage ersetzen.

Für eine gewünschte Live-Vorschau `npm start` unter `frontend/` verwenden und eine erfolgreiche HTTP-Antwort abwarten. Das Startskript bindet an `0.0.0.0`. Bei WSL-Verbindungsproblemen zuerst den laufenden Prozess und Port 4200 prüfen; die aktuelle WSL-IP ermitteln, statt eine frühere IP zu übernehmen. Einen zuvor laufenden Vorschauprozess nicht als Nebenwirkung dieser Dokumentationsvorgaben beenden.
