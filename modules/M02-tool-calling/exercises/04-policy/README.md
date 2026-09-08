# Übung 04 — Schema-valid, trotzdem verboten

## Auftrag

Ergänze einen separat übergebenen, vertrauenswürdigen Context mit Principal,
Repository-Scope und Grants. WRITE braucht zusätzlich ein Approval für die
konkreten Argumente. READ wird ebenfalls autorisiert.

Teste diese Matrix:

| Fall | Erwartung |
|---|---|
| READ + passender Scope/Grant | erlauben |
| READ ohne Grant | verweigern |
| READ für fremdes Repository | verweigern |
| WRITE + Approval, aber ohne Grant | verweigern |
| WRITE + Grant, ohne Approval | Freigabe verlangen |
| WRITE + Grant + exaktes Approval | erlauben |
| WRITE nach Argumentänderung | Freigabe passt nicht mehr |
| Approval eines anderen Principals | verweigern |
| Delete mit Admin und Approval | weiterhin gesperrt |
| Privileged READ ohne Zusatzprivileg | verweigern |

## Abgabe

Eine Markdown-Entscheidung mit Threat Model, Implementierung und zehn
automatisierten Prüffällen. Vergleiche Zustand vor/nach jedem verweigerten Write.
Erkläre, warum eine Approval-Prüfung allein noch keine Autorisierung ist.

## Transferfall

Ein Issue-Body verlangt Secret-Export und Repo-Löschung. Zeige, dass gelesener
Inhalt kein neues Tool registriert, keine Grants ändert und den gesperrten
Delete-Vertrag nicht freischaltet. Behaupte dabei nicht, dass ein solcher Test
alle Prompt-Injection-Angriffe auf ein reales Modell abdeckt.

## Acceptance

Alle Deny-Fälle bleiben ohne Mutation. Effect und Privileged werden als getrennte
Dimensionen modelliert. Der Modellvorschlag kann keine vertrauenswürdigen
Contextfelder setzen. Danach: [Lösung 04](../../solutions/04-policy/README.md).
