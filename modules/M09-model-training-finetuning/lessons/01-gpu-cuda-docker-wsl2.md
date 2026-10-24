# L01 — GPU, CUDA, Docker und WSL2

**Lernziel:** Den gesamten GPU-Pfad erklären und unabhängig von PyTorch prüfen.

## 1. Architektur

Die NVIDIA-GPU gehört physisch dem Windows-Host. Der Windows-NVIDIA-Treiber aktiviert GPU-PV für WSL2; in WSL werden Linux-CUDA-Bibliotheken verwendet. Docker Desktop mit WSL2-Backend oder eine WSL-eigene Docker Engine stellt über die NVIDIA Container Runtime Devices und Bibliotheken im Container bereit. Die CUDA-Version aus nvidia-smi bezeichnet die Treiberfähigkeit, nicht die im Python-Environment installierte Toolkit-Version. Linux-NVIDIA-Kerneltreiber dürfen nicht zusätzlich in WSL installiert werden.

## 2. Zweistufige Diagnose

Prüfe zuerst nvidia-smi in WSL. Dieser Test beweist noch nicht, dass Docker die GPU bekommt. Starte dann ein CUDA-Testimage mit --gpus all. Teste zuletzt torch.cuda.is_available() im Trainingsimage. Unterscheide Docker Desktop Integration von einer Docker Engine direkt in WSL; nur im zweiten Fall ist die Runtime-Konfiguration in der WSL-Engine typischerweise erforderlich.

## 3. Grenzen und Sicherheit

GPU-Zugriff ist ein Geräteprivileg; vermeide unnötige privilegierte Container. NVIDIA_VISIBLE_DEVICES definiert Sichtbarkeit, ist aber kein VRAM-Kontingent. WSL-nvidia-smi kann eingeschränkte Telemetrie anzeigen. Projektdateien gehören für Performance vorzugsweise ins WSL-Linux-Dateisystem.

## Praktisches Beispiel

```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.6.3-base-ubuntu22.04 nvidia-smi
docker compose run --rm trainer gpu
```

## Selbsttest

Zeichne Host → WSL2 → Docker Daemon/Runtime → CUDA Runtime → PyTorch. Dokumentiere die Ausgabe aller drei Tests und mindestens zwei Fehlerursachen mit jeweiliger Diagnose.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
