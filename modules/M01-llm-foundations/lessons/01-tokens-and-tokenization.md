# Kapitel 01 — Tokens und Tokenisierung

## Lernziel

Nach diesem Kapitel kannst du erklären, warum ein Wort nicht zwingend ein Token ist, warum Tokenisierung Kosten beeinflusst und warum die Tokenizer-Version Teil eines Inference-Vertrags sein muss.

## 1. Was ist ein Token?

Ein Token ist eine Einheit, die ein konkreter Tokenizer aus Text erzeugt. Je nach Sprache und Vokabular kann ein Token ein komplettes Wort, ein häufiges Wortstück, ein Leerzeichen, ein Satzzeichen oder ein Spezialtoken sein. Die Sequenz wird anschließend in Token-IDs überführt, also in Ganzzahlen, die als Indizes in einer Embedding-Tabelle dienen.

```text
Text:       "unwiederholbar"
Tokenizer:  ["un", "wieder", "hol", "bar"]   (nur Beispiel)
IDs:        [104, 8821, 77, 431]
```

Die konkrete Zerlegung ist keine sprachliche Wahrheit. Sie ist ein Ergebnis von Vokabular, Trainingsverfahren und Normalisierung.

## 2. Tokenisierung als Systemgrenze

Tokenisierung beeinflusst mindestens vier Dinge:

1. **Kontextbudget:** Derselbe Inhalt kann je nach Sprache oder Format unterschiedlich viele Tokens benötigen.
2. **Kosten und Latenz:** Viele APIs rechnen Eingabe und Ausgabe tokenbasiert ab.
3. **Truncation:** Bei Überschreitung des Context Windows muss Inhalt abgeschnitten, zusammengefasst oder abgewiesen werden.
4. **Robustheit:** Sonderzeichen, Code, URLs und ungewöhnliche Identifikatoren können in viele kleine Tokens zerfallen.

Ein Engineering-System darf das Budget daher nicht aus der Zeichen- oder Wortanzahl schätzen. Es muss mit dem zum Modell passenden Tokenizer zählen oder konservative Grenzen verwenden.

## 3. Spezialtokens und Rollen

Chat-Modelle serialisieren Nachrichten häufig mit Rollen- oder Strukturinformationen. Systemnachricht, Benutzertext, Toolresultat und Assistant-Ausgabe sind nicht nur sichtbare Absätze; sie können durch ein Chat-Template in zusätzliche Tokens übersetzt werden. Ein Budget muss diese Overheads berücksichtigen.

## 4. Typischer Denkfehler

„Ein Token entspricht einem Wort“ führt zu falschen Kosten- und Kontextschätzungen. Ebenso falsch ist „mehr Tokens bedeuten mehr Bedeutung“. Tokens sind die Eingabealphabet-Einheiten des Modells; Bedeutung entsteht erst durch gelernte Repräsentationen und Kontextverarbeitung.

## 5. Engineering-Aufgabe

Für ein Repository-RAG sollte die Chunking- und Budgetlogik mindestens folgende Metadaten kennen: Dokument-ID, Version, Sprache, Start-/Endposition, Tokenanzahl, Quelle und Erstellungszeitpunkt. So kann später nachvollzogen werden, warum ein Textstück ausgewählt oder verworfen wurde.

## Selbsttest

- Kannst du erklären, warum Code und URLs häufig viele Tokens benötigen?
- Warum muss das Chat-Template in einen Budgettest einbezogen werden?
- Was passiert, wenn eine Anwendung stillschweigend am falschen Tokenizer zählt?

