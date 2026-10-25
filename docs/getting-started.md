# Lokal starten

Diese Anleitung startet das **Angular Learning Studio** aus einem frischen Checkout. Einzelne Trainings-Labs sind eigenständige Übungen und haben separate Voraussetzungen.

## Voraussetzungen

- Git
- Node.js **24.15.0 oder neuer innerhalb 24.x** (oder 22.22.3+ / 26.0.0+ laut Angular CLI)
- npm passend zu Node.js 24
- aktueller Browser

Node/npm-Version prüfen:

```bash
node --version
npm --version
```

Für dieses Projekt muss `node --version` mindestens `v24.15.0` anzeigen, wenn du Node 24 verwendest. `v24.12.0` ist zu alt und `npm start` bricht mit einer Angular-CLI-Meldung ab.

### Node.js unter Windows / PowerShell aktualisieren

Am einfachsten installierst du das aktuelle Node-24-LTS-Windows-Installationspaket von [nodejs.org](https://nodejs.org/en/download). Schließe danach alle offenen Terminals, öffne PowerShell neu und prüfe:

```powershell
node --version
npm --version
```

Wenn mehrere Node-Installationen vorhanden sind, zeigt `where.exe node` alle Treffer. Die erste gefundene Installation wird verwendet; passe gegebenenfalls `PATH` an oder entferne die alte Installation. Prüfe weiter, bis `node --version` `v24.15.0` oder neuer innerhalb 24.x ausgibt.

Alternativ kannst du einen Windows-Node-Versionmanager wie [nvm-windows](https://github.com/coreybutler/nvm-windows) installieren. Danach in einem neuen PowerShell-Fenster:

```powershell
nvm install 24.15.0
nvm use 24.15.0
node --version
```

Verwende entweder den offiziellen Windows-Installer oder einen Versionmanager; mische beide Installationsarten nicht, da sie um dieselben `PATH`-Einträge konkurrieren können.

## Installation und Start

Im Repository-Stamm:

```bash
cd frontend
npm ci
npm start
```

`npm start` führt vorher den Inhaltssync aus und startet den Angular-Entwicklungsserver auf `0.0.0.0:4200`. Öffne <http://localhost:4200>. Ein erfolgreicher Start zeigt im Terminal, dass der Entwicklungsserver kompiliert und Anfragen bedient; im Browser erscheint die Learning-Studio-Oberfläche mit dem Lernpfad.

Beenden mit `Ctrl+C` im Terminal.

## Optionale Qualitätsprüfungen

Im Verzeichnis `frontend/`:

```bash
npm test
npm run build
```

Der Build führt vorab ebenfalls den Inhaltssync aus und schreibt das Produktionsbundle nach `frontend/dist/training/browser/`. Diese Prüfschritte sind zum Öffnen des Studios nicht erforderlich. Im Repository-Stamm prüft `npm run docs:check` lokale Markdown-Links und grundlegende Markdown-Struktur.

## Häufige Probleme

- **Port 4200 belegt:** Beende den anderen Entwicklungsserver oder starte mit `npm start -- --port 4300`; dann öffne `http://localhost:4300`. Die Browserdaten haben auf dem anderen Port eine eigene Origin.
- **Angular CLI meldet „requires a minimum Node.js version“:** `node --version` prüfen. Bei `v24.12.0` Node 24 mindestens auf 24.15.0 aktualisieren (siehe Windows-Schritte oben), alle Terminals schließen und neu öffnen. Danach im Verzeichnis `frontend/` `npm ci` ausführen und erneut `npm start` starten.
- **Installationsfehler:** Prüfe die unterstützte Node-Version und installiere Abhängigkeiten erneut mit `npm ci` im Verzeichnis `frontend/`.
- **Inhalte fehlen oder sind veraltet:** Stelle sicher, dass der Sync erfolgreich lief; starte `npm start` erneut und lade die Seite neu. Der Build-/Start-Hook kopiert Inhalte aus `modules/`, `capstone/` und `ROADMAP.md`.
- **Änderungen an lokalen Daten:** Einstellungen und Historie gehören zum Browserprofil und zur Origin. Für Wechsel oder Wiederherstellung nutze die Export-/Importfunktionen, wie in [frontend/README.md](../frontend/README.md#lokale-historie-und-wiederherstellung) beschrieben.

## Getrennte Modul-Labs

Referenzübungen startest du nur bei Bedarf. Prüfe zuerst die README des jeweiligen Moduls und verwende dessen dokumentierte Umgebung. Beispiele sind der [M01 Python-Lab](../modules/M01-llm-foundations/examples/README.md), das [M04 RAG-Lab](../modules/M04-rag-retrieval/examples/README.md) und die [M09 GPU-/Docker-Übungen](../modules/M09-model-training-finetuning/README.md). Diese Komponenten werden durch den Studio-Start nicht gestartet.

Weitere Details zu Bedienung, Quellen und Speichergrenzen: [Learning-Studio-Dokumentation](../frontend/README.md). Architekturgrenzen: [Systemübersicht](system-overview.md).
