# Beispiel 03 — Ein Write, zwei Transportversuche

## Inhalt

Das Modell schlägt ein neues Issue vor. Der Host prüft WRITE-Grant und Scope.
Eine vertrauenswürdige Freigabe bindet Principal und Argument-Fingerprint.
Der Host hält den Idempotenzkey operation-001 über Wiederholungen stabil.

```json
{
  "repository": "training/demo",
  "title": "Healthcheck ergänzen",
  "body": "Lokaler Trainingsfall",
  "idempotency_key": "operation-001"
}
```

## Drei mögliche Verläufe

| Verlauf | Journal | Sicherer nächster Schritt |
|---|---|---|
| Handler liefert gültiges Resultat | done + Daten | Replay ohne neue Mutation |
| Handler mutiert, Antwort fehlt | unknown | Backendzustand abgleichen |
| Key wird mit anderem Titel benutzt | Fingerprint weicht ab | Konflikt; nicht ausführen |

Das zweite Szenario wird in der Referenz als Test simuliert:
Der Fake legt ein Issue an und wirft danach TimeoutError. Die Runtime gibt
EXECUTION_UNKNOWN zurück. Ein zweiter Call mit demselben Key bleibt gesperrt.
Die Issue-Anzahl beträgt zwei (ein Seed-Issue plus eine Mutation), nicht drei.

## Warum Approval erneut prüfen?

Ein schon früher freigegebener Call kann nach Entzug des Grants nicht beliebig
wiederholt werden. Die Policyprüfung liegt vor der Journalwiedergabe. Selbst die
Rückgabe gespeicherter Daten kann eine Offenlegung sein.

Im Labor bleibt die Freigabe im Speicher, bis der Prozess endet. In Produktion
muss ein explizites Lebenszyklusmodell entscheiden, ob, wie lange und für welche
Wiederholungen die Freigabe gilt.

## Was hier nicht geschieht

Es wird kein GitHub-Issue erstellt. Es werden keine echten Credentials geladen.
Der destruktive Vertrag bleibt unabhängig von einem Test-Admin-Context disabled.
Die Demo ist für das Verständnis der Grenze geeignet, nicht als Deployment-Tool.

## Lernkontrolle

Warum wäre ein neuer Idempotenzkey beim zweiten Versuch gefährlich?
Er würde den Zusammenhang zur ersten Operation entfernen und einen zweiten Write
ermöglichen, obwohl der erste möglicherweise bereits erfolgreich war.
