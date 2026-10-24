# Referenzlösung 01 — GPU, CUDA, Docker und WSL2

> Erst nach eigenem Versuch lesen.

Die Windows-Treiberinstallation ist genau eine Ebene; nvidia-smi in WSL beweist nur WSL-Sichtbarkeit. --gpus all prüft den Container-Runtime-Pfad. torch.cuda.is_available() prüft zusätzlich die Python-/CUDA-Bibliothekskombination. Typische Fehler sind fehlende WSL-Integration von Docker Desktop oder nicht konfigurierte NVIDIA Container Runtime bei eigenständiger Engine.

## Reviewfragen
- Welche Annahme beeinflusst das Messergebnis?
- Welche Fehler sind mit dem Beispiel noch nicht ausgeschlossen?
- Welcher Test würde einen falschen Erfolg aufdecken?
