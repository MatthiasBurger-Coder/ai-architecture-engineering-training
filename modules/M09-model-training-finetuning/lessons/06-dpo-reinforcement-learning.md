# L06 — DPO und die Grenze zu RLHF

**Lernziel:** Preference-Learning von SFT, Reward-Modellen und echtem RL unterscheiden.

## 1. Begriffe

DPO (Direct Preference Optimization) optimiert Präferenzpaare direkt über ein Klassifikations-artiges Ziel und ist nicht dasselbe wie PPO-basiertes RLHF mit Reward-Modell und Online-Rollouts. Im Alltag wird DPO oft dem Post-Training zugerechnet. Das fachliche Lernziel umfasst beide Verfahren und deren unterschiedliche Ressourcenanforderungen.

## 2. Referenzmodell

DPO vergleicht ein trainiertes Modell mit einer Referenzverteilung. Naives Laden eines zweiten großen Modells verdoppelt schnell die Gewichtsbelegung. PEFT/TRL kann für passende Versionen Referenzlogwahrscheinlichkeiten vorrechnen oder Adapter-Strategien verwenden. Solche APIs sind versionsabhängig und müssen im eigenen Image gegen den tatsächlichen Build geprüft werden.

## 3. Qualität der Präferenzen

Ein rejected-Beispiel muss nicht unsicher oder sinnlos sein. Ein gutes Pair unterscheidet fachliche Konformität: korrekt validierter Java-record gegen mutable Felder oder unvollständige Fehlerbehandlung. Tests und Javac entscheiden über Korrektheit; die Präferenz allein beweist sie nicht.

## 4. 4-GB-Realitätsgrenze

DPO ist optional. Wenn Referenzberechnung, Aktivierungen oder Training >4 GB Zusatzverbrauch erzeugen, ist das Ziel nicht bestanden. Auf 0.5B und kurzen Sequenzen bleiben, statt den Guard heimlich zu deaktivieren. Ein nicht gelaufener DPO-Pfad wird explizit als ungetestet dokumentiert.

## Praktisches Beispiel

```bash
docker compose run --rm -e TRAIN_STAGE=dpo trainer train
```

## Selbsttest

Vergleiche SFT, DPO und PPO/RLHF in einer Tabelle. Erstelle drei fachlich sinnvolle chosen/rejected-Kontraste und beschreibe einen Test für jede bessere Variante.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
