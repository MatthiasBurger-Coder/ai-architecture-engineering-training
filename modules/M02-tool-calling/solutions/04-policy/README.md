# Lösung 04 — Policy ohne Modellautorität

Die Referenz verwendet Context(principal, repositories, permissions).
Diese Struktur ist nur deshalb trusted, weil der Testhost sie außerhalb der
Proposal erzeugt. Das Sicherheitsmodell wäre gebrochen, wenn ein Client sie
ungeprüft aus Modellargumenten übernehmen dürfte.

Die Reihenfolge lautet: Tool aktiviert? Scope erlaubt? Grant vorhanden?
Zusatzprivileg nötig? Exaktes Approval vorhanden? Erst dann darf der Handler
erreicht werden. Diese Reihenfolge vermeidet, fremde Ressourcen vor der
Scopeprüfung nachzuschlagen.

| Matrixfall | Ergebnis |
|---|---|
| READ mit Grant und Scope | ok |
| READ ohne Grant | FORBIDDEN |
| READ fremder Scope | FORBIDDEN |
| WRITE ohne Grant trotz Approval | FORBIDDEN |
| WRITE ohne Approval trotz Grant | APPROVAL_REQUIRED |
| WRITE mit allem | ok |
| Argumentänderung nach Approval | APPROVAL_REQUIRED |
| Anderer Principal | APPROVAL_REQUIRED |
| Delete mit Admin + Approval | TOOL_DISABLED |
| Privileged READ ohne Zusatzgrant | FORBIDDEN |

Im Test wird der lokale READ-Vertrag temporär als privileged markiert, um die
zweite Dimension separat zu prüfen. Das schaltet das Delete-Tool nicht frei.

Der Fingerprint bindet Tool und Argumente, die gespeicherte Approval-Menge bindet
zusätzlich den Principal. Der Hash verifiziert keine Identität. Ein echter
Freigabedienst muss Ablaufzeit, Policyversion und Widerruf behandeln.

Die Injection-Probe zeigt lediglich, dass die lokale Runtime Text nicht als
Authority interpretiert und einen folgenden Delete verweigert. Sie beweist
nicht, dass ein reales Modell niemals auf manipulierten Inhalt reagieren würde.
