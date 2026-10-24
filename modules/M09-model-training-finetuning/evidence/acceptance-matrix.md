# M09 – Acceptance-Matrix

**Status: noch nicht bestanden.** Stand der Referenzdateien ist kein Lernerfolgsnachweis.

| ID | Kriterium | Konkrete Evidence | Status |
|---|---|---|---|
| M09-AC01 | GPU-Pfad Windows → WSL2 → Docker → PyTorch erklärt | eigenes Diagramm + drei Prüfausgaben | offen |
| M09-AC02 | CUDA in Docker nachgewiesen | GPU-Container nvidia-smi und torch.cuda.is_available() | offen |
| M09-AC03 | Speichergrenzen korrekt abgesichert | Allocator-Guard und extern gemessener Peak-Zusatzverbrauch <=4096 MiB | offen |
| M09-AC04 | SFT/DPO-Datensätze valide | mind. zwei SFT-JSONL, eine DPO, keine Eval-Leckage, SHA256 | offen |
| M09-AC05 | SFT-Modelladapter trainiert | Trainingsmanifest, Adapter, Konfiguration, Loss | offen |
| M09-AC06 | DPO verstanden, optional technisch geprüft | Präferenzbeispiele und dokumentierte Reference-Strategie, ggf. DPO-Messlauf | offen |
| M09-AC07 | Verbesserung unabhängig evaluiert | Baseline vs Adapter auf Hold-out + Format/javac/JUnit | offen |
| M09-AC08 | 24h-Import und reproduzierbare Versionierung | neue Datei, deterministischer Loader, Regression + Rollback | offen |

**Gate:** Alle acht Kriterien mit nachvollziehbarem Nachweis bewerten; DPO muss in der Theorie erklärt werden, ein speicherbedingter Abbruch darf nicht als GPU-Erfolg zählen. Ein unabhängiger Reviewer muss offene Risiken sehen können.
