# Lösung 05 — Journal und Versionsprüfung

| Versuch | Backendwirkung | Resultat |
|---|---|---|
| Erster Create | ein Issue angelegt | ok, ID 2 |
| Gleicher Key/Argumente, neue call_id | keine weitere Mutation | dieselben Daten, neue call_id |
| Gleicher Key, anderer Titel, neues passendes Approval | keine Mutation | IDEMPOTENCY_CONFLICT |
| Erster Update gegen Version 1 | Version wird 2 | ok |
| Zweiter Update mit neuem Key gegen Version 1 | keine Mutation | VERSION_CONFLICT |
| Create mutiert, Antwort geht verloren | ein Issue angelegt | EXECUTION_UNKNOWN |
| Retry des unsicheren Create | keine weitere Mutation | EXECUTION_UNKNOWN |
| Replay nach Grantentzug | keine Wirkung, keine gespeicherten Daten offengelegt | FORBIDDEN |

Ohne erneutes Approval für die geänderten Argumente würde der Key-Konfliktversuch
bereits APPROVAL_REQUIRED liefern. Tests müssen deshalb die Voraussetzungen der
jeweils untersuchten Grenze herstellen.

## Produktionsentwurf

Eine Operation erhält einen dauerhaften, eindeutig indizierten Datensatz.
Ein atomarer Claim verhindert parallele Erstausführung. Fachliche Mutation und
Journalabschluss werden, soweit möglich, in derselben Backendtransaktion
gesichert. Liegt das Backend außerhalb dieser Transaktion, benötigt man dessen
Idempotenzunterstützung oder ein explizites Reconciliation-Verfahren.

Crash nach Write und vor Journalabschluss bleibt sonst zweideutig. Ein Outbox-
Muster löst nicht automatisch jeden externen Side Effect „exactly once“.
Retention muss länger als das maximale Wiederholungsfenster sein; nach Ablauf
darf ein alter Key nicht unbemerkt eine neue fachliche Aktion werden.

Die lokale Lösung demonstriert die Zustandsunterscheidung, nicht diese
Produktionsgarantien. Sie ist sequenziell und verliert das Journal bei Neustart.
