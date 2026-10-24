# M09 Referenzlabor – Qwen2.5-Coder Java Training

**Status:** Quellcode/Offline-Tests und Trainingsplan. Kein bestätigter Docker-GPU-Lauf in der Lernumgebung. Ein tatsächlicher WSL2/CUDA-Trainingslauf und das 4096-MiB-Ziel müssen am Zielrechner nachgewiesen werden.

## Voraussetzungen
Windows 11, WSL2 Ubuntu, Windows-NVIDIA-Treiber, Docker Desktop mit WSL2 Integration oder konfigurierte Docker Engine mit NVIDIA Container Toolkit. Nicht zusätzlich den Linux-NVIDIA-Kerneltreiber in WSL installieren.

\`\`\`bash
cd modules/M09-model-training-finetuning/examples/reference
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.6.3-base-ubuntu22.04 nvidia-smi
docker compose config
docker compose build
docker compose run --rm trainer gpu
docker compose run --rm trainer validate
docker compose run --rm trainer train
\`\`\`

Die Trainingsdateien liegen unter datasets/sft und datasets/dpo. Neue datierte JSONL-Dateien werden beim nächsten Run sortiert geladen; alte Dateien müssen nicht geändert werden.

\`\`\`bash
python3 scripts/new_daily_dataset.py --stage sft --topic records
docker compose run --rm trainer validate
docker compose run --rm trainer train
docker compose run --rm trainer evaluate
\`\`\`

Optionales DPO-Experiment (mit höherem Speicherbedarf):

\`\`\`bash
docker compose run --rm -e TRAIN_STAGE=dpo trainer train
\`\`\`

Für einen SFT-Adapter danach (muss dieselbe HF-Basis verwenden):

\`\`\`bash
docker compose run --rm \
  -e TRAIN_STAGE=dpo \
  -e INITIAL_ADAPTER=/workspace/outputs/<SFT-ORDNER> trainer train
\`\`\`

## Speicherziele und Grenzen
- RTX 2070 SUPER: 8192 MiB nominal, andere Programme belegen ebenfalls VRAM.
- Trainingsprozess: operatives Zusatzbudget <=4096 MiB.
- PyTorch Caching-Allocator: <=3400 MiB als konservativer Teilguard. **Keine harte CUDA-/Docker-Gesamtgrenze.**
- Überwache die *zusätzliche* Belegung während des Laufes extern: nvidia-smi -l 1. Ein nicht gemessener Wert darf nicht als bestanden markiert werden.
- Modell 0.5B, QLoRA/NF4, Rank 4, Batch 1, MAX_LENGTH 256. Wenn OOM: zuerst weniger GPU-Last, dann kürzere Sequenz; nie still das Budget erhöhen.

## Qualitätsprüfung
\`\`\`bash
PYTHONPATH=src python3 -m unittest discover -s tests -v
docker compose run --rm trainer evaluate
docker compose run --rm -e INITIAL_ADAPTER=/workspace/outputs/<SFT-ORDNER> trainer evaluate
\`\`\`
Evaluate schreibt Hold-out-Antworten und eine **Java-Formatheuristik**. Javac/JUnit müssen anschließend zusätzlich auf isolierten Aufgaben ausgeführt werden. Vier synthetische Beispiele trainieren keinen verlässlichen Java-Spezialisten. DPO kann wegen Version/Budget fehlschlagen und ist kein durch diesen Quelltext bestätigtes Ergebnis.

## Inferenz und GGUF
adapter_model.safetensors ist nur für genau dasselbe HF-Basismodell gültig. Erst nach Review/Export dieselbe 0.5B-Basis mergen, nach GGUF konvertieren und Q4_K_S quantisieren. Der ältere 7B-GGUF-Inferenzcontainer bleibt **separat**. Dataset/Outputs/Cache nie versehentlich ins Image oder Git übernehmen.
