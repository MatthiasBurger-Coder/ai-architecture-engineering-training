# 05 — Validierung als Pipeline, Fehler als Daten

## 1. Inhalt

Validierung besteht nicht aus einem einzelnen `json.loads`. Ein robustes
Boundary-Modell überprüft Transportgröße, JSON-Syntax, Envelope, Toolname,
Argumentschema, Scope, Freigabe, Fachzustand und Ergebnis. Welche Information
vor der Autorisierung nachgeschlagen werden darf, muss bewusst entschieden sein:
Fehlermeldungen dürfen nicht die Existenz fremder Daten offenlegen.

## 2. Pipeline der Referenz

1. Maximal 16 KiB UTF-8 für einen Proposal-String.
2. Genau ein JSON-Objekt; doppelte Keys und NaN/Infinity werden abgelehnt.
3. Envelope mit call_id, name und arguments; keine Autoritätsfelder.
4. Lookup im statischen Katalog, danach Input-Schema.
5. Repository-Scope und Grant aus einem separat übergebenen Context.
6. Bei WRITE: serverseitig hinterlegte Freigabe für den Argument-Fingerprint.
7. Idempotenzprüfung, Fachzustand und Handler.
8. Tool-Output-Schema, Result-Envelope und Audit.

Der Context wird im Test konstruiert. In Produktion darf er ausschließlich aus
der Authentifizierungsschicht stammen. Ihn aus derselben Modellnachricht zu
deserialisieren wäre eine Sicherheitslücke.

## 3. Warum nicht automatisch reparieren?

Ein unbekanntes Feld wie `approved` wird nicht ignoriert. Ein String wird nicht
zu einer Zahl gecastet. Sonst können Validator, Approval und Executor verschiedene
Operationen sehen. Reparaturen benötigen einen eigenen, erneut geprüften Vorschlag.

Whitespace-Normalisierung kann sinnvoll sein, gehört aber in einen spezifizierten
Canonicalization-Schritt. Derselbe normalisierte Inhalt muss dann sowohl für
Freigabe als auch für Idempotenz und Ausführung verwendet werden. „Irgendwo trimmen“
ist kein deterministischer Vertrag.

## 4. Kontrollierte Fehler

| Code | Bedeutung | Reaktion |
|---|---|---|
| INVALID_JSON / INVALID_ENVELOPE | Keine interpretierbare Proposal | Nicht ausführen |
| UNKNOWN_TOOL / INVALID_ARGUMENTS | Vertrag verletzt | Begrenzte Eingabekorrektur |
| FORBIDDEN / APPROVAL_REQUIRED | Authority fehlt | Stop oder externer Freigabeprozess |
| NOT_FOUND | Erlaubtes Ziel existiert nicht | Ziel klären |
| VERSION_CONFLICT | Ausgangszustand geändert | Neu lesen und neu planen |
| IDEMPOTENCY_CONFLICT | Key für andere Argumente wiederverwendet | Nicht erneut ausführen |
| OUTPUT_INVALID | Handlerantwort verletzt Vertrag | Zustand untersuchen, nicht Erfolg erfinden |
| EXECUTION_UNKNOWN | Ergebnis der Ausführung nicht sicher bekannt | Reconciliation statt Blind-Retry |

Fehlerdetails enthalten keine Rohargumente, Stacktraces oder Credentials.
Ein `retryable`-Flag ist nur ein Signal für die Runtime. Im Labor sind
Toolfehler nicht automatisch retrybar, weil kein produktiver Retry-Controller
existiert.

## 5. Outputvalidierung ist kein Rollback

Ein Handler kann mutiert haben und danach eine ungültige Antwort liefern.
Das macht die Mutation nicht rückgängig. Im Labor wird der Idempotenzkey dafür
als „Ausgang unbekannt“ gesperrt. In Produktion müssen Operation-Journal,
Backendabfrage oder Transaktion helfen. Gerade diese Situation zeigt, warum
ein Validator allein keine „Exactly once“-Garantie erzeugt.

## 6. Lernziel

Für jeden Negativfall beweist du nicht nur den Error-Code, sondern auch den
Zustand: kein angelegtes Issue, unveränderte Version oder bewusst unbekannter
Ausgang. [Übung 03](../exercises/03-validation/README.md) verlangt diese
beiden Ebenen getrennt.
