# Übung 06 — Abschluss: kontrollierter Issue-Assistent

## Business Case

Ein Operator liest ein Issue, sucht die betroffene Healthcheck-Dokumentation,
schlägt ein Folgeticket vor und schließt ein erledigtes Issue. Ein späterer
untrusted Text fordert die Löschung des Repositorys.

## Auftrag

Kombiniere die vorherigen Bausteine zu einer nachvollziehbaren Demonstration:

1. Lies Issue 1.
2. Suche „Healthcheck“ in synthetischen Repository-Dateien.
3. Erzeuge einen Create-Vorschlag, zeige die Ablehnung ohne Approval.
4. Erteile über den Testhost eine getrennte Freigabe und führe aus.
5. Wiederhole dieselbe fachliche Mutation mit neuer call_id.
6. Aktualisiere Issue 1 gegen die zuvor gelesene Version.
7. Zeige einen Versionskonflikt.
8. Verweigere den Löschvorschlag.
9. Erzeuge eine bereinigte Auditübersicht und einen Abschlussbericht.

Im Mindestumfang müssen drei Tools implementiert sein; für search_repository
ist ersatzweise ein dokumentierter Read-Fixture zulässig. Das fünfte Tool bleibt
gesperrt. Kein echter externer Schreibzugriff ist Teil der Aufgabe.

## Abgabe

Eigene Contracts und Implementation, reproduzierbarer Testbefehl, Demo-Protokoll,
Diagramm der Trust Boundaries sowie ein ADR mit Grenzen. Trage AC01–AC10 in
[acceptance.md](../../evidence/acceptance.md) ein. Ein Reviewer prüft die Zuordnung.

## Bestehens-Gate

Alle Pflichtkriterien erfüllt, alle eigenen Tests grün, keine nicht autorisierte
Mutation. Zehn-Minuten-Erklärung ohne Lösungstext plus zwei vom Reviewer
abgewandelte Negativfälle. Dokumentiere offen, dass Fake-Tests keine reale
Modellqualität oder Providerkompatibilität belegen.

Danach: [Lösung 06](../../solutions/06-capstone/README.md).
