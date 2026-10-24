# L08 — Adapterexport, GGUF und 24h-Lernzyklen

**Lernziel:** Trainingsartefakte versionieren und kompatibel in llama.cpp bereitstellen.

## 1. Kompatibler Pfad

Für Qwen2.5-Coder-0.5B wird der Adapter mit **derselben** 0.5B-HF-Basis kombiniert, ggf. mit PEFT in FP16 gemerged, in GGUF konvertiert und mit llama-quantize als Q4_K_S quantisiert. Alternativ kann ein kompatibler GGUF-LoRA-Adapter geladen werden, sofern dein llama.cpp-Build die betreffende Variante unterstützt.

## 2. Inferenz unabhängig vom Training

Das frühere Qwen2.5-7B-Instruct-Q4_K_S bleibt ein eigenständiger Inferenzcontainer und bekommt keine 0.5B-LoRA-Gewichte. Die Modelle müssen ausdrücklich identifiziert werden: Name, Variante, Modellgröße, Revision und Promptformat.

## 3. Tägliche Erweiterung

Täglich eine neue Datei je Thema unter datasets/sft oder datasets/dpo erzeugen; Validierung, Hash und Provenienz speichern. Keine automatische Übernahme ohne Review. Jede Trainingsversion erhält einen eigenen Ordner und eine identische Hold-out-Evaluation.

## 4. Laufzeitvergleich

VRAM-Ziel für das Training und Latenz-/Qualitätsziel für die Inferenz sind getrennt. Auf der RTX 2070 SUPER kann Q4_K_S mit Offload-Parametern VRAM sparen, aber der genaue Verbrauch hängt auch von Context Size, Layer-Offload und Backend ab.

## 5. Fehlerdiagnose

Bei CUDA OOM: Prozessliste/VRAM prüfen, kleineres Modell oder kürzere Sequenz. Bei Adapterfehler: Base-ID und Layerform prüfen. Bei kaputten JSONL: Zeilennummer korrigieren. Bei WSL-GPU-Testfehler: erst Runtime-Pfad prüfen, statt das Modell zu wechseln.

## Praktisches Beispiel

```bash
python3 scripts/new_daily_dataset.py --stage sft --topic java-records
docker compose run --rm trainer validate
# erst danach trainieren; Outputs sind neue Adapterversionen
```

## Selbsttest

Entwirf die Freigabekette Dateiänderung → Dataset-Validation → SFT → Eval → Review → Adapter-Version → GGUF-Export. Zeige Rollback und verhindere Cross-Size-Adapter-Verwechslungen.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
