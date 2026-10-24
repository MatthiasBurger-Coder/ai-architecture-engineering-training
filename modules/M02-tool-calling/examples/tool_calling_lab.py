"""M02 offline tool-calling lab. Python 3.10+, stdlib; not production security."""
import hashlib
import json
import re
from pathlib import Path

CONTRACTS = {t["name"]: t for t in json.loads(Path(__file__).with_name("contracts.json").read_text(encoding="utf-8"))["tools"]}

class Rejected(Exception):
    pass

def check(schema, value):
    t = schema.get("type")
    valid = {"object": type(value) is dict, "string": type(value) is str,
             "integer": type(value) is int, "boolean": type(value) is bool}
    if t not in valid or not valid[t]:
        raise Rejected("SCHEMA_VIOLATION")
    if t == "object":
        props = schema.get("properties", {})
        if any(k not in value for k in schema.get("required", [])):
            raise Rejected("SCHEMA_VIOLATION")
        if schema.get("additionalProperties") is False and any(k not in props for k in value):
            raise Rejected("SCHEMA_VIOLATION")
        for k, v in value.items():
            if k in props:
                check(props[k], v)
    elif t == "integer" and value < schema.get("minimum", value):
        raise Rejected("SCHEMA_VIOLATION")
    elif t == "string":
        if not schema.get("minLength", 0) <= len(value) <= schema.get("maxLength", len(value)):
            raise Rejected("SCHEMA_VIOLATION")
        if "pattern" in schema and not re.fullmatch(schema["pattern"], value):
            raise Rejected("SCHEMA_VIOLATION")

class Gateway:
    def __init__(self):
        self.issues = {1: {"issue_id": 1, "title": "Sample", "revision": 1}}
        self.replays = {}
        self.audit = []

    def call(self, raw, scopes=()):
        name = "unknown"
        try:
            try:
                proposal = json.loads(raw)
            except (ValueError, TypeError):
                raise Rejected("INVALID_JSON")
            if type(proposal) is not dict or set(proposal) != {"name", "arguments"}:
                raise Rejected("SCHEMA_VIOLATION")
            name, args = proposal["name"], proposal["arguments"]
            if type(name) is not str or name not in CONTRACTS:
                raise Rejected("INVALID_TOOL")
            contract = CONTRACTS[name]
            check(contract["input"], args)
            if contract["scope"] not in scopes:
                raise Rejected("PERMISSION_DENIED")
            if contract["permission"] == "DESTRUCTIVE":
                raise Rejected("CONSENT_REQUIRED")  # Never trust model-supplied approval.
            if name == "get_issue":
                issue = self.issues.get(args["issue_id"])
                if not issue:
                    raise Rejected("NOT_FOUND")
                result = {k: issue[k] for k in ("issue_id", "title")}
            elif name == "create_issue":
                key = args["idempotency_key"]
                digest = hashlib.sha256(args["title"].encode()).hexdigest()
                if key in self.replays:
                    old_digest, result = self.replays[key]
                    if digest != old_digest:
                        raise Rejected("IDEMPOTENCY_CONFLICT")
                else:
                    issue_id = max(self.issues) + 1
                    result = {"issue_id": issue_id, "title": args["title"]}
                    self.issues[issue_id] = {**result, "revision": 1}
                    self.replays[key] = (digest, result.copy())
            elif name == "update_issue":
                issue = self.issues.get(args["issue_id"])
                if issue is None:
                    raise Rejected("NOT_FOUND")
                if issue["revision"] != args["expected_revision"]:
                    raise Rejected("REVISION_CONFLICT")
                issue["revision"] += 1
                issue["title"] = args["title"]
                result = dict(issue)
            else:
                raise Rejected("INVALID_TOOL")
            check(contract["output"], result)
            self.audit.append({"tool": name, "outcome": "OK"})
            return {"ok": True, "result": result}
        except Rejected as err:
            self.audit.append({"tool": name, "outcome": str(err)})
            return {"ok": False, "error": {"code": str(err)}}

if __name__ == "__main__":
    g = Gateway()
    for call, scopes in [
        ({"name":"get_issue","arguments":{"issue_id":1}}, {"issue:read"}),
        ({"name":"create_issue","arguments":{"title":"New bug","idempotency_key":"exercise01"}},{"issue:write"}),
        ({"name":"delete_repository","arguments":{"repository":"owner/repo"}},{"repository:delete"}),
    ]:
        print(json.dumps(g.call(json.dumps(call), scopes), ensure_ascii=False))
