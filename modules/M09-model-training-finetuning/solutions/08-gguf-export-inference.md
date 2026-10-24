# Referenzlösung 08 — Adapterexport, GGUF und 24h-Lernzyklen

> Erst nach eigenem Versuch lesen.

Training und Export dürfen nicht automatisch alle 24 Stunden produktiv schalten. Erst Validierung, Evaluationsvergleich und Review erlauben die Auswahl einer Adapterversion. Der Base-Model-Identifier bleibt Bestandteil jedes Artefakts; inkompatible 0.5B-/7B-Adapter werden abgelehnt.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
