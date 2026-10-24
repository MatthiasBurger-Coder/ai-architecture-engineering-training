import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "examples"))
from tool_calling_lab import Gateway, CONTRACTS, check

class ContractTests(unittest.TestCase):
    def setUp(self):
        self.g = Gateway()
    def call(self, name, args, scopes=()):
        return self.g.call(json.dumps({"name": name, "arguments": args}), scopes)
    def error(self, name, args, scopes, code):
        self.assertEqual(self.call(name, args, scopes)["error"]["code"], code)
    def test_read(self):
        self.assertTrue(self.call("get_issue", {"issue_id":1}, {"issue:read"})["ok"])
    def test_invalid_json(self):
        self.assertEqual(self.g.call("{")["error"]["code"], "INVALID_JSON")
    def test_unknown_tool(self):
        self.error("missing", {}, (), "INVALID_TOOL")
    def test_missing_required(self):
        self.error("get_issue", {}, {"issue:read"}, "SCHEMA_VIOLATION")
    def test_boolean_is_not_integer(self):
        self.error("get_issue", {"issue_id":True}, {"issue:read"}, "SCHEMA_VIOLATION")
    def test_negative_id(self):
        self.error("get_issue", {"issue_id":0}, {"issue:read"}, "SCHEMA_VIOLATION")
    def test_string_is_not_integer(self):
        self.error("get_issue", {"issue_id":"1"}, {"issue:read"}, "SCHEMA_VIOLATION")
    def test_extra_field(self):
        self.error("get_issue", {"issue_id":1,"admin":True}, {"issue:read"}, "SCHEMA_VIOLATION")
    def test_permission(self):
        self.error("get_issue", {"issue_id":1}, (), "PERMISSION_DENIED")
    def test_destructive(self):
        self.error("delete_repository", {"repository":"owner/repo"}, {"repository:delete"}, "CONSENT_REQUIRED")
    def test_short_title(self):
        self.error("create_issue", {"title":"X","idempotency_key":"training01"}, {"issue:write"}, "SCHEMA_VIOLATION")
    def test_create_replay(self):
        args = {"title":"Test bug","idempotency_key":"training01"}
        a = self.call("create_issue", args, {"issue:write"})
        b = self.call("create_issue", args, {"issue:write"})
        self.assertEqual(a,b)
        self.assertEqual(len(self.g.issues),2)
    def test_key_conflict(self):
        self.call("create_issue", {"title":"First","idempotency_key":"training01"},{"issue:write"})
        self.error("create_issue", {"title":"Other","idempotency_key":"training01"},{"issue:write"}, "IDEMPOTENCY_CONFLICT")
    def test_revision(self):
        self.assertTrue(self.call("update_issue", {"issue_id":1,"title":"Fixed","expected_revision":1},{"issue:write"})["ok"])
        self.error("update_issue", {"issue_id":1,"title":"Other","expected_revision":1},{"issue:write"}, "REVISION_CONFLICT")
    def test_contract_metadata(self):
        for contract in CONTRACTS.values():
            self.assertIn("input", contract)
            self.assertIn("output", contract)
            self.assertIn("permission", contract)
            self.assertIn("scope", contract)

if __name__=="__main__":
    unittest.main()
