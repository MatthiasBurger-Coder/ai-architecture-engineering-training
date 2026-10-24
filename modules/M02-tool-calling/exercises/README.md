# M02 Übungen — ohne Referenzlösungen beginnen

1. **Contracts**: Beschreibe get_issue, create_issue, update_issue jeweils mit required, type, ranges, input/output, Permission und Scope; schreibe je einen validen und invaliden Call.
2. **Negative Tests**: Führe mindestens acht Negativfälle aus: malformed JSON, missing required, bool statt Integer, String statt Integer, ID 0, extra field, unknown tool, unauthorized call.
3. **Permission Review**: Klassifiziere get/create/update/search/delete, entwickle eine Principal/Resource/Scope-Tabelle und zeige eine gefälschte Approval-Anforderung.
4. **Retries**: Wiederhole CREATE mit gleichem Key, dann gleicher Key mit anderem Payload; UPDATE mit veralteter Revision; diskutiere Timeout nach Commit.
5. **Capstone**: Zeichne vollständigen Sequence Flow, Threat Model und ein Architektur-Review, incl. 10-Minuten-Erklärung und produktiven Abweichungen.

**Abgabe**: Eigene Antworten und ausgeführte Ergebnisse in `evidence/`, nicht die Referenzlösung kopieren.
