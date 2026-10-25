# Projektvorgaben

## Branch-Workflow

- Jede Entwicklungsaufgabe beginnt mit einem eigenen Feature- oder Issue-Branch, der automatisch vor der ersten Dateiänderung angelegt und ausgecheckt wird. Änderungen an Anwendungscode, Tests, Konfiguration und zugehöriger Dokumentation gehören in denselben passenden Arbeitsbranch. Auch kleine Fehlerkorrekturen und Dokumentationsaufgaben folgen dieser Regel.
- Zu Beginn Repository, Arbeitsbaum, aktuellen Branch, Default-Branch und vorhandene Nutzeränderungen prüfen. Steht der Checkout auf dem Default-Branch, davon unmittelbar einen beschreibenden Branch erstellen und auschecken, bevor Dateien bearbeitet werden. Nie Issue-Arbeit direkt auf dem Default-Branch committen oder pushen.
- Bei bereits ausgechecktem Feature-Branch diesen weiterverwenden, sofern er zur Aufgabe gehört. Bei einem unpassenden Branch oder Änderungen aus mehreren Aufgaben einen eigenen Branch von der geeigneten Basis erstellen, ohne bestehende Änderungen zu verlieren oder ungefragt zu verschieben.
- Branch-Namen nach Möglichkeit mit Issue-Nummer und Thema bilden, zum Beispiel `feature/13-local-training-acceptance`. Bei Tasks ohne Issue einen kurzen thematischen Namen verwenden.
- Wenn der Nutzer `push auto` oder den passenden Finish-Workflow beauftragt, auf diesem Branch committen und pushen, einen PR zum Default-Branch mit `Closes #<issue>` anlegen und den vorhandenen Repository-Automerge-Workflow nutzen. Keine zusätzliche Rückfrage für die ausdrücklich beauftragten Schritte stellen.
- Ein Issue erst dann als abgeschlossen melden und den Branch löschen, wenn der PR tatsächlich gemergt und das Issue geschlossen ist. Falls Merge-Automation fehlt, Checks fehlschlagen oder Schutzregeln blockieren, PR und Branch erhalten und den konkreten offenen Schritt nennen. Niemals den Default-Branch löschen.
- Vor Commits nur Änderungen des aktuellen Arbeitsauftrags aufnehmen; bestehende oder unabhängige Nutzeränderungen erhalten.

Der projektspezifische Skill [push-auto](.agents/skills/push-auto/SKILL.md) beschreibt den Ablauf im Detail.

## Bestätigter Anwendungsaufbau

Der Nutzer hat den aktuellen Aufbau des Angular Learning Studios bestätigt. Bei Änderungen am Frontend, an der Benutzerführung oder bei Backend-Anbindungen den projektspezifischen Skill [preserve-learning-studio](.agents/skills/preserve-learning-studio/SKILL.md) lesen und anwenden.

Die fünf Hauptansichten, Navigation, Lernbaum mit Detailbereich und bestehende visuelle Richtung bewahren. Funktionen innerhalb dieses Aufbaus weiterentwickeln. Eine Änderung der gestalterischen Grundlage oder der Ansichtenstruktur setzt einen entsprechenden ausdrücklichen Nutzerauftrag voraus; normale Fehlerkorrekturen und Funktionserweiterungen brauchen deshalb keine zusätzliche Bestätigung. Spätere ausdrückliche Nutzeranweisungen haben Vorrang.

Referenzbilder und fachliche Grenzen stehen im Skill. Diese Vorgaben gelten für diese Anwendung, nicht für unabhängige Trainingsübungen oder andere Projekte.
