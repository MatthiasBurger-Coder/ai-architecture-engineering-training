# 02 — JSON Schema als überprüfbarer Datenvertrag

## 1. Inhalt

Wir verwenden im lokalen Validator JSON Schema Draft 2020-12. Das Schema ist
versionierter Code: Es wird überprüft, getestet und zusammen mit dem Handler
ausgeliefert. Es ist kein Dokumentationsanhang, der der Implementation hinterherläuft.

`properties` beschreibt bekannte Felder; `required` verlangt deren Anwesenheit.
`additionalProperties: false` lehnt weitere Felder auf derselben Objektebene ab.
Das muss bei verschachtelten Objekten jeweils bewusst gesetzt werden.
[Referenz: JSON-Schema-Objekte](https://json-schema.org/understanding-json-schema/reference/object).

## 2. Beispiel

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "issue_id": {"type": "integer", "minimum": 1},
    "include_comments": {"type": "boolean", "default": false}
  },
  "required": ["issue_id"],
  "additionalProperties": false
}
```

`{}` ist ungültig. `{"issue_id": 62}` ist gültig. `{"issue_id": null}`,
`{"issue_id": "62"}` und `{"issue_id": 0}` sind ungültig.
Das Schema macht aus `"62"` nicht die Zahl 62.

`default` ist eine Annotation, kein automatischer Schreibbefehl an das Objekt.
Der Handler muss das Weglassen von `include_comments` ausdrücklich als false
interpretieren. Versteckte Default-Mutationen erschweren Signaturen und
Idempotenzvergleiche. Im Labor werden fehlende und explizit angegebene optionale
Argumente nicht semantisch kanonisiert; diese Grenze ist dokumentiert.

## 3. Optional ist nicht nullable

Ein optionales Feld darf fehlen. Ein nullable Feld darf den Wert null enthalten.
Das sind zwei unabhängige Entscheidungen. Bei `update_issue` bedeutet ein fehlender
Titel „unverändert“, nicht „löschen“. Null wird dort nicht akzeptiert.

| Modellierung | Fehlt | null | gültiger String |
|---|---|---|---|
| optionaler String | erlaubt | abgelehnt | erlaubt |
| erforderlicher String | abgelehnt | abgelehnt | erlaubt |
| erforderlich, type string/null | abgelehnt | erlaubt | erlaubt |

Bei einem Patch müssen wenigstens Titel oder Status vorhanden sein. Das Labor
nutzt dafür `anyOf` mit zwei `required`-Bedingungen. `oneOf` würde genau eine
erfüllte Alternative verlangen und könnte den legitimen Patch beider Felder
abweisen. [Kombinationen](https://json-schema.org/understanding-json-schema/reference/combining).

## 4. Wertebereiche, Listen und Muster

Titel sind auf 120 Zeichen, Bodies auf 2.000 Zeichen und Suchergebnisse auf zehn
Einträge begrenzt. Ein `minLength: 1` verbietet keinen reinen Leerraum; dafür
verwenden wir zusätzlich `pattern: "\\S"`. Repositorynamen folgen dem
Trainingsformat owner/name. Das ist eine didaktische Einschränkung, keine
vollständige GitHub-Namensspezifikation.

Für Arrays sind `items`, `maxItems` und gegebenenfalls `uniqueItems` wichtig.
Eine maximale Ergebnisliste begrenzt den Modellkontext, nicht automatisch den
Aufwand einer unkontrollierten Backend-Suche. Dort braucht es eigene Deadlines.

## 5. Was das Schema nicht tut

`format` ist nicht in jedem Validator automatisch eine Assertion; aktiviere
Formatprüfung bewusst, wenn du sie benötigst. Im Labor werden keine URL- oder
Datumsgarantien mit einem ungeprüften `format` behauptet.
[Validator-Konfiguration](https://python-jsonschema.readthedocs.io/en/stable/validate/).

Ein erlaubter Repositoryname beweist weder Existenz noch Berechtigung.
Ein gültiger Titel kann fachlich falsch sein. Diese Grenzen müssen im Review
erklärt werden, nicht durch immer kompliziertere Regexe verdeckt werden.

## 6. Messbarer Lernerfolg

Entwirf in [Übung 02](../exercises/02-contracts/README.md) fünf Schemas und prüfe
jeweils Happy Path, fehlende Pflichtfelder, unbekannte Felder und Grenzwerte.
Die Musterdatei [catalog.json](../solutions/reference/catalog.json) ist ausführbar;
sie ersetzt nicht deinen eigenen Entwurf.
