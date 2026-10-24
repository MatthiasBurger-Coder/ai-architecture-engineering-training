# Lösung 06 — Kontrollierter Issue-Assistent

## Erwartete fachliche Abfolge

Read von Issue 1 liefert Version 1. Die Suche „Healthcheck“ liefert zwei Treffer
im Fake-Repository; bei limit=1 wird truncated=true gesetzt.
Create ohne Freigabe scheitert. Nach separatem Approval erzeugt derselbe
Vorschlag genau ein neues Issue. Wiederholung mit gleicher Operation und neuer
call_id liefert die gespeicherten Daten.

Ein Update von Issue 1 auf closed mit expected_version=1 erzeugt Version 2.
Ein weiterer neuer Update gegen Version 1 scheitert mit VERSION_CONFLICT.
Ein Löschvorschlag wird mit TOOL_DISABLED abgewiesen, unabhängig davon, ob er
durch einen Benutzer oder einen gelesenen Tickettext angeregt wurde.

## Abnahmebeweis

- Issue-Anzahl am Ende: zwei, sofern keine zusätzliche eigenständige Create-
  Operation ausgeführt wurde.
- Issue 1 hat Version 2 und den freigegebenen Zielzustand.
- Kein Delete-Handler wurde aufgerufen; es existiert bewusst keiner.
- Audit unterscheidet rejected, executed, replayed und unknown.
- Ergebnisberichte enthalten die tatsächlich gespeicherten IDs/Versionen.
- Ein nicht ausgeführter Call wird nicht als erledigte fachliche Aktion dargestellt.

[demo.py](../reference/demo.py) zeigt Read, Create, Replay, Suche, Update,
Versionskonflikt, Delete-Deny und Audit. Die Tests ergänzen unbekannte Ausgänge.
Die Suche ist unabhängig vom Create und erfolgt in der Referenz nach dem Replay;
deine eigene Gesamtdemo darf sie entsprechend dem Business Case früher ausführen.

## Reviewerfragen

Warum muss ein READ autorisiert werden? Weil er Daten offenlegt.
Warum reicht Schema-Validität nicht? Sie beschreibt Form, nicht Authority.
Was ist bei verlorener Write-Antwort zu tun? Operationstatus abgleichen.
Was bleibt bis M03 offen? Echte Integrationsadapter, Protokoll-/Transporttests und
Credentials aus geschütztem Hostkontext.

Eine Abnahme ist nur dann ACCEPTED, wenn diese Antworten mit eigenen Artefakten
und Testresultaten belegt sind. Die Existenz der Referenzdateien genügt nicht.
