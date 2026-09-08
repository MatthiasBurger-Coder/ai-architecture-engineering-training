# Übung 03 — Einen kontrollierten Executor bauen

## Auftrag

Implementiere einen lokalen Executor für mindestens get_issue, create_issue und
update_issue. Nutze ausschließlich Fake-Daten. Der Dispatch verwendet eine feste
Handler-Allowlist. Keine Shell, kein eval, keine dynamische Interpretation von
Modelltext.

Implementiere Parser, Envelope- und Argumentvalidierung, Handleraufruf,
Outputvalidierung und korrelierte Success-/Error-Resultate. Die echte Policy
ergänzt du in Übung 04; WRITE muss bis dahin standardmäßig verweigert bleiben.

## Negativfälle

- Unvollständiges JSON; doppelte JSON-Schlüssel.
- Nicht endliche Zahlen; zu große Eingaben.
- Unbekannter Toolname; zusätzliches approved-Feld.
- Fehlende ID; falscher ID-Typ; ungültiger Status.
- Fehlendes erlaubtes Issue.
- Handler liefert falsches Outputformat.
- Zwei Calls besitzen dieselbe call_id.
- Ein Batch überschreitet vier Calls.

Bei abgewiesenen Input-/Policyfällen muss der Zustand unverändert bleiben.
Ein ungültiger Handleroutput nach Mutation ist dagegen kein Rollbackbeweis:
Dokumentiere ihn als unbekannten Ausgang.

## Abgabe und Lernerfolg

Liefere Code, Tests und ein Diagramm. Modellrunden sind im Offline-Labor simuliert.
Beschreibe zusätzlich im Diagramm einen Host-Loop mit höchstens drei
Modellrunden und acht Calls insgesamt. Zeige, wie Stop, Refusal, abgeschnittene
Ausgabe und fehlerhafte Toolresultate behandelt werden.

Zeige einen vollständigen Read-Austausch und zwei korrelierte Fehlerresultate.
Das Returnformat darf keine Stacktraces, Credentials oder Rohargumente enthalten.
Danach: [Lösung 03](../../solutions/03-validation/README.md).
