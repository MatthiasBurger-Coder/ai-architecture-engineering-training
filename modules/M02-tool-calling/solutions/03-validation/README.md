# Lösung 03 — Kontrollierter Executor

Siehe [runtime.py](../reference/runtime.py), execute und run_batch.

Die Proposal wird einmal geparst. Doppelte Keys werden durch object_pairs_hook
abgelehnt, nicht nach „letzter Wert gewinnt“ still übernommen.
Ein statischer Katalog bestimmt den Argumentschema-Validator; eine feste
Handler-Allowlist bestimmt die Ausführung. Unbekannte Namen gelangen nicht in
Shell, eval oder dynamische Imports.

Die Ausgabe hat genau eine Success- oder Error-Variante. success-Daten müssen
zuerst das toolspezifische Output-Schema erfüllen. Jeder normale Call behält seine
call_id. Ist bereits das Envelope unbrauchbar, darf der Fehler call_id=null
verwenden; eine unsichere ID wird nicht künstlich erfunden.

## Host-Loop als Referenzentwurf

Halte rounds=0 und calls=0 im Host. Vor jeder Modellrunde prüfen:
rounds < 3, Deadline noch nicht erreicht und globales Budget nicht erschöpft.
Nach der Ausgabe Typ prüfen. Nur vollständige Tool-Vorschläge weiterreichen.
Die gesamte Anzahl angebotener Calls vor Ausführung gegen das Restbudget prüfen.
Bei Refusal/Abbruch stoppen; bei Abschluss das Antwortschema validieren.

run_batch bildet lediglich den inneren, sequenziellen Dispatch ab.
Ein produktiver Loop braucht zusätzlich globale Call-ID-Verwaltung und Grenzen
für Ergebnisgröße und Kontext. Die Lernlösung behauptet nicht, dies bereits als
Modellclient implementiert zu haben.

## Kritischer Negativfall

Ein Handler schreibt und liefert danach `{"success": true}`, obwohl ein Issue-
Objekt erwartet wird. OUTPUT_INVALID ist richtig; „kein Write“ wäre falsch.
Das Journal bleibt unknown. Genau diesen Unterschied muss der Test mit dem
Backendzustand nachweisen.
