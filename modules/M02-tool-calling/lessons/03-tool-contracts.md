# 03 — Ein Tool Contract ist mehr als ein Funktionsname

## 1. Inhalt

Ein Vertrag beantwortet: Was macht die Operation, wann ist sie geeignet, welche
Argumente verlangt sie, welche Wirkung hat sie und wie wird Erfolg nachgewiesen?
Name und Beschreibung helfen dem Modell bei der Auswahl. Input-/Output-Schema und
lokale Permission-Metadaten werden von deterministischen Komponenten ausgewertet.

Trenne einen modellseitig sichtbaren Vertrag von lokalen Sicherheitsdaten.
Ein vom externen Server mitgeliefertes „harmlos“-Label ist keine verifizierte
Policy. In diesem Labor ist der lokale, versionierte Katalog vertrauenswürdig.

## 2. Fünf Operationen

| Tool | Wählen, wenn … | Nicht wählen, wenn … | Wirkung |
|---|---|---|---|
| get_issue | Repository und Issue-ID bekannt sind | erst relevante Dateien gesucht werden | READ |
| search_repository | Textstellen in Dateien gesucht werden | ein bestimmtes Ticket gelesen werden soll | READ |
| create_issue | ein neues Ticket gewünscht und freigegeben ist | ein vorhandenes Ticket geändert werden soll | WRITE |
| update_issue | ID, erwartete Version und Patch bekannt sind | nur gelesen werden soll | WRITE |
| delete_repository | Löschung ausdrücklich Gegenstand des Vertrags ist | irgendein allgemeines Cleanup gewünscht ist | DESTRUCTIVE, gesperrt |

Eine brauchbare Beschreibung enthält Objekt, Auswahlgrenze, wichtige
Voraussetzungen und Resultat. „Verwalte Issues“ ist zu breit: Es lässt offen,
welche Mutation möglich ist. Ein generisches `execute(command)` würde in diesem
Modul die gewünschte Grenze zerstören.

## 3. Beispiel für eine präzise Beschreibung

„Liest ein existierendes Issue anhand von Repository und positiver Issue-ID.
Verändert keinen Zustand. Nicht zur Volltextsuche in Dateien verwenden.
Liefert ID, Titel, Body, Status und Version; Kommentare optional.“

Diese Beschreibung unterstützt die Auswahl, autorisiert sie aber nicht.
Selbst bei perfekter Beschreibung muss ein unbekannter Funktionsname am
Dispatch scheitern. Ein Name darf nicht in `eval`, dynamische Imports oder
Shellbefehle übersetzt werden.

## 4. Output gehört zum Vertrag

Für `create_issue` reicht `{"success": true}` nicht. Die Anwendung braucht die
tatsächlich angelegte ID, gespeicherten Werte und Version. Ein Error darf kein
unvollständiges Success-Objekt sein. Im Labor enthält jedes Resultat eine
korrelierte ID und genau eine Success- oder Error-Variante.

Fachliche Fehler werden stabil benannt: INVALID_ARGUMENTS ist nicht NOT_FOUND,
und FORBIDDEN ist nicht APPROVAL_REQUIRED. Ein Benutzer kann fehlende Eingaben
nachreichen, aber eine verweigerte Policy nicht durch neue Promptformulierungen
auflösen.

## 5. Versionierung

Wird ein optionales Feld verpflichtend, brechen alte Calls. Wird ein Enumwert
entfernt, kann ein bisher gültiger Client fehlschlagen. Auch engere Längenlimits
sind Vertragsänderungen. Versioniere deshalb Contract, Handler und Tests zusammen.

Im Labor ist contract_version „1.0“. Dies ist eine lokale Vertragsversion, kein
SDK-, MCP- oder Providerstandard. Ein produktiver Adapter braucht zusätzlich
Kompatibilitätstests für seine konkrete Protokollversion.

## 6. Lernziel

Du kannst zu jedem Tool einen positiven Auswahlfall, einen Verwechslungsfall,
den Side Effect, Input/Output und mindestens zwei Fehler nennen.
[Beispielkatalog](../examples/01-contracts/README.md) und
[Übung 02](../exercises/02-contracts/README.md) zeigen den Ablauf.
