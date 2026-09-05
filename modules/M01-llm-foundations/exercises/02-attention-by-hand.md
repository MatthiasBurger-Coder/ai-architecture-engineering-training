# Übung 02 — Self-Attention per Hand

Verwende:

```text
q = [1, 0]
k1 = [1, 0]    v1 = [10, 0]
k2 = [0, 1]    v2 = [0, 10]
k3 = [1, 1]    v3 = [5, 5]
```

Berechne:

1. die drei Dot Products `q·ki`;
2. die skalierten Scores mit `√dk`;
3. die Softmax-Gewichte;
4. den gewichteten Output-Vektor;
5. wie sich das Ergebnis qualitativ ändert, wenn `k2` durch `[1, 0]` ersetzt wird.

Dokumentiere jeden Zwischenschritt mit mindestens vier Nachkommastellen und zeichne ein kleines Diagramm der Gewichtung.
