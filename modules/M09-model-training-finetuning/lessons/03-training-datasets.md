# L03 — Versionierte SFT-/DPO-Datensätze

**Lernziel:** Täglich erweiterbare JSONL-Datensätze ohne Leckage und Duplikate handhaben.

## 1. SFT-Format

Supervised Fine-Tuning benutzt instruction und response. Die Antwort enthält das gewünschte Java-Ausgabeformat. Beispiele müssen fachlich überprüft sein: Syntax, Imports, Klassenbezüge, Java-Version und Sicherheitsannahmen. Reine Oberflächenheuristiken ersetzen kein javac.

## 2. DPO-Format

DPO verwendet instruction, chosen und rejected. Das gewählte Beispiel muss eine messbar bessere Antwort sein. Viele nur triviale Negativbeispiele (Markdown-Fence statt Code) trainieren hauptsächlich Formatpräferenzen; für echte Java-Kompetenz braucht es anspruchsvollere fachliche Kontraste.

## 3. Mehrere Dateien und täglicher Import

Unter datasets/sft und datasets/dpo können beliebig viele datierte JSONL-Dateien liegen. Je Zeile steht genau ein JSON-Objekt; Java-Zeilenumbrüche sind als \n escaped. Der Loader sortiert Pfade vor dem Laden, erkennt exakte Dubletten und lehnt fehlerhafte Einträge ab. Neue Dateien verändern einen vorhandenen Adapter nicht automatisch: Erst ein neuer Lauf erzeugt eine neue Version.

## 4. Hold-out und Datensatzhygiene

Eine separate datasets/eval-Datenmenge wird nicht trainiert. Gleichlautende Instruktionen und semantisch nahezu identische Varianten sollten zwischen Train und Eval ausgeschlossen werden. Vor Experimenten Dataset-Hash, Quellen, Größe und Version protokollieren. Unbekannte Java-Dateien, generierte Antworten und externe Quellen ohne Lizenzprüfung nicht ungeprüft übernehmen.

## Praktisches Beispiel

```json
{"instruction":"Erstelle eine immutable CustomerId.","response":"public record CustomerId(String value) {}"}
```

```json
{"instruction":"Erstelle einen Repository-Port.","chosen":"public interface Port {}","rejected":"Hier ist ein Port: ```java\npublic interface Port {}\n```"}
```

## Selbsttest

Erstelle zwei datierte SFT-Dateien, eine DPO-Datei und eine Hold-out-Datei. Füge absichtlich ein Duplikat und eine falsch formatierte Zeile hinzu und stelle sicher, dass validate beide bemängelt.

## Engineering-Folge

Ergebnis, Konfiguration, Annahmen, Fehler und Messwerte müssen nachvollziehbar in der M09-Evidence dokumentiert werden. Eine erfolgreiche Ausführung ohne Qualitätsprüfung ist kein Abschlussnachweis.
