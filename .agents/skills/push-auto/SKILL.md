---
name: push-auto
description: Schließt beauftragte Entwicklungsarbeit im AI Architecture Engineering Training über Feature-Branch, Push, PR und vorhandene Automatisierung ohne unnötige Rückfragen ab.
---

# Push automatisch abschließen

Verwende diesen Ablauf, wenn der Nutzer `push auto` sagt oder ausdrücklich Push, Issue-Abschluss und Branch-Aufräumen beauftragt. Die allgemeinen Branch-Vorgaben in `AGENTS.md` gelten auch dann, wenn dieser Skill nicht explizit aufgerufen wurde.

## Vor der Arbeit

1. Als allerersten Arbeitsschritt prüfe Repository, Arbeitsbaum, aktuellen Branch, Default-Branch, Issue und vorhandene PRs.
2. Lege unmittelbar vor jeder Dateiänderung automatisch einen eigenen Branch an und checke ihn aus, wenn noch kein passender Aufgabenbranch aktiv ist. Bevorzugtes Format: `feature/<issue>-<thema>`, ohne Issue `chore/<thema>` oder `fix/<thema>`. Nicht erst bis zum Push oder Commit auf dem Default-Branch weiterarbeiten.
3. Erhalte fremde oder bereits vorhandene Nutzeränderungen. Committe nur die Dateien dieses Arbeitsauftrags.

## Abschluss

1. Prüfe die für die Änderung passenden Tests und Qualitätschecks. Dokumentiere offen gebliebene Kriterien korrekt.
2. Committe und pushe den Issue-Branch, wenn der Nutzer Push beauftragt hat. Niemals direkt auf den Default-Branch pushen.
3. Erstelle oder aktualisiere einen PR zum Default-Branch und verknüpfe das Issue mit `Closes #<nummer>`.
4. Wenn Merge/Auto-Merge ausdrücklich beauftragt ist oder die Repository-Automatisierung den PR selbstständig merged, aktiviere bzw. nutze diese Automatisierung ohne weitere Bestätigungsfrage. Warte auf erforderliche Checks und verifiziere den tatsächlichen Merge.
5. Schließe das Issue und lösche den Issue-Branch lokal und remote erst nach bestätigtem Merge. Lösche niemals den Default-Branch oder einen Branch mit anderem offenen PR bzw. ungemergten Änderungen.
6. Wenn Checks, Reviews, Branch-Schutz oder fehlende Automatisierung blockieren, PR und Branch erhalten. Berichte den konkreten Status; behaupte weder Issue-Abschluss noch Branch-Löschung.

## Rückmeldung

Nenne Commit, Push-/PR-/Merge-Status, Issue-Status und die tatsächlich gelöschten Branch-Referenzen. Eine Dokumentation offener Abnahmekriterien ist möglich; sie darf nicht als vollständige Abnahme oder Epic-Abschluss dargestellt werden.
