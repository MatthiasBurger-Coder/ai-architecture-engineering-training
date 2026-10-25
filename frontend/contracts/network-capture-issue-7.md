# Netzwerk- und Ende-zu-Ende-Nachweis · Epic #7

Aufgezeichnet am 25.10.2026 um 06:59 UTC mit Playwright 1.64.1 und Chromium 1248. Anwendungskandidat: `d110ab2c4c8c93786cf04542ecd740bd44aac47c`; lokaler Angular-Entwicklungsserver unter `http://127.0.0.1:4203`, Browserprofil frisch und nur für diesen Lauf verwendet.

## Durchlauf

1. Skill Tree geöffnet; M01-Materialien im Learning Workspace geladen.
2. M01-Fragen geladen und Test gestartet.
3. Alle vier Antworten ausgewählt und Test mit **4/4 bestanden** abgegeben.
4. Anwendung vollständig neu geladen. Der gespeicherte M01-Abschluss stellte M02 als **Verfügbar** dar.
5. Competency Dashboard geöffnet: **1/10 Trainings bestanden, 1/1 bestandene Versuche, 100 %**; Lesemarkierungen blieben bei 0.

## Beobachteter Browserverkehr

Playwright zeichnete 36 Browserrequests während Laden, Abgabe, Reload und Auswertung auf. Sechs gingen an die GitHub-API; alle übrigen waren lokale Anwendungsressourcen oder Schriftdateien. Alle 36 Requests waren `GET` ohne Request-Body. Es traten keine JavaScript-Laufzeitfehler auf.

| Request | Methode | Body |
| --- | --- | --- |
| `/repos/MatthiasBurger-Coder/ai-architecture-engineering-training/git/ref/heads/main` (vier Auflösungen) | GET | keiner |
| `/contents/modules/M01-llm-foundations/materials.json?ref=d110ab2c4c8c93786cf04542ecd740bd44aac47c` | GET | keiner |
| `/contents/modules/M01-llm-foundations/assessment/quiz.json?ref=d110ab2c4c8c93786cf04542ecd740bd44aac47c` | GET | keiner |

Es gab beim Testen, Speichern, Reload und Dashboard-Aufruf keine weiteren Requests an GitHub oder einen Ergebnisdienst. Damit verließ in diesem Lauf kein Antwort-, Ergebnis- oder Berichtsinhalte enthaltender Request den Browser. Die GitHub-Aufrufe waren echte Live-Antworten und zeigten für beide Dateien Commit `d110ab2c4c8c93786cf04542ecd740bd44aac47c`.

## Grenzen

Der Mitschnitt belegt den protokollierten Ablauf in Chromium gegen die öffentliche GitHub-API. Er ist kein Sicherheitsnachweis für jedes Browserprofil, jede Erweiterung oder manipulierte lokale Laufzeit. Die automatisierten Unit-, Build- und Browsercheck-Ergebnisse sind zusätzlich im [Gesamtabnahmebericht #13](verification-issue-13.md) dokumentiert.
