# AI Architecture Engineering Training

Ein praxisorientiertes Gap-Closing-Programm für erfahrene Software Engineers auf dem Weg zu **AI Automation, agentischen Systemen und AI Architecture Engineering**. Das Repository verbindet Lernmaterialien, überprüfbare Engineering-Labs, einen Kompetenz-Lernbaum und das lokale Angular Learning Studio.

## Einstieg

- **Training beginnen:** [Roadmap und Lernpfad](ROADMAP.md), danach das jeweilige [Modulverzeichnis](modules/).
- **System verstehen:** [Systemübersicht und Datenflüsse](docs/system-overview.md) und [Referenzarchitektur](ARCHITECTURE.md).
- **Learning Studio lokal starten:** [Lokale Gesamtstart-Anleitung](docs/getting-started.md); Details zu Bedienung und Grenzen stehen in [frontend/README.md](frontend/README.md).
- **Sicherheitsregeln:** [SECURITY.md](SECURITY.md).
- **Mitwirken und Dokumentation pflegen:** [Audit und Informationsarchitektur](docs/documentation-audit.md), [Vorlagen](docs/templates/README.md) und [Pflege- und Qualitätsprozess](docs/documentation-maintenance.md).

## Trainingsziel

Das Training befähigt dazu, einen unbekannten Geschäftsprozess in deterministische Schritte, begrenzte LLM-Aufgaben, Retrieval, Tool Calls, agentische Planung, Policy-/Approval-Gates sowie Evaluation und Observability zu zerlegen. LLM-Ausgaben bleiben Vorschläge; Autorisierung und sicherheitskritische Invarianten liegen außerhalb des Modells.

Der Kernpfad umfasst M01–M08 und Capstone. M09 (Model Training & Fine-Tuning) ist eine optionale Spezialisierung nach M01. Detaillierte Lernziele und Voraussetzungen stehen in [ROADMAP.md](ROADMAP.md); die fachlichen Regeln des [Kompetenz-Lernbaums](learning-tree/README.md) verlangen echte Evidence und unabhängige Prüfung, keine bloßen Checkboxen.

## Repository-Navigation

| Bereich | Inhalt |
|---|---|
| [modules/](modules/) | M01–M09 mit Lektionen, Übungen, Lösungen, Assessments und Evidence |
| [capstone/](capstone/) | Capstone-Materialien und Assessment |
| [learning-tree/](learning-tree/) | Kompetenzkatalog, Gate-Policy und lokale Validatoren |
| [frontend/](frontend/) | Angular Learning Studio für den lokalen Lernpfad |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Referenzarchitektur der Trainingsinhalte |
| [SECURITY.md](SECURITY.md) | Sicherheitsbaseline und Capstone-Security-Gate |
| [ROADMAP.md](ROADMAP.md) | Module, Lernziele und Gates |
| [docs/](docs/) | Systemübersicht, Startanleitung, Audit, Vorlagen und Pflegeprozess |

## Projektteile unterscheiden

Das Learning Studio benötigt zum lokalen Betrieb nur Node.js/npm und einen Browser; es liest ausgelieferte Trainingsinhalte same-origin und braucht keinen zentralen Anwendungsserver oder Login. Optionale Qualitätsprüfungen sind in [docs/getting-started.md](docs/getting-started.md) beschrieben. Die Labs in Modulen sind getrennte Referenzübungen mit jeweils eigenen Voraussetzungen und starten nicht automatisch mit dem Studio.

## Qualität und Dokumentation

Dokumentationslinks und Markdown-Struktur lassen sich mit `npm run docs:check` aus dem Repository-Stamm reproduzierbar prüfen. Frontend-Tests und -Build stehen in der Startanleitung. Der verbindliche Pflegeprozess, einschließlich der Grenzen automatisierter Checks, ist in [docs/documentation-maintenance.md](docs/documentation-maintenance.md) festgehalten.
