# L07 — Evaluation, Baselines und Regressionen

**Lernziel:** Java-only-Verhalten getrennt von echter Java-Korrektheit messen.

## 1. Metrikebenen

Formatkonformität: keine Markdown-Fences, keine Prosa, Java-Konstrukte vorhanden. Syntax: javac kompiliert. Verhalten: JUnit-Tests bestehen. Architektur: nachvollziehbare Regeln/Reviews. Diese Metriken sind verschieden: eine Ausgabe kann rein nach Java aussehen und dennoch nicht kompilieren.

## 2. Hold-out

Untrainierte Aufgaben aus datasets/eval erzeugen eine Baseline vor dem Training und eine identische Evaluation danach. Vergleiche pro Aufgabe die vollständige Ausgabe, nicht nur einen Durchschnitt. Dokumentiere Prompt, Decode-Parameter, Modellversion, Umgebung und Datum.

## 3. Gate

Ein fachliches Gate darf keine Verschlechterung bei Kompilierbarkeit/Sicherheit gegenüber der Baseline akzeptieren. Java-only-Format verbessert sich nur bei stabilen Funktionen als echter Erfolg. Zufällige Mini-Datasets und Heuristiken begründen keine Aussage über Produktionsfähigkeit.

## 4. Evidence

Lege JSON-Reports, compiler/test-Logs und Messprotokolle unter persönlicher Evidence ab. Keine Secrets, Zugangsdaten oder ungeprüfte Kundendaten committen.

## Praktisches Beispiel

```bash
docker compose run --rm trainer evaluate
docker compose run --rm -e INITIAL_ADAPTER=/workspace/outputs/DEIN-SFT-LAUF trainer evaluate
```

## Selbsttest

Erstelle für mindestens zehn Hold-out-Tasks einen Vergleich baseline vs. adapter nach (a) Java-only, (b) javac, (c) JUnit, (d) relevanter Sicherheitsregeln. Formuliere einen begründeten Releaseentscheid.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
