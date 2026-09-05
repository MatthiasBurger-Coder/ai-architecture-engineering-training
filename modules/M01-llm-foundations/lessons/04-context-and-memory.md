# Kapitel 04 — Context Window, Context Budget und Gedächtnis

## Lernziel

Nach diesem Kapitel kannst du Context Window, Kontextbudget, Konversationshistorie und persistentes Gedächtnis auseinanderhalten.

## 1. Context Window

Das Context Window ist die maximale Tokenmenge, die eine Modellvariante in einem Inference-Schritt verarbeitet. Dazu können Systeminstruktionen, Chat-Historie, Benutzerinput, Tool-Schemas, Toolresultate und generierte Tokens gehören. Das genaue Budget hängt vom verwendeten Modell- und Chat-Interface ab und muss deshalb zur Laufzeit sauber berechnet werden.

## 2. Verfügbarkeit ist nicht Nutzung

Dass ein Text im Window liegt, bedeutet nicht, dass das Modell ihn gleich stark verwendet. Lange Kontexte können relevante Informationen verdünnen; widersprüchliche oder schlecht markierte Quellen können zusätzliche Unsicherheit erzeugen. Kontextqualität besteht daher aus Relevanz, Aktualität, Vertrauensstufe, Position, Format und Umfang.

## 3. Budgetierung

Ein robuster Context Builder reserviert zuerst unverzichtbare Bestandteile:

```text
Gesamtbudget
- Systemregeln
- aktueller Task
- Policy / erlaubte Tools
- Antwortreserve
= Evidenz- und Historienbudget
```

Evidenz wird nicht einfach nach Textlänge eingefügt. Eine mögliche deterministische Reihenfolge ist: Policy-Filter, Provenance-Filter, Aktualität, Aufgabenrelevanz, Diversität, dann Tokenbudget. Bei Gleichstand wird eine stabile Sortierung verwendet.

## 4. Kontext ist kein Langzeitgedächtnis

Historie im Prompt verschwindet aus dem aktiven Modellkontext, wenn sie nicht erneut übergeben wird. Persistentes Gedächtnis braucht eine eigene Speicherung, Ownership, Retention, Versionierung und Zugriffskontrolle. Ein Modellparameter ist ebenfalls kein verlässliches Nutzerprofil, das ein einzelner Prompt sicher aktualisiert.

## 5. Trennung vertrauenswürdiger und unvertrauenswürdiger Inhalte

Repositorytext, Toolresultate und Benutzerinput können Anweisungen enthalten. Sie müssen als Daten mit Herkunft und Vertrauensstufe markiert werden. Eine Zeichenkette innerhalb eines Retrieval-Dokuments erhält dadurch keine höhere Priorität als die Systempolicy. Diese Trennung wird in M05 und M08 formalisiert.

## Selbsttest

1. Welche Bestandteile müssen in die Budgetrechnung?
2. Warum ist ein größeres Window nicht automatisch besser?
3. Welche Eigenschaften braucht persistentes Gedächtnis außerhalb des Modells?

