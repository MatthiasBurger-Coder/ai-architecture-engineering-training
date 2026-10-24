# Vertragsreview zu Issue #8

Prüfdatum: 24.10.2026. Quellen: [Issue #8](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/8), [Epic #7 einschließlich FE-01–06](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/7), AGENTS.md, preserve-learning-studio samt Baseline, README, ARCHITECTURE.md, `catalog.ts`, `quiz.ts`, `progress.ts`, `app.ts`, Materialskript und vorhandene Tests. Epic hatte zum Prüfzeitpunkt keine Kommentare; Issue #8 hatte laut Metadaten ebenfalls keine Kommentare.

Geprüfte Basisrevision: `b52b8a9fec14a9bd8757730fac2d81eb0f764ff9`, anfänglich unverändertes Arbeitsverzeichnis. Kandidat: diese Basis plus die lokale Änderung an `frontend/README.md` und die neuen Dateien `frontend/src/app/contracts.ts`, `frontend/src/app/contracts.fixtures.ts`, `frontend/contracts/learning-contracts-v1.md`, `frontend/contracts/check-examples.mjs` und dieses Review. Die Prüfergebnisse gelten für diesen lokalen Kandidaten, nicht für eine bereits veröffentlichte Revision. Dateihashes der fachlichen Kandidatdateien stehen unten.

Vier Perspektiven wurden als Rollenprüfung durch **einen Agenten** durchgeführt; keine unabhängigen Reviewer und keine behauptete externe Freigabe.

- Anforderungen: Alle acht Abnahmekriterien von #8 haben explizite Entscheidungen und Beispiele. Der Selbsttrainingsmodus ersetzt simulierte Pflicht-Gates; das Wissenstestergebnis ist kein praktischer Kompetenznachweis. Struktur und Gestaltung bleiben bestehen.
- Architektur: GitHub ist ausschließlich lesende Inhaltsquelle; IndexedDB besitzt die lokale Historie. Nur gespeicherte, konsistente Versuchsketten qualifizieren Levels. Quellenstände und Bewertungsregeln sind historisch reproduzierbar. Kein neuer Backend-Service.
- Umsetzung/Automation: Angular/TypeScript und Node 24 sind vorhanden. Neue Modelle sind bewusst von den vorhandenen `Quiz`-/`Progress`-Demo-Modellen getrennt, ohne zweite Kopie der fachlichen Modulfragen. #9 übernimmt Formatanpassung/Manifeste, #10 den Speicher; deren Ports können mit den Fixtures getrennt implementiert werden.
- Test/Evidence: Grenzwerte, ungültige Zuordnungen, Migration, Fehler, Wiederholungen und Versionswechsel sind konkret prüfbar. Beispielkonsistenz und bestehende Regressionen wurden geprüft. Neue Laufzeitvalidierung, echte Git-Abrufe, IndexedDB-Fehlersimulation und Browserabläufe bleiben Gegenstand der Folge-Issues.

## Abnahmematrix

VERIFIED bedeutet hier ausschließlich: Vertrag am konkreten Beispiel geprüft. Es bedeutet keine Laufzeitabnahme von FE-01–06. OPEN bezeichnet noch ausstehende Implementierung. Es gibt keine ungeklärte blockierende Vertragsentscheidung innerhalb #8.

| ID | Anforderung / Quelle | Produktionspfad / Owner | Abhängigkeiten und tatsächlicher Stand | Implementierungsevidenz | Verifikation / Evidenzniveau | Status |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | #8 getrennte Inhalts-/Fragenquelle; FE-01/02 | Administration → Quellenadapter, #9 | Adapter fehlt noch; SourceConfiguration festgelegt | Vertrag §2, GitSource/ResolvedSource | `sameRepository` und `separateRepositories`: unabhängig, gleiches Repo erlaubt; synthetischer Herkunftsstand | VERIFIED (Vertrag) |
| C-02 | #8 Zugriff, Sichtbarkeit, Ref und Fehler; FE-01/02/04 | GitHub GET → Inhalts-/Fragenloader, #9 | öffentlich ohne Auth, exakte Branch-/Tag-/Commitauflösung; keine Tokens | Vertrag §2, SourceState/SourceErrorCode | `invalidSources`/`sourceFailures`: Pfad, Ref, Zuordnung, 404, 403, 429, offline, JSON; erwartete Fehler nachvollzogen, kein HTTP-Test | VERIFIED (Vertrag) |
| C-03 | #8 Fragenformat und unveränderlicher Versuch; FE-02 | Assessment → Snapshot, #9/#11 | Validierung und Modulformatänderung folgen in #9 | Vertrag §3, QuestionSet/CompletedAttempt | IDs/Optionen/Antwort/Version geprüft; `invalidQuestions`, `inFlightUpdate`; Positivscores automatisiert kontrolliert | VERIFIED (Vertrag) |
| C-04 | #8 Bewertung/Rundung; FE-02/06 | deterministische Auswertung, #11 | Regel 3/4, ganzzahlige Bestehensprüfung; heute bereits 75-%-Demo | Vertrag §3, GradingRule | 2/4, 3/4, 2/3, 3/5, 4/5 und 1/1 fachlich nachgerechnet; Beispiele 3/4, 2/4, 4/4 kontrolliert | VERIFIED (Vertrag) |
| C-05 | #8 versionierter Verlauf, Speicher/Freigabe; FE-03/04/06 | Abschluss → IDB-Transaktion → Gate, #10/#11 | IndexedDB entschieden; add-Erfolg reicht nicht, Transaktionsabschluss erforderlich | Vertrag §4, CompletedAttempt/LocalDataset | R-storage/R-save-twice/R-flag/R-prerequisite: Fail-Closed und Idempotenz fachlich geprüft; keine IDB-Laufzeitprüfung | VERIFIED (Vertrag) |
| C-06 | #8 Migration, Korruption, Wiederherstellung; FE-03/04 | LocalStorage → Roharchiv; lokaler Export/Import, #10 | Legacy kennt keine historischen Commits/Zeitstempel; daher keine qualifizierten Levels | Vertrag §5, LegacyArchive | M-valid/M-corrupt/M-repeat/M-conflict/M-abort: kein Löschen oder Erfinden; Rohbytes im Beispiel erhalten; R-unknown/R-conflict atomar abweisen | VERIFIED (Vertrag) |
| C-07 | #8 Levelgültigkeit, Fehlversuch, Quellenwechsel; FE-05/06 | Verlauf → sequenzielle Ableitung, #11/#12 | Training-ID ist Levelidentität, historische Snapshots bleiben gültig | Vertrag §4/6 | L-empty/L-read/L-retry/L-version: 0 oder 1/9 Levels; Lesefortschritt unabhängig; keine Neubewertung mit aktuellen Fragen | VERIFIED (Vertrag) |
| C-08 | #8 Beispiele, FE-Zuordnung und Folgefähigkeit | Frontend/Architektur → #9–#13 | Quellen-, Speicher-, Gate- und Dashboard-Verantwortung abgegrenzt | Vertrag §1/6, fixtures, dieses Review | positive/negative Eingaben und erwartete Ergebnisse zu allen FE-IDs dokumentiert; Abhängigkeitsgraph azyklisch | VERIFIED (Vertrag) |
| R-01 | Epic FE-01–06 als Gesamtlaufzeitfunktion | #9–#13 | noch nicht umgesetzt; aktueller Prototyp bleibt statisch/LocalStorage/Demo-Gates | vorhandener Code und README | neue Runtime-, Netzwerk-, Restart- und Browsernachweise NOT_RUN | OPEN |

## Entscheidung und Umsetzungsschnitte

**READY_FOR_WORKFLOW für die Verträge aus #8.** #9 und #10 können auf dieser Grundlage beginnen. #11 wartet auf validierte Quellen und erfolgreich qualifizierte Speichertransaktionen, #12 auf den Verlauf aus #10 mit finaler Gate-Integration nach #11. #13 nimmt ausschließlich die integrierte Laufzeitversion ab. Das Epic ist damit nicht abgeschlossen.

| Schnitt | Ergebnis / betroffene Dateien | Datenwirkung und Prüfung | Aufwand (Engineering-Tage) |
| --- | --- | --- | --- |
| #9 | Quellenkonfiguration im bestehenden Admin, Adapter/Validatoren; `app.ts`, neue Adapter, Modul-Quizdateien und Materialmanifeste | lesender Netzweg, Formatprüfung, Refwechsel, Fehler, gestarteter Snapshot; keine persönliche Datenübertragung | 2–3 Umsetzung einschließlich Quellenformaten, 0,5–1 Qualifikation |
| #10 | IDB-Verlauf und Legacy-Archiv, Wiederherstellung/Export/Import; neue Speicheradapter und Aufrufer in `app.ts` | atomare Migration/Versuche, Reload, Konflikt, Quota/Abbruch und Recovery; Originalschlüssel erhalten | 1,5–2,5 Umsetzung, 0,5–1 Qualifikation |
| #11 | gespeicherte fragebasierte Freigabe; `quiz.ts`, `progress.ts`, `app.ts` und zugehörige Tests | keine Flags/Checkboxen als Autorität, Kettenvalidierung, Versionswechsel/späterer Fehlversuch | 0,5–1 Umsetzung, 0,5 Qualifikation nach #9/#10 |
| #12 | reproduzierbare Dashboard-Kennzahlen im bestehenden Layout | nur qualifizierter Verlauf; leere/historische/mehrfache Versuche und Lesemarkierungen | 0,5–1 Umsetzung, 0,5 Qualifikation |
| #13 | Betriebsdokumentation und integrierter Nachweis | Desktop/Mobil, kompletter Ablauf, Netzwerkprüfung und Origin-/Browsergrenzen | 1–2 Qualifikation/Dokumentation |

Schätzungen sind keine gemessene Arbeitszeit; mittlere Sicherheit, öffentliche GitHub-Quellen und vorhandenes Angular-Layout vorausgesetzt. Quellenformate, Speichergrundlage und Migration sind eingeschlossen, keine privaten Auth-Verfahren oder neue Infrastruktur. Reihenfolge: #8 → (#9 parallel planbar mit #10) → #11 → Abschluss #12 → #13; keine Delegation durchgeführt. Vorläufer können über ihre Fixtures entwickelt werden, Integration erst nach qualifizierten Voraussetzungen.

Rollback der Vertragslieferung: ausschließlich neue Vertragsdateien und README-Verweise zurücknehmen; keine Laufzeit-/Speicheränderung. Bei späterem Laufzeitrollback Original-LocalStorage/IDB und exportierte Historie erhalten, nicht mit alten Demo-Schreibpfaden überschreiben. Stopbedingungen: Vertragswiderspruch korrigieren, bevor abhängige Implementierung beginnt; fehlender Vorgänger, ungültige Fragen oder Speicherfehler stoppen lediglich betroffene Tests/Freigaben gemäß Vertrag, nicht die unabhängige Dokumentationsarbeit.

## Ausgeführte Prüfungen

Im Verzeichnis `frontend/`:

| Befehl | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| `npm test` | PASS, 6 Tests | bestehende Demo-Regressionen, keine Verifikation der Zielverträge zur Laufzeit |
| `npx tsc --noEmit` | PASS | Zielmodelle und typisierte Positivbeispiele sind konsistent; keine JSON-Laufzeitvalidierung |
| `node --experimental-strip-types contracts/check-examples.mjs` | PASS | Quellentrennung, drei IDs/Snapshots/Scores, Versionsbindung, Legacy-Erhalt und Beispielkennzahlen; Negativfälle nur spezifiziert |
| `npm run build` | PASS | Produktions-Build des lokalen Kandidaten; keine neue Laufzeitfunktion belegt |
| `git diff --check` (Repository-Wurzel) | PASS | keine Whitespace-Fehler |

Keine UI-/Stiländerung; Browserprüfung für diese Vertragslieferung nicht erforderlich und nicht ausgeführt. Git-Laufzeitintegration, Netzwerkdatenschutz, neue Gate-Funktion, IndexedDB und Migration sind NOT_RUN. Ein grüner Demo-Test ersetzt keinen dieser Nachweise.

## Kandidatbindung

SHA-256 der fachlichen Dateien nach deren Prüfung (Review selbst ausgeschlossen, um eine zyklische Bindung zu vermeiden):

```text
f039c984928353377693ae300fd3b0f98337d89856b3eba5891eb4912ec36c94  frontend/README.md
5dfaa4842d4db7a169757d76ada922271252070dd4b29e95bc77997856a41efa  frontend/src/app/contracts.ts
90100bc99bb0a1f5a5ffd879029b02ef2f42cc63944eec13bda2f3cf5f261e24  frontend/src/app/contracts.fixtures.ts
ea2e6a3d779d296f4a16c50909e8d24cf6017d49455e7d1f2e6a4b15e2fe902a  frontend/contracts/learning-contracts-v1.md
665934c932ee517e40a92ce6174a7c386a2864ca659f15df7405a2613b6ba3cf  frontend/contracts/check-examples.mjs
```
