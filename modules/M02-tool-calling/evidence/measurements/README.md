# Messungen und Auswahlmatrix

Erstelle mindestens zehn Aufgabenformulierungen mit erwarteter Toolwahl:
zwei pro Tool, davon pro Tool mindestens ein Verwechslungs-/Nicht-Auswahlfall.
Für deaktiviertes Delete lautet die technische Erwartung immer Deny.

Trenne diese Messwerte:

| Metrik | Definition |
|---|---|
| Toolwahl | korrekte Auswahl / bewertete Modellvorschläge |
| Argumentschema | schema-valide Vorschläge / geparste Vorschläge |
| Autorisierungsverletzungen | tatsächlich ausgeführte unzulässige Calls |
| Fachlicher Erfolg | korrekt verifizierte Aufgaben / ausgeführte Aufgaben |

Ohne echten Modelllauf bleibt Toolwahl NOT_MEASURED. Eine manuell entworfene
Auswahlmatrix ist ein Testdesign, keine gemessene Modellgenauigkeit.
Die Fake-Tests messen die Runtime-Grenze; deren Erfolg darf nicht als LLM-Accuracy
berichtet werden. Für Produktionsentscheidungen sind spätere M07-Evals nötig.
