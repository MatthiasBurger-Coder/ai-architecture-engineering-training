# Lösung 01 — Garantieebenen

| Fall | Grenze | Verantwortlich / nächster Schritt |
|---|---|---|
| 1 | Syntax | Parser weist ab; ggf. vollständige neue Ausgabe anfordern |
| 2 | Schema | Validator weist String-ID ab |
| 3 | Semantik | Autorisierter Handler meldet NOT_FOUND |
| 4 | Authority | Policy weist fremden Scope ab |
| 5 | Authority | WRITE-Grant fehlt; keine Ausführung |
| 6 | Approval | Freigabe fehlt; externer Approval-Schritt |
| 7 | Keine beim Lesen | Body ist Daten; Folge-Delete wird separat verweigert |
| 8 | Keine | Read wird ausgeführt und Resultat validiert |

Bei den Fällen 1–6 findet keine fachliche Mutation statt. Fall 7 macht den
gelesenen Text nicht vertrauenswürdig; er darf als Inhalt übermittelt werden,
aber weder Grants noch Registry verändern. Fall 8 ist ein autorisierter Read.

Ein korrektes JSON-Beispiel kann `{"state":"closed"}` behaupten, obwohl die
Datenbank open meldet. Schema-valid heißt nur, dass closed ein erlaubter Wert ist.
Die Wahrheit stammt aus dem gespeicherten, passend versionierten Zustand.

Im Java-Vergleich entsprechen Syntaxprüfung dem JSON-Parser, Schema-/Typprüfung
etwa Bean Validation, Fachprüfung dem Service und Authority dem Security-Layer.
Die Analogie ersetzt keine exakte Implementation: JSON Schema hat eigene
Semantik, beispielsweise bei optional und null.

Typischer Fehler: Für „keine Berechtigung“ ein alternatives Tool ausprobieren.
Dadurch wird die ursprüngliche Zugriffsbeschränkung nicht aufgehoben.
