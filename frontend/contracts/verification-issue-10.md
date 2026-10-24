# Verifikation · Issue #10

Geprüft am 24.10.2026: lokale Versuchshistorie, Migration und Wiederherstellung aus [Issue #10](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/issues/10), gegen den [v1-Vertrag](learning-contracts-v1.md). Basisrevision: [`646caff`](https://github.com/MatthiasBurger-Coder/ai-architecture-engineering-training/commit/646caff); die Umsetzung liegt beim Prüflauf als lokale, noch nicht eingecheckte Änderung darauf. Dieser Nachweis behauptet keine Veröffentlichung oder Issue-Schließung.

## Umsetzung und Abnahme

| Kriterium | Implementierung / Nachweis | Ergebnis |
| --- | --- | --- |
| Vollständige, versionierte Versuche mit UUID, Zeit, Training, Fragenstand/Commit, Antworten, Regel, Punkten und Status | [quiz.ts](../src/app/quiz.ts), [local-data.ts](../src/app/local-data.ts), Validierungs- und Browsertests | bestanden |
| Append-only Wiederholungen und idempotente Speicherung | [local-store.ts](../src/app/local-store.ts), Speicherung von Erfolg/Fehlversuch/Quellenwechsel; gleiche ID zweimal; abweichender Inhalt unter gleicher ID abgelehnt | bestanden |
| Reload und vollständiger Browserneustart im selben Profil | [Browsercheck](../scripts/check-local-history.mjs): persistentes temporäres Chromium-Profil schließen und neu öffnen; Historie, Lesemarkierung und gültige Levelkette erhalten | bestanden |
| Migration ohne erfundene historische Fakten | Roharchiv mit tatsächlicher Importzeit; wiederholte Migration unverändert; gültige und beschädigte Altdaten, Konflikt und abgebrochene Archivierung geprüft | bestanden |
| Beschädigte / unbekannte Daten erhalten und sichtbar behandeln | Score, Antworten, Regel, Zeit, UUID, Vorgängerkette, Lesemarker, Archiv, Konfiguration, Datenformat- und DB-Version geprüft; Rohdaten weiterhin exportierbar | bestanden |
| Schreibfehler sichtbar und erneut speicherbar, keine verfrühte Freigabe | Transaktionsabbruch nach erfolgreichem `add` in Unit- und echtem Browsertest; Ergebnis bleibt in der Sitzung, Level bleibt gesperrt; Retry speichert dieselbe ID | bestanden |
| Lokaler Betrieb ohne Login / Übertragung von Lerndaten | Browserchecks beobachten ausschließlich GET-Quellenabrufe ohne Requestbody; kein Versuch-ID-Anhang; Export/Import über lokale JSON-Daten und Blob-Download | bestanden |
| Browser-/Origin-Bindung und Datenverlust dokumentiert | [Betriebsdokumentation](../README.md#lokale-historie-und-wiederherstellung), Hinweise in Training Administration | umgesetzt |

Zusätzlich geprüft: atomarer Import mit Rollback bei spätem Archivkonflikt, Selbstständigkeit importierter Voraussetzungsketten, idempotenter Import, getrennte Übernahme von Sicherungsquellen, Schreibvorgänge über getrennte DB-Verbindungen sowie Teststart in einem zweiten Browser-Tab gegen die gespeicherten Vorgänger. Gültige unabhängige Versuche bleiben bei Beschädigung anderer Datensätze auswertbar; abhängige Versuche werden ausgeschlossen. Ein späterer Fehlversuch hebt ein früheres Bestehen nicht auf.

Die fünf Ansichten, Navigation und der Lernbaum bleiben erhalten. Die bisherige Demo-Checkbox-Freigabe wurde gemäß Vertrag durch den aus gespeicherten Selbsttests ableitbaren Stand ersetzt. Neue Historie steht im Assessment Center, Sicherung und Wiederherstellung in Training Administration. Es gibt keinen Lösch-Reset für persistierte Daten; „Offene Versuche verwerfen“ verwirft Sitzungstests und erhält ausstehende Speicherungen.

## Ausgeführte Prüfungen

Unter `frontend/`, Node.js 24.19.0:

- `npm test`: **24 Tests bestanden**, einschließlich 13 neuer Persistenz-/Migrationstests mit `fake-indexeddb`.
- `npm run build`: erfolgreich, initiales Produktionsbundle rund 327 kB, innerhalb des bestehenden Budgets.
- `node scripts/check-runtime.mjs`: bestanden gegen den aktuellen Entwicklungsserver auf Port 4201; 18 lesende API-Anfragen; Quellenwechsel, unveränderlicher Versuch, Tastaturbedienung, Fehler/Wiederholung, Konfigurations-Reload sowie Ansichten mit 1440/390 px geprüft.
- `node scripts/check-local-history.mjs`: bestanden gegen denselben Stand; 20 lesende API-Anfragen; vollständiger Browserneustart, Migration/Konflikt, Speicherabbruch/Retry mit identischer ID, Wiederholungen, zweiter Tab, lokaler Export, idempotenter und abgelehnter Import, roher Export beider Legacy-Konfliktwerte und beschädigte Kette geprüft.
- `git diff --check`: erfolgreich.

Browserchecks verwenden separat installiertes Playwright und Chromium. `LEARNING_STUDIO_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_TEST_MODULE` und `PLAYWRIGHT_CHROMIUM` sind wie in der [README](../README.md) beschrieben konfigurierbar. Der neue Check löscht sein temporäres Profil nach dem Lauf. Screenshots entstehen unter dem System-Temp-Verzeichnis (`issue10-assessment-desktop.png`, `issue10-Training-Administration-mobile.png`, `issue10-Assessment-Center-mobile.png`, `issue10-Skill-Tree-mobile.png`); Desktop und schmale Administration wurden zusätzlich visuell betrachtet. Kein horizontaler Überlauf und keine Browser-Laufzeitfehler in den geprüften Ansichten.

## Nachweisgrenzen

Die GitHub-Antworten und Commits in den Browserchecks sind kontrollierte Fixtures. Geprüft sind echte Chromium-/IndexedDB-Transaktionen und ein echter Browserprozess-Neustart; die Tests belegen weder die Veröffentlichung der Git-Inhalte noch das Verhalten aller Browser oder einen Betriebssystem-Neustart. Quota-/Schreibfehler werden gezielt simuliert; eine physisch volle Festplatte wurde nicht erzeugt. Browser können lokale Daten löschen; regelmäßige lokale Sicherungen bleiben erforderlich. Keine Cloud-Synchronisierung oder unabhängige Zertifizierung praktischer Kompetenz.
