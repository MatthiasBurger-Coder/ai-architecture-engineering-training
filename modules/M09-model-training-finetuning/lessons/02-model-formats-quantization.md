# L02 — Gewichte, GGUF, NF4 und Q4_K_S

**Lernziel:** Trainings- und Inferenzformate technisch sauber auseinanderhalten.

## 1. Gewichtsformate

Hugging-Face-Modellgewichte (häufig safetensors) werden von Transformers/PEFT geladen. GGUF ist ein für llama.cpp optimiertes Speicher- und Ausführungsformat. Ein Q4_K_S-GGUF ist kein direktes Ausgangsartefakt für Transformers-QLoRA. Gleicher Familienname ersetzt keine Gewichts-, Architektur- und Größenkompatibilität.

## 2. Quantisierung

Q4_K_S ist eine blockbasierte llama.cpp-Inferenzquantisierung. NF4 ist eine 4-bit-Darstellung für bitsandbytes/QLoRA. QLoRA trainiert keine NF4-Basisgewichte im Vollmodell; es trainiert kleine zusätzliche LoRA-Matrizen. Die Unterscheidung ist methodisch entscheidend, sonst wird fälschlich ein GGUF direkt in DPOTrainer geladen.

## 3. Speicherbudget

VRAM umfasst Gewichte, Aktivierungen, Gradienten/Optimizer für trainierbare Parameter, temporäre Kernelpuffer und CUDA-Kontext. Der PyTorch-Caching-Allocator kann durch set_per_process_memory_fraction begrenzt werden; CUDA-Bibliotheken und andere Allokationen können außerhalb liegen. Für einen operativen Grenzwert von 4096 MiB wird der Allocator konservativ auf 3400 MiB konfiguriert; der reale Zusatzverbrauch muss extern gemessen werden.

## 4. Modellidentität

Die Startbasis Qwen/Qwen2.5-Coder-0.5B-Instruct passt zum kleinen Budget. Ein darauf trainierter Adapter ist **nicht** an Qwen2.5-7B-Instruct Q4_K_S verwendbar. Exportiert wird ein Adapter für dieselbe 0.5B-Basis oder ein daraus erzeugtes gleichgroßes GGUF.

## Praktisches Beispiel

```text
SFT/DPO: HF 0.5B → NF4 Basis + trainierbarer LoRA-Adapter
Inference: HF 0.5B + LoRA → Merge → GGUF → Q4_K_S
Bestehendes 7B GGUF: separater Inferenzpfad, kein 0.5B-Adapter
```

## Selbsttest

Erstelle eine Matrix für GGUF-Q4_K_S, BF16/FP16, NF4/QLoRA und LoRA-Adapter: Zweck, trainierbare Teile, VRAM-Risiko. Erkläre die Inkompatibilität 0.5B → 7B.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
