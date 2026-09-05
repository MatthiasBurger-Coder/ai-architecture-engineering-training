# Experiment-Log Vorlage

Für jede Decoding-Konfiguration einen Abschnitt anlegen:

```text
Configuration:
Seed range:
Logits:
Temperature:
Top-k:
Top-p:
Sample count:
Token frequencies:
Distinct token count:
Entropy / alternative metric:
Observation:
```

## Reproduzierbarkeit

Führe mindestens eine Konfiguration zweimal mit identischen Seeds aus. Dokumentiere, ob die Sample-Sequenzen bytegenau identisch waren und welche Voraussetzung dafür erfüllt sein musste.
