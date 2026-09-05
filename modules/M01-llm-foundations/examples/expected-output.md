# Erwartete Beobachtungen

Die exakten Fließkommawerte können sich minimal unterscheiden. Entscheidend sind die Beziehungen:

- `service` wird als Token behandelt und per Lookup in einen Vektor überführt;
- die erste Query gewichtet den ersten Key am stärksten;
- niedrigere Temperature konzentriert die Verteilung auf hohe Logits;
- höhere Temperature verteilt Wahrscheinlichkeit breiter;
- Top-k entfernt alle Kandidaten außerhalb der k größten Wahrscheinlichkeiten;
- Top-p behält die kleinste Kandidatenmenge, deren kumulative Wahrscheinlichkeit mindestens p erreicht;
- gleiche Seeds liefern gleiche Samples, andere Seeds können andere Samples liefern.

Ein erfolgreicher Lauf beginnt ungefähr so:

```text
tokens: ['deploy', 'service', 'now']
embedding(service): (0.8, 0.2)
attention weights: [...]
attention result: [...]
temperature=0.5: [...]
```
