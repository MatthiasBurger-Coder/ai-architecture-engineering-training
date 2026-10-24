# L04 — PEFT, LoRA und QLoRA

**Lernziel:** Adaptertraining in 4-bit laden, konfigurieren und begrenzen.

## 1. Low-Rank Update

LoRA approximiert einen Gewichtsupdate mit zwei kleinen trainierbaren Matrizen; die großen Basisgewichte bleiben eingefroren. Der Rank r bestimmt den Expressivitäts- und Speichertrade-off. Für kleine GPUs mit r=4 und q_proj/v_proj anfangen und die Wirkung empirisch messen. Mehr Target-Module oder höhere Ranks sind keine kostenlose Qualitätsverbesserung.

## 2. QLoRA-Ladepfad

BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16) ermöglicht 4-bit-Laden. Vor PEFT wird das Modell für k-bit-Training vorbereitet. Das CUDA-Image enthält nur Userspace-Libraries, der Kerneltreiber bleibt bei Windows.

## 3. Budget und Modellwahl

Mit RTX 2070 SUPER und zusätzlichen Desktop-Belegungen ist Qwen2.5-Coder-0.5B ein sinnvoller Start. Ein angeblich hartes Docker-VRAM-Limit von 4 GB wäre irreführend. Der Allocator-Guard ist ein Teilmechanismus; nvidia-smi muss unter Last extern gemessen werden. DPO benötigt oft mehr Speicher als SFT.

## 4. Reproduzierbarkeit

Notiere Basis-Modell-ID und Revision, Trainingsbibliotheken, Seed, JSONL-Hash, Prompt, LoRA-Parameter, Zielumgebung und max_memory. Für reproduzierbare Releases muss die erfolgreiche Abhängigkeitskombination eingefroren werden.

## Praktisches Beispiel

```python
from transformers import BitsAndBytesConfig
import torch
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16)
torch.cuda.set_per_process_memory_fraction(3400 / 8192, device=0)
```

## Selbsttest

Konfiguriere NF4/QLoRA, LoRA-r=4 und nur q_proj/v_proj. Erkläre, welche Speichersegmente durch set_per_process_memory_fraction nicht kontrolliert werden.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
