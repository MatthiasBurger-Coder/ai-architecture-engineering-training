# Kapitel 02 — Embeddings und Repräsentationen

## Lernziel

Nach diesem Kapitel kannst du Token-ID, Embedding, Aktivierung und semantische Ähnlichkeit unterscheiden und die Aussagekraft eines Vektorraums korrekt begrenzen.

## 1. Von der ID zum Vektor

Eine Token-ID ist ein diskreter Index. Die ID `431` ist nicht „semantisch größer“ oder „näher“ an `432`. Ein Embedding-Lookup verwendet die ID, um eine Zeile aus einer gelernten Matrix zu lesen:

```text
Embedding-Matrix E ∈ ℝ^(V × d)
Token-ID i → E[i] ∈ ℝ^d
```

`V` ist die Größe des Vokabulars, `d` die Embedding-Dimension. Der Vektor ist eine gelernte Repräsentation, kein Wörterbuchartikel mit einer einzelnen festen Definition.

## 2. Ähnlichkeit im Vektorraum

Für zwei Vektoren kann beispielsweise Cosine Similarity verwendet werden:

```text
cos(a,b) = (a · b) / (||a|| ||b||)
```

Hohe Ähnlichkeit bedeutet, dass zwei Repräsentationen unter der gewählten Einbettung ähnlich verwendet oder angeordnet werden. Sie bedeutet nicht automatisch, dass zwei Aussagen wahr, austauschbar oder kausal gleich sind. Für Retrieval ist ein Embedding deshalb ein Suchsignal, keine Beweisquelle.

## 3. Kontextualisierte Repräsentationen

Ein initialer Tokenvektor ist nicht die endgültige Bedeutung eines Tokens. Transformer-Schichten aktualisieren Repräsentationen abhängig von den anderen Tokens im Kontext. Das gleiche Token kann in unterschiedlichen Sätzen andere Aktivierungen erhalten. Diese Kontextualisierung ist ein zentraler Grund, warum reine statische Wortvektoren nicht das vollständige Verhalten moderner Sprachmodelle erklären.

## 4. Position ist Information

Self-Attention kann Beziehungen zwischen Tokens berechnen, kennt ohne zusätzliche Information aber nicht automatisch deren Reihenfolge. Positionsinformationen werden daher in die Repräsentation eingebracht oder in die Attention-Mechanik integriert. Ein System, das Reihenfolge, Datei-Offsets oder Abschnittsgrenzen verliert, kann semantisch ähnliche, aber logisch falsche Kontexte erzeugen.

## 5. Relevanz für spätere Module

M04 verwendet Embeddings für Retrieval. Dort muss zusätzlich eine Provenance-Schicht existieren: `embedding similarity` beantwortet „was ist ähnlich?“, nicht „was ist autoritativ?“. M05 baut aus ausgewählten Evidenzen den Kontext; die Vektordatenbank darf diese Entscheidung nicht implizit zur Wahrheit erklären.

## Selbsttest

1. Warum ist eine Token-ID kein sinnvoller Abstand im semantischen Raum?
2. Welche Aussage darf Cosine Similarity nicht allein begründen?
3. Warum sind Dokumentposition und Versionsinformation für Engineering-RAG wichtig?

