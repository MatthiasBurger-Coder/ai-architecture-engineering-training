# End-to-End-Datenfluss

```mermaid
flowchart LR
 W[Windows NVIDIA Driver] --> S[WSL2 GPU-PV]
 S --> D[Docker NVIDIA Runtime]
 D --> C[CUDA Userspace / PyTorch]
 F[JSONL SFT und DPO] --> V[Dataset Validator]
 V --> T[QLoRA / SFT / DPO]
 C --> T
 T --> A[PEFT LoRA Adapter]
 A --> E[Hold-out Evaluation / Javac / JUnit]
 E --> G[Optional: Merge / GGUF Export]
 G --> I[llama.cpp Inferenz]
```

**Wichtige Systemgrenzen:** Windows-Treiber ist nicht im Container; Docker-GPU-Zugriff ist keine VRAM-Memory-Quota; Dataset-Bind-Mounts sind read-only; HF-Cache und Adapteroutputs bleiben Host-Volumes; nur nach unabhängiger Evaluation erfolgt ein Release.
