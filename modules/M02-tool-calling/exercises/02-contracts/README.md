# Übung 02 — Fünf Tool Contracts entwerfen

## Auftrag

Entwirf get_issue, create_issue, search_repository, update_issue und
delete_repository. Jeder Vertrag enthält Name, Beschreibung, Input-Schema,
Output-Schema, Effect, Permission, Privileged-Flag, Approval-Regel und Version.
Orientiere dich fachlich am Issue-Assistenten, nicht an einer universellen
Admin-Schnittstelle.

Vorgaben:

- ID mindestens 1; Repository explizit; unbekannte Argumentfelder ablehnen.
- Titel 1–120 Zeichen und nicht nur Leerraum; Body höchstens 2.000 Zeichen.
- Suchlimit 1–10, mit dokumentiertem Default bei Weglassen.
- Update enthält erwartete Version und mindestens Titel oder Status.
- Status ist open oder closed. Optionale Felder sind nicht automatisch nullable.
- Create/Update benötigen stabilen Idempotenzkey.
- Delete bekommt einen Vertrag, aber keinen freigeschalteten Handler.
- Ausgabe enthält echte Ressourcendaten oder einen klaren Fehlervertrag.

## Abgabe

Fünf maschinenlesbare Schemas, Permission-Matrix und Auswahlmatrix:
Für jedes Tool ein Positivfall und ein Fall, in dem es gerade nicht gewählt werden
soll. Beschreibe eine inkompatible Vertragsänderung und deren Migrationsbedarf.

## Tests und Acceptance

Prüfe pro Input mindestens Happy Path, fehlendes Pflichtfeld, unbekanntes Feld
und falschen Typ. Ergänze Titel- und Suchlimit-Grenzwerte sowie den leeren Patch.
Prüfe pro Output mindestens einen gültigen und einen fehlerhaften Datensatz.

Für mindestens drei Tools müssen Input und Output mit einem echten
Schema-Validator getestet werden. Alle fünf Verträge müssen fachlich vollständig
sein. Eine bloße Aufzählung von Feldnamen ist keine Abgabe.

Danach: [Lösung 02](../../solutions/02-contracts/README.md).
