# Kapitel 06 — Halluzinationen und technische Grenzen

## Lernziel

Nach diesem Kapitel kannst du Halluzinationen in konkrete Fehlermodi zerlegen und passende Kontrollen für ein Engineering-System auswählen.

## 1. Arbeitsdefinition

Eine Halluzination ist eine Ausgabe, die sprachlich plausibel erscheint, aber nicht ausreichend durch Fakten, Kontext oder zulässige Inferenz gestützt ist. Der Begriff beschreibt ein beobachtetes Systemverhalten; er erklärt nicht allein dessen Ursache.

## 2. Häufige Fehlermodi

| Fehlermodus | Beispiel | Sinnvolle Kontrolle |
|---|---|---|
| fehlende Evidenz | erfundene API-Methode | Retrieval, Abstention, Provenance |
| veraltete Evidenz | alte Konfiguration | Version-/Freshness-Filter |
| widersprüchlicher Kontext | zwei verschiedene Portwerte | Konflikt markieren und stoppen |
| falsche Ableitung | plausible, aber ungültige Migration | Tests, Validator, Reviewer |
| Instruktionsinjektion | Dokument fordert geheime Daten an | Vertrauensgrenzen, Policy |
| Überkonfidenz | Antwort ohne Unsicherheitsmarker | Evidence-Pflicht, Schwellenwerte |

## 3. Warum größere Modelle das Problem nicht entfernen

Ein größeres Modell kann mehr Muster erfassen und viele Aufgaben besser lösen. Es bleibt aber ein Schätzer mit begrenztem Kontext und unvollständigem oder veraltetem Wissen. Wenn die Anwendung eine Garantie benötigt, muss sie die Garantie außerhalb des Modells implementieren: Quellenprüfung, formale Validierung, Tests, Berechtigung, Approval oder deterministische Ausführung.

## 4. Abstention ist eine Fähigkeit

Ein gutes System erlaubt Antworten wie „Evidenz reicht nicht aus“. Das ist keine Niederlage, sondern ein kontrollierter Zustand. Die Anwendung sollte unterscheiden zwischen `answerable`, `needs_more_evidence`, `conflict_detected`, `not_authorized` und `execution_failed`.

## 5. Praktische Diagnosefragen

Bei einer falschen Antwort wird nicht nur der Output gelesen. Prüfe:

1. Welche Eingabe-Tokens wurden tatsächlich verwendet?
2. Welche Quelle und Version lag vor?
3. Gab es widersprüchliche Informationen?
4. Welche Decoding-Konfiguration und welches Modell liefen?
5. Wurde die Ausgabe validiert oder direkt weitergereicht?

Diese Fragen führen direkt zu Evidence und Observability in M07.

