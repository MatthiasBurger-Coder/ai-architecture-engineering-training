# 08 — Contracts prüfen und an M03 übergeben

## 1. Inhalt

Ein Tooltest muss sowohl erwünschte Wirkung als auch unerwünschte Nicht-Wirkung
prüfen. „Wir bekommen einen Fehler“ reicht nicht, wenn vorher schon geschrieben
wurde. Deshalb vergleichen Negativtests zusätzlich den Backendzustand.

Vier Testebenen dürfen nicht verwechselt werden:

| Ebene | Prüft | Prüft nicht |
|---|---|---|
| Schema-Test | Zulässige Datenformen | Fachliche Wahrheit |
| Runtime-/Policy-Test | Dispatch, Scope, Freigabe, Replay | Modellqualität |
| Adapter-/Integrationstest | Abbildung auf echte API | Gesamten Agentenerfolg |
| Modell-Evaluation | Passende Toolwahl und Argumente | Serverseitige Autorisierung |

Das mitgelieferte Labor deckt die ersten beiden Ebenen mit einem lokalen Fake ab.
Ein echter SDK-/MCP-Transport ist Aufgabe von M03; Modell-Evaluation wird in M07
vertieft. Du darfst trotzdem bereits in M02 eine kleine Auswahlmatrix konzipieren.

## 2. Negative Fälle sind Architekturtests

Teste unbekannte Tools, fehlende IDs, falsche Typen, zusätzliche Autoritätsfelder,
fremden Repository-Scope und Writes ohne Grant. Prüfe außerdem ungültige
Handleroutputs sowie Wiederholungen nach einem nicht sicher bekannten Ausgang.

Vergleiche vor und nach dem Call Issue-Anzahl und Versionsstand. Ein gemockter
Validator, der immer true liefert, beweist keine reale Schema-Prüfung.
Die Referenz verwendet deshalb einen Draft-2020-12-Validator und prüft auch,
ob die Schemas selbst gültig sind.

## 3. Evidence muss Herkunft zeigen

Ein Testprotokoll braucht Befehl, Datum, Python-/Paketversion, getesteten Commit
oder Dateihashes, Ergebnis und Grenzen. Ein Häkchen ohne prüfbaren Verweis ist kein
Nachweis. Screenshots können ergänzen, ersetzen aber weder Testfälle noch
ausführbare Befehle.

Die Vorlagen unter evidence/ trennen eigene Abnahme von Referenzprüfung.
Das Lesen oder Ausführen einer vollständigen Musterlösung beweist nicht, dass
du selbst ein zusätzliches Tool korrekt entwerfen kannst.

## 4. Anschluss an die Referenzarchitektur

Die fachliche Eingabesprache ist unabhängig vom Transport. Ein Adapter bildet
Toolargumente auf Path, Query und Body einer Legacy-API ab; Credentials stammen
aus einem geschützten Hostkontext. Weder der Modellprompt noch das Toolargument
sollen diese enthalten.

In M03 ersetzt du die lokalen Handler durch passende Integrationsadapter, ohne
Schema-/Policytests zu entfernen. Der Host bleibt für den begrenzten Workflow
verantwortlich; das Backend muss seine Berechtigungen zusätzlich selbst erzwingen.
Doppelte Prüfung ist hier kein Fehler, sondern Schutz an unterschiedlichen Grenzen.

## 5. Abschlussprüfung

Erkläre in zehn Minuten:

1. Was ist eine Proposal und was ein ausgeführter Effekt?
2. Wie unterscheidest du Schema, Fachregel und Autorisierung?
3. Welcher Teil des Systems kennt die Credentials?
4. Was geschieht bei einem Timeout nach erfolgreichem Write?
5. Welcher Test beweist, dass ein nicht autorisierter Call nichts verändert?

Danach ergänze einen bisher unbekannten Negativfall und demonstriere den
erwarteten Zustand. Das ist das Gate von [Übung 06](../exercises/06-capstone/README.md).
