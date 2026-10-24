# 01 — Structured Output: Form ist nicht Bedeutung

## 1. Inhalt

Ein Modell kann Fließtext, JSON oder einen Tool-Vorschlag erzeugen. Diese Formen
haben unterschiedliche Zwecke. Eine strukturierte Abschlussantwort ist ein
Datenprodukt für UI oder nachgelagerte Verarbeitung. Ein Tool Call ist ein
Vorschlag, eine registrierte Operation mit Argumenten auszuführen. Der Host führt
aus; das Modell schreibt nicht selbst in das Zielsystem.

Als Java-Vergleich: Ein deserialisiertes Request-DTO hat noch keinen
Security-Interceptor passiert. Ein syntaktisch korrekter Aufruf ist noch keine
fachlich zulässige Transaktion.

## 2. Vier voneinander unabhängige Prüfungen

| Ebene | Prüffrage | Beispiel eines Fehlers |
|---|---|---|
| Syntax | Ist der Text vollständiges JSON? | Fehlende schließende Klammer |
| Schema | Entsprechen Felder und Typen dem Vertrag? | `issue_id: "62"` statt Integer |
| Semantik | Existieren Ziel und zulässiger Zustand? | Issue 62 existiert nicht |
| Authority | Darf dieser Principal diese Aktion ausführen? | Leserecht, aber kein Schreibrecht |

Ein Parser kann die erste Ebene sichern. Ein Schema-Validator prüft die zweite.
Repository- und Geschäftslogik prüfen die dritte. Die Policy mit authentifizierter
Identität prüft die vierte. Eine Modellbegründung ersetzt keine dieser Instanzen.

## 3. Beispiel

```json
{
  "call_id": "c-01",
  "name": "get_issue",
  "arguments": {"repository": "training/demo", "issue_id": 62}
}
```

Das ist ein **lokales, anbieterneutrales Envelope**. Es behauptet keine
Kompatibilität mit einem konkreten SDK. Ein Provideradapter muss dessen Aufruf-ID,
Funktionsname und eventuell als String gelieferte Argumente in diese Form
übersetzen. Der Parser darf einen String mit eingebettetem JSON nicht mehrfach
beliebig auspacken; das Eingabeformat muss eindeutig definiert sein.

Wäre `repository` auf ein fremdes Ziel gesetzt, könnte das Objekt schema-valid
bleiben. Genau deshalb ist eine Scope-Prüfung zwingend. Das Fehlen eines Tools in
der sichtbaren Toolliste reduziert Fehlvorschläge, ist aber keine Zugriffssperre.

## 4. Structured Generation ist eine Hilfestellung

Promptanweisungen wie „Antworte als JSON“ sind keine harte Garantie.
Schemageführte Ausgabe kann die Form einschränken, garantiert jedoch nicht,
dass eine ID existiert oder ein Betrag fachlich korrekt ist. Welche Schemas ein
Anbieter tatsächlich unterstützt, muss für den gewählten Endpoint separat geprüft
werden. Der kanonische Vertrag und der Provideradapter sind unterschiedliche Dinge.

Refusal, abgeschnittene Ausgabe, Transportfehler und ein normaler Tool-Vorschlag
sind unterschiedliche Ergebnisse. Aus einem unvollständigen Argumentfragment darf
kein ausführbarer Call entstehen. Einen Fehler durch freie Textinterpretation
„zu retten“ verschiebt die Grenze zurück ins Probabilistische.

## 5. Lernziel und Transfer

Du kannst für vier konkrete Outputs jeweils die zuerst scheiternde Prüfebene
benennen. In [Übung 01](../exercises/01-guarantees/README.md) muss zu jedem Fall auch
klar werden, welche Komponente entscheidet und ob schon ein Side Effect möglich war.

Selbstcheck: Ein Modell liefert gültiges JSON mit `"approved": true`. Warum ist
das keine Freigabe? Weil es eine Aussage aus derselben untrusted Quelle ist wie
der restliche Vorschlag; eine Freigabe muss aus einer unabhängigen,
vertrauenswürdigen Entscheidung stammen.
