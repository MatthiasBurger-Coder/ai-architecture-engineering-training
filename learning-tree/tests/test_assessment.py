import copy
import json
import sys
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from assessment import assess
CAT = json.loads((ROOT/"catalog.json").read_text(encoding="utf-8"))
def evidence(id):
    return {"node_id": id, "catalog_version": CAT["schema_version"],
            "commit_sha": "a"*40, "theory_score": 90, "practical_exercise": True,
            "automated_tests": True, "critical_checks": True,
            "test_command": "python -m unittest", "evidence_paths":["modules/example/evidence/a.md"],
            "review":{"accepted":True,"reviewer":"Independent reviewer","date":"2026-10-24"},
            "decision":"PASSED"}
class AssessmentTests(unittest.TestCase):
    def test_empty(self):
        result = assess(CAT,[])
        self.assertEqual(result["nodes"]["M01"]["status"],"AVAILABLE")
        self.assertEqual(result["nodes"]["M02"]["status"],"LOCKED")
    def test_pass_unlocks(self):
        result = assess(CAT,[evidence("M01")])
        self.assertEqual(result["nodes"]["M01"]["status"],"PASSED")
        self.assertEqual(result["nodes"]["M02"]["status"],"AVAILABLE")
        self.assertEqual(result["nodes"]["M04"]["status"],"AVAILABLE")
    def test_prerequisite_enforced(self):
        self.assertEqual(assess(CAT,[evidence("M02")])["nodes"]["M02"]["status"],"LOCKED")
    def test_missing_review(self):
        x=evidence("M01");x["review"]["accepted"]=False
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
    def test_security_fail(self):
        x=evidence("M01");x["critical_checks"]=False
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
    def test_below_threshold(self):
        x=evidence("M01");x["theory_score"]=84
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
    def test_bool_not_grade(self):
        x=evidence("M01");x["theory_score"]=True
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
    def test_duplicate(self):
        self.assertFalse(assess(CAT,[evidence("M01"),evidence("M01")])["valid"])
    def test_unknown(self):
        self.assertFalse(assess(CAT,[evidence("M99")])["valid"])
    def test_plan_not_pass(self):
        self.assertEqual(assess(CAT,[evidence("S-INFER"),evidence("M01")])["nodes"]["S-INFER"]["status"],"PLANNED")
    def test_missing_tests(self):
        x=evidence("M01");x["automated_tests"]=False
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
    def test_empty_evidence(self):
        x=evidence("M01");x["evidence_paths"]=[]
        self.assertEqual(assess(CAT,[x])["nodes"]["M01"]["status"],"BLOCKED")
if __name__ == "__main__": unittest.main()
