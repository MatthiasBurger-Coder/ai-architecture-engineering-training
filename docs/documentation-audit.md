# Dokumentationsaudit und Informationsarchitektur

Stand des Audits: 25.10.2026. Geprüft wurden Repository-Einstiege, zentrale Referenztexte, Modul- und Frontend-READMEs sowie die aktuelle Angular-Konfiguration und Skripte.

## Zielgruppen und Leserpfade

| Leser | Pfad |
|---|---|
| Neue Lernende | [README](../README.md) → [Roadmap](../ROADMAP.md) → Modul-README → Lektionen/Übungen → Lösungen und Evidence |
| Nutzer des Learning Studios | [Startanleitung](getting-started.md) → [Bedienung und Grenzen](../frontend/README.md) → Materialien im Studio |
| Beitragende | [Vorlagenindex](templates/README.md) → Modul-/Evidence-Vorlage → betroffene Modul-README → [Pflegeprozess](documentation-maintenance.md) |
| Architektur-/Security-Reviewer | [Systemübersicht](system-overview.md) → [Referenzarchitektur](../ARCHITECTURE.md) → [Security](../SECURITY.md) → Capstone |
| Lernbaum-Prüfer | [Lernbaum](../learning-tree/README.md) → [Gate-Policy](../learning-tree/gate-policy.md) → zugehörige Evidence |

## Inventar nach Zweck

| Dokumentbereich | Umfang / Ziel | Entscheidung |
|---|---|---|
| `README.md` | Projektziel, kurzer Einstieg und Dokumentationsindex | **Erhalten und vereinheitlichen**; keine redundante Vollkopie der Roadmap |
| `ROADMAP.md` | Lernziele, Reihenfolge, Modul-Gates und Capstone | **Erhalten** als fachliche Trainingsreferenz |
| `ARCHITECTURE.md`, `SECURITY.md` | Trainings-Referenzarchitektur und Security-Gates | **Erhalten** und Abgrenzung zum implementierten Studio klarstellen |
| `modules/M01–M09/README.md` und Unterverzeichnisse | Lernmaterial, Labs, Lösungen und Evidence je Modul | **Erhalten**; mit Vorlagen ausrichten, keine pauschale Neuschreibung |
| `capstone/` | Capstone-Fragen, Materialien und Nachweise | **Erhalten**; im Einstieg verlinken |
| `learning-tree/` | Kompetenzkatalog, Validator, Gate-Policy und Tests | **Erhalten**; als separates Python-Werkzeug kennzeichnen |
| `frontend/README.md` und `frontend/contracts/` | Anwendung, Bedienung, technische Verträge und revisionsgebundene Nachweise | **Erhalten**; Einstieg auf Startanleitung und Systemübersicht ergänzen |
| `docs/` | Systemübersicht, Gesamtstart, Audit, Vorlagen, Pflege | **Neu geordnet** als repositoryweite Dokumentation |

## Befunde und Entscheidungen

| Befund | Betroffene Dateien | Entscheidung |
|---|---|---|
| Root-README verwies auf nicht vorhandenes `labs/` und zeichnete ältere Modul-/Gate-Ansichten; der Einstieg bot keine lokale Startanleitung oder Systemübersicht. | `README.md`, neu `docs/system-overview.md`, `docs/getting-started.md` | **Beheben**: reale Verzeichnisse und heutige Studio-Datenflüsse verlinken; optionales Lab als getrennt kennzeichnen. |
| Trainings-Referenzarchitektur konnte mit einer tatsächlich betriebenen Backend-Architektur verwechselt werden. | `ARCHITECTURE.md`, neu `docs/system-overview.md` | **Beheben**: Referenzmodell klar vom implementierten Studio und seinen Grenzen trennen. |
| Detaillierte Frontend-Anleitung enthielt bereits Speicher-, Quellen- und Wiederherstellungsregeln, war aber nicht als Gesamtstart erreichbar. | `frontend/README.md`, `README.md`, neu `docs/getting-started.md` | **Erhalten und verlinken**; lokale Details nicht doppelt in Root-README pflegen. |
| Modulstrukturen sind nicht vollständig uniform; Module enthalten teils unterschiedliche, fachlich sinnvolle Evidence- und Lab-Formate. | `modules/**`, neu `docs/templates/` | **Erhalten und schrittweise angleichen** über passende Vorlagen, nicht durch künstlich identische Pflichtabschnitte. |
| Bisherige CI deckte M09-Referenzchecks und Learning-Studio-Test/Build ab, aber keine Markdown-Links. | `.github/workflows/m09-learning-checks.yml`, neu `scripts/check-docs.mjs` | **Ergänzen** mit dependencyfreiem lokalen Link-/Strukturcheck im vorhandenen Workflow. |

Die Markdown-Inventur umfasst 442 Dateien einschließlich tief verschachtelter Lernmaterialien. Deshalb erfolgt die strukturierte Angleichung über verbindliche Vorlagen, Modul-README-Einstiege und reproduzierbare Linkschecks statt durch eine vollständige Umschreibung aller Texte.

## Informationsarchitektur

Der Einstieg bleibt `README.md`; die fachliche Roadmap bleibt in `ROADMAP.md`; implementierte Studio-Fakten stehen in `frontend/README.md` und `docs/system-overview.md`. Startbefehle sind an einer Stelle in `docs/getting-started.md` gesammelt. `ARCHITECTURE.md` und `SECURITY.md` beschreiben weiterhin das Training und seine Zielarchitektur. `docs/templates/` definiert wiederverwendbare Formen; `docs/documentation-maintenance.md` beschreibt Auslöser und Prüfablauf.

## Prüfumfang und offene Grenzen

Der Audit prüft Struktur, Dateibestand, Projektkonfiguration und wesentliche Einstiegsaussagen. Er behauptet keine fachliche Vollprüfung jeder Lektion und keine erfolgreiche Ausführung optionaler GPU-/Netzwerk-Labs. Zeitkritische externe Sachstände werden in den betroffenen Modulen selbst gepflegt und müssen dort fachlich geprüft werden. Der reproduzierbare lokale Link-/Markdowncheck ist in [Pflegeprozess](documentation-maintenance.md) dokumentiert.
