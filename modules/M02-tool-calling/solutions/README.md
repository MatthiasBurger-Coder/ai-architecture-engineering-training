# M02 Referenzlösungen

**Erst nach Bearbeitung der Übungen lesen.**

1. **Contracts**: `examples/contracts.json` enthält get_issue (READ, issue:read), create_issue (WRITE, issue:write, idempotency_key) und update_issue (WRITE, expected_revision). Schema-Validität allein ist nicht Autorisierung.
2. **Negativfälle**: ungültiges JSON → INVALID_JSON; unbekanntes Tool → INVALID_TOOL; Typ-/Required-/Extra-/Rangefehler → SCHEMA_VIOLATION; Scope fehlt → PERMISSION_DENIED.
3. **Permissions**: get/search → READ; create/update → WRITE; delete_repository → DESTRUCTIVE. Eigenständige authentifizierte Zustimmung ist notwendig; `approved:true` im Modell-Text reicht nie.
4. **Retry**: derselbe Key/Payload liefert dieselbe Issue-ID, anderer Payload → IDEMPOTENCY_CONFLICT. Stale expected_revision → REVISION_CONFLICT.
5. **Architektur**: Modell als Proposal-Adapter, deterministische Ports für Schema/Policy/Executor/Audit. Prompt Injection und Tool Results bleiben untrusted.

**Produktionslücken bewusst**: Labor prüft nur benötigte Schema-Teilmenge; keine Tenant-ACL, persistente Transaktion, signierte Approval, vollständigen JSON-Schema-Validator oder echtes Audit-System.
