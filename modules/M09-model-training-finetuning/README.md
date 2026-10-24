# M09 — Model Training & Fine-Tuning

> Vertiefungsmodul für AI Architecture Engineering · Docker/WSL2 + Qwen2.5-Coder · ca. 8–12 h Lernstoff zuzüglich Download- und Trainingszeit

## Leitfrage
Wie lässt sich ein eigenes, auf Java ausgerichtetes LLM **reproduzierbar und messbar** mit begrenztem GPU-Speicher trainieren, ohne Fine-Tuning, GGUF-Inferenz und Modellvalidierung zu verwechseln?

## Gateway und Lernbaum
- **Voraussetzung:** M01 erfolgreich abgeschlossen (LLM-Grundlagen). M09 ist eine **optionale Spezialisierung**, parallel zu M02–M08. Es blockiert den bisherigen Capstone nicht.
- **Eingangs-Challenge:** Erkläre Training vs. Inferenz, Q/K/V und die GPU-Pfadkette. Wer M01 nachweislich bestanden hat, darf M09 öffnen.
- **Ausgangs-Gate:** Wissenstest (mind. 3/4), alle M09-AC01 bis AC08 mit echten, überprüfbaren Artefakten; reine Demo-Checkboxen reichen fachlich nicht aus.
- **Learning Studio:** Ein dauerhaft gespeicherter bestandener Selbsttest zählt zum lokalen Lernstand. Die fachliche Abnahme der Laboraufgaben und aller Acceptance Criteria bleibt ein separater Evidence-Nachweis.
- **Didaktik:** Erklärung → Beispiel → Übung → eigenständiger Test → Referenzlösung → Evidence → Gate. Kein stillschweigendes „Bestanden“ nur durch erzeugte Dateien.

## Lernziele
GPU-Passthrough, GPU-/CPU-Speichergrenzen, NF4/QLoRA und LoRA, SFT und DPO, kuratierte JSONL-Daten, Multi-Datei-Ingestion, 24h-Erweiterung, Hold-out-Evaluation, Adapterkompatibilität und GGUF-Export erklären, implementieren und messen.

## Lektionen
| Lektion | Thema | Lernziel |
|---|---|---|
| [L01](lessons/01-gpu-cuda-docker-wsl2.md) | GPU, CUDA, Docker und WSL2 | Den gesamten GPU-Pfad erklären und unabhängig von PyTorch prüfen. |
| [L02](lessons/02-model-formats-quantization.md) | Gewichte, GGUF, NF4 und Q4_K_S | Trainings- und Inferenzformate technisch sauber auseinanderhalten. |
| [L03](lessons/03-training-datasets.md) | Versionierte SFT-/DPO-Datensätze | Täglich erweiterbare JSONL-Datensätze ohne Leckage und Duplikate handhaben. |
| [L04](lessons/04-lora-qlora.md) | PEFT, LoRA und QLoRA | Adaptertraining in 4-bit laden, konfigurieren und begrenzen. |
| [L05](lessons/05-supervised-fine-tuning.md) | SFT als erster Trainingsdurchstich | Ein SFT-Adapter aus mehreren validierten Dateien erzeugen. |
| [L06](lessons/06-dpo-reinforcement-learning.md) | DPO und die Grenze zu RLHF | Preference-Learning von SFT, Reward-Modellen und echtem RL unterscheiden. |
| [L07](lessons/07-training-evaluation.md) | Evaluation, Baselines und Regressionen | Java-only-Verhalten getrennt von echter Java-Korrektheit messen. |
| [L08](lessons/08-gguf-export-inference.md) | Adapterexport, GGUF und 24h-Lernzyklen | Trainingsartefakte versionieren und kompatibel in llama.cpp bereitstellen. |

## Labor
[Referenzimplementierung](examples/reference/README.md): Dockerfile, Compose, Python-CLI, SFT/DPO-Daten, GPU-Profil, Offline-Tests. Trainiert standardmäßig **Qwen/Qwen2.5-Coder-0.5B-Instruct** mit einem **operativen 4-GiB-Zusatz-VRAM-Ziel** und konservativem PyTorch-Allocatorbudget. Docker bietet **kein garantiertes VRAM-Hard-Limit**.

```bash
cd modules/M09-model-training-finetuning/examples/reference
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.6.3-base-ubuntu22.04 nvidia-smi
docker compose config
docker compose build
docker compose run --rm trainer gpu
docker compose run --rm trainer validate
docker compose run --rm trainer train
```

Ohne Docker: ```bash
cd modules/M09-model-training-finetuning/examples/reference
PYTHONPATH=src python3 -m unittest discover -s tests -v
```

## Lernaufgaben und Nachweise
- [Übungen](exercises/README.md) zuerst lösen.
- [Referenzlösungen](solutions/README.md) erst anschließend vergleichen.
- [Acceptance-Matrix](evidence/acceptance-matrix.md) mit Messungen, Entscheidungen und Referenzen ausfüllen.
- [Wissenstest](assessment/quiz.json) ist die eigene Quizquelle des Learning Studios.

## Technische Realitätsgrenzen
1. Q4_K_S-GGUF ist eine Inferenzquantisierung; QLoRA mit bitsandbytes/NF4 trainiert auf einer HF-Basis mit separaten Adaptergewichten.
2. Ein 0.5B-LoRA-Adapter kann nicht an Qwen2.5-7B-GGUF angewendet werden.
3. PyTorch set_per_process_memory_fraction begrenzt den Caching-Allocator, nicht den gesamten CUDA-/Prozessverbrauch. Das 4-GiB-Ziel muss extern überwacht werden.
4. DPO ist ein Verfahren des Preference-Post-Training, nicht gleichzusetzen mit PPO/RLHF-Rollout-Training.
5. Ein Java-only-Systemprompt und ein kleiner Trainingssatz garantieren weder ausschließlich Java noch korrekten Java-Code. javac und JUnit gehören zur Evidenz.

## Offizielle Referenzen
- NVIDIA CUDA on WSL: https://docs.nvidia.com/cuda/wsl-user-guide/index.html
- Docker GPU Compose: https://docs.docker.com/compose/how-tos/gpu-support/
- PyTorch CUDA allocator: https://docs.pytorch.org/docs/stable/generated/torch.cuda.memory.set_per_process_memory_fraction.html
- Hugging Face PEFT quantization: https://huggingface.co/docs/peft/developer_guides/quantization
- Hugging Face TRL DPO: https://huggingface.co/docs/trl/dpo_trainer
- llama.cpp model export: https://github.com/ggml-org/llama.cpp/blob/master/docs/models.md
