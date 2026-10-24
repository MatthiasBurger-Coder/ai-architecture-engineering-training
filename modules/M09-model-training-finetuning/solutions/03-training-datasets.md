# Referenzlösung 03 — Versionierte SFT-/DPO-Datensätze

> Erst nach eigenem Versuch lesen.

SFT und DPO haben unterschiedliche Required Fields; Evaluationsdateien dürfen nicht dieselben Instruktionen verwenden. Der Loader muss deterministisch sortieren, Duplikate ablehnen, unvollständige Objekte melden und ein Manifest mit Datei-Liste und SHA-256 erstellen.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
