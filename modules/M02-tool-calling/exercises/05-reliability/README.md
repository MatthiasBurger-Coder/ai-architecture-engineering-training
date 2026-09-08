# Übung 05 — Wiederholung ist nicht automatisch sicher

## Auftrag

Implementiere ein sequenzielles In-Memory-Idempotenzjournal und Optimistic
Concurrency. Es soll die Risiken erklären, keine verteilte Transaktion vortäuschen.

Führe fünf Experimente aus:

1. Gleiche Create-Argumente und gleicher Key, aber neue call_id: nur ein neues Issue.
2. Gleicher Key, anderer Titel: IDEMPOTENCY_CONFLICT.
3. Zwei Updates gegen dieselbe Version: erster Erfolg, zweiter Konflikt.
4. Backend mutiert und wirft anschließend TimeoutError: Ausgang unbekannt.
5. Nach erfolgreichem Write wird Grant entzogen: Replay darf keine Policy umgehen.

## Abgabe

Dokumentiere pro Experiment Vorzustand, Argumente, Call- und Operation-ID,
Resultat, Nachzustand und zulässigen nächsten Schritt. Ergänze Tests, die die
Anzahl tatsächlicher Mutationen und die gespeicherte Version prüfen.

Skizziere einen Produktionsentwurf für atomaren Journal-/Backendzugriff.
Behandle Crash zwischen Write und Journalabschluss, parallele Requests,
TTL/Retention und Freigabeablauf. Benenne mindestens zwei Dinge, die dein
In-Memory-Labor nicht garantieren kann.

## Acceptance

Retries erzeugen im sequenziellen Test keine zweite Mutation. Ein unsicherer
Ausgang wird nicht als „nicht ausgeführt“ behandelt. Ein neuer Idempotenzkey
wird nicht als universelle Fehlerbehebung vorgeschlagen.
Danach: [Lösung 05](../../solutions/05-reliability/README.md).
