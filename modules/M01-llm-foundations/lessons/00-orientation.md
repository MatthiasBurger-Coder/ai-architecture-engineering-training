# Kapitel 00 — Orientierung: Was ist ein LLM technisch?

## Lernziel

Nach diesem Kapitel kannst du ein LLM in einer Systemarchitektur beschreiben, ohne es als Datenbank, Regelwerk oder eigenständigen Agenten zu missverstehen.

## 1. Das Grundmodell

Ein autoregressives Sprachmodell erhält eine Folge von Tokens und berechnet eine Wahrscheinlichkeitsverteilung für das nächste Token. Dieses Token wird an die Folge angehängt; anschließend wird der nächste Schritt berechnet. Eine Antwort mit mehreren Wörtern ist daher eine Folge wiederholter Inference-Schritte.

```text
Kontext x₁ … xₙ
       ↓
Modellparameter + Forward Pass
       ↓
Logits z für mögliche xₙ₊₁
       ↓
Softmax + Decoding
       ↓
ausgewähltes xₙ₊₁
```

Das Modell „ruft“ nicht im menschlichen Sinn eine gespeicherte Antwort ab. Es berechnet eine Fortsetzung, die unter seinen Parametern und dem aktuellen Kontext wahrscheinlich ist. Diese Fortsetzung kann nützlich, syntaktisch korrekt und trotzdem sachlich falsch sein.

## 2. Drei Ebenen auseinanderhalten

### Modell

Das Modell besteht aus Parametern, Architektur und Inference-Mechanik. Es liefert Scores und daraus abgeleitete Tokenwahrscheinlichkeiten.

### Laufzeit

Die Laufzeit liefert Prompt, Systemregeln, Toolbeschreibungen, Gesprächszustand, Retrieval-Evidenz und Decoding-Parameter. Diese Eingaben bestimmen, was das Modell in diesem Schritt sehen kann.

### Anwendung

Die Anwendung entscheidet, ob ein Output akzeptiert, validiert, gespeichert oder ausgeführt wird. Nur diese Ebene darf Ownership, Berechtigungen, Transaktionen und Audit garantieren.

```text
Modell:       probabilistische Schätzung
Laufzeit:     Kontext- und Ausführungsumgebung
Anwendung:    Vertrag, Policy, Side Effects, Audit
```

## 3. Warum dieses Modell für Engineering wichtig ist

Wenn ein System die drei Ebenen vermischt, entstehen typische Fehler: Ein Text wird für eine Berechtigung gehalten, eine plausible Antwort für eine Tatsache oder ein Tool-Vorschlag für einen autorisierten Befehl. M02 baut deshalb Schema- und Toolgrenzen, M04 Evidenzgrenzen und M08 Policy-Grenzen auf diesem Fundament auf.

## 4. Selbsttest

1. Warum kann das Modell eine neue Antwort erzeugen, ohne eine Datenbankzeile zu lesen?
2. Welche Komponente entscheidet, ob ein `delete` ausgeführt werden darf?
3. Was muss gespeichert werden, wenn eine Ausgabe später reproduzierbar untersucht werden soll?

Eine gute Antwort nennt mindestens Input, Modellversion, Decoding-Konfiguration, Tool-/Policy-Entscheidung und Ergebnis.

