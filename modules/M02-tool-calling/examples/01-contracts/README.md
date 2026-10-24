# Beispiel 01 — Vom fachlichen Auftrag zum Vertrag

## Inhalt

Auftrag: „Zeige mir Issue 1 aus training/demo mit Kommentaren.“ Dies ist eine
lesende Operation mit bekanntem Ziel. Sie benötigt keine Suche nach relevanten
Dateien und keine Schreibberechtigung.

## Schrittweise Ableitung

1. Toolname get_issue beschreibt ein einzelnes Ressourcenlesen.
2. repository ist erforderlich, weil eine ID allein nicht global eindeutig ist.
3. issue_id ist eine positive Ganzzahl; „latest“ ist kein gültiger Ersatz.
4. include_comments ist optional; fehlt es, liefert die Referenz keine Kommentare.
5. Output enthält gespeicherte Issue-ID, Titel, Body, Status, Version und Kommentare.
6. NOT_FOUND unterscheidet ein fehlendes Issue von einem unzulässigen Input.

```json
{
  "call_id": "read-001",
  "name": "get_issue",
  "arguments": {
    "repository": "training/demo",
    "issue_id": 1,
    "include_comments": true
  }
}
```

Ein Schema kann prüfen, ob repository dem Trainingsmuster entspricht.
Die Policy muss zusätzlich den exakt erlaubten Scope prüfen.
„training/other“ wäre formal gültig, für den Demo-Context jedoch verboten.

## Varianten und erwartete Entscheidungen

| Änderung | Zuerst scheiternde Grenze |
|---|---|
| issue_id weglassen | Argumentschema |
| issue_id als String senden | Argumentschema |
| approved=true zum Envelope hinzufügen | Envelope |
| repository auf training/other ändern | Policy |
| issue_id auf 999 ändern | Fachlicher Lookup nach Autorisierung |
| name auf search_repository ändern, Argumente behalten | Argumentschema des anderen Tools |

Der letzte Fall ist wichtig: Dispatch und Validator müssen denselben ausgewählten
Vertrag verwenden. Ein erfolgreicher get_issue-Validator darf kein Argumentobjekt
für einen anderen Handler freigeben.

## Lernkontrolle

Erkläre ohne Hilfsmittel, welche Varianten eine Modellkorrektur erlauben und
welche einen externen Berechtigungs-/Klärungsschritt verlangen.
