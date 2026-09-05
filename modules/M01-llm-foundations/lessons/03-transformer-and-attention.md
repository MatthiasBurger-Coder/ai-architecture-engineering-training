# Kapitel 03 — Transformer und Self-Attention

## Lernziel

Nach diesem Kapitel kannst du die zentrale Attention-Gleichung lesen, eine kleine Attention-Rechnung durchführen und erklären, wie Kontextbeziehungen entstehen.

## 1. Von X zu Q, K und V

Für eine Eingabematrix `X` erzeugt der Transformer drei Projektionen:

```text
Q = XWq
K = XWk
V = XWv
```

Für eine Query wird die Ähnlichkeit zu allen Keys berechnet. Die Scores werden skaliert, normalisiert und auf die Values angewendet:

```text
Attention(Q,K,V) = softmax(QKᵀ / √dk + mask) V
```

Das ist kein dreifacher Speicherzugriff mit menschlichen Rollen. Query, Key und Value sind gelernte Projektionen, die zusammen eine flexible Gewichtung von Kontextinformation ermöglichen.

## 2. Warum die Skalierung?

Das Skalarprodukt wächst typischerweise mit der Dimension `dk`. Ohne Skalierung können die Scores sehr groß werden; Softmax würde dann extrem spitz und für kleine Unterschiede wenig stabil. Die Division durch `√dk` hält die Größenordnung kontrollierbarer.

## 3. Maskierung und Kausalität

Bei autoregressiver Generierung darf Position `t` nicht auf zukünftige Positionen zugreifen. Eine kausale Maske setzt solche Scores effektiv auf minus unendlich, bevor Softmax angewendet wird. Dadurch wird verhindert, dass das Modell während des Trainings die korrekten zukünftigen Tokens direkt „abschreibt“.

## 4. Multi-Head-Attention

Mehrere Attention-Heads verwenden unterschiedliche Projektionen. Ein Head kann lokale syntaktische Beziehungen stärker abbilden, ein anderer entfernte Abhängigkeiten oder strukturelle Muster. Diese Interpretationen sind nützliche Hypothesen, aber einzelne Heads dürfen nicht ohne Validierung als fest zugeordnete Regeln behandelt werden.

## 5. Was Attention nicht garantiert

Attention-Gewichte sind keine vollständige Erklärung des Modellverhaltens, keine Wahrheitsskala und kein Sicherheitsmechanismus. Ein hoher Score zeigt, dass eine Repräsentation in diesem Layer für die Query stark gewichtet wurde. Daraus folgt weder, dass die Information korrekt ist, noch dass sie die endgültige Ausgabe allein bestimmt.

## Engineering-Folge

Attention erklärt, wie Kontext verarbeitet wird. Sie ersetzt jedoch keine Retrieval- oder Provenance-Architektur. Wenn ein Modell eine falsche Quelle stark gewichtet, wird daraus nicht automatisch eine richtige Entscheidung.

## Selbsttest

- Was macht `mask` in der Gleichung?
- Warum werden Scores durch `√dk` geteilt?
- Warum sind Attention-Gewichte kein Beweis für Korrektheit?

