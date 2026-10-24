# Referenzlösung 04 — PEFT, LoRA und QLoRA

> Erst nach eigenem Versuch lesen.

Trainierbar sind die LoRA-Adapter, nicht die quantisierten Basismatrizen. Der PyTorch-Caching-Allocator wird begrenzt; CUDA-Kontext, Treiber, Fremdprozesse oder CUDA-Allokationen außerhalb dieses Allocators werden dadurch nicht hart begrenzt.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
