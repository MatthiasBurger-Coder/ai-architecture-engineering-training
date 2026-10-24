# Referenzlösung 05 — SFT als erster Trainingsdurchstich

> Erst nach eigenem Versuch lesen.

Ein korrekter Ablauf validiert zunächst den Trainingskorpus, prüft GPU und Datenlecks, erzeugt einen eigenständigen UTC-versionierten Adapter und hält Modell-/Datenrevision sowie tatsächliche VRAM-Messung fest. Ein erfolgreiches Trainer-Exitcode allein belegt noch keine Kompetenz.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
