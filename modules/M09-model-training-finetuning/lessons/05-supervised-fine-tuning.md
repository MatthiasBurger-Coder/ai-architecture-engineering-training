# L05 — SFT als erster Trainingsdurchstich

**Lernziel:** Ein SFT-Adapter aus mehreren validierten Dateien erzeugen.

## 1. Warum SFT vor DPO?

SFT vermittelt das erwartete Antwortschema und wiederkehrende Muster anhand guter Beispiele. Für einen Java-Spezialisten ist das die verlässlichere erste Stufe als DPO aus fünf Formatkontrasten. DPO ist für bevorzugte Alternativen geeignet, sobald eine sinnvolle Baseline existiert.

## 2. Laufzeitpfad

Mounts teilen Trainingsdaten read-only in den Container, Modellcache und Outputs bleiben persistent. Der Container validiert JSONL, prüft Hold-out-Überschneidungen, macht GPU-Preflight, lädt NF4, aktiviert LoRA, erstellt SFTTrainer, trainiert und speichert adapter_model.safetensors plus adapter_config.json.

## 3. Fehlermodi

CUDA OOM bedeutet nicht, dass Docker 'defekt' ist. Verkürze die Trainingssequenz, reduziere Modell/Rank und vermeide andere GPU-Last. Zu kleine Sequenzlängen können Beispiele abschneiden; das wird vor Trainingsstart abgeprüft. Loss-Abnahme allein belegt keine Codequalität.

## 4. Nachweispflicht

Ein validierter Run speichert UTC-Timestamp, Hash der Daten, Basismodell, Hyperparameter, VRAM-Messwerte und Trainerresultat. Die Erfolgskontrolle erfolgt erst auf Hold-out-Beispielen, nicht auf Trainingsbeispielen.

## Praktisches Beispiel

```bash
cd modules/M09-model-training-finetuning/examples/reference
docker compose config
docker compose build
docker compose run --rm trainer validate
docker compose run --rm trainer train
```

## Selbsttest

Erzeuge einen SFT-Lauf mit mindestens zwei JSONL-Dateien und dokumentiere Baseline, Dataset-Hash, CUDA-Status, Trainings-Loss sowie Adapter-Manifest.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
