import copy
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from validate import validate

BASE=json.loads((Path(__file__).resolve().parents[1]/"catalog.json").read_text(encoding="utf-8"))

class CatalogTests(unittest.TestCase):
    def test_valid_catalog(self): self.assertEqual(validate(BASE),[])
    def test_duplicate_ids(self):
        d=copy.deepcopy(BASE);d["nodes"].append(copy.deepcopy(d["nodes"][0]))
        self.assertTrue(any("duplicate" in x for x in validate(d)))
    def test_unknown_dependency(self):
        d=copy.deepcopy(BASE);d["nodes"][0]["requires"]=["GHOST"]
        self.assertTrue(any("missing prerequisite" in x for x in validate(d)))
    def test_cycle(self):
        d=copy.deepcopy(BASE);d["nodes"][0]["requires"]=["M02"]
        self.assertTrue(any("cycle" in x for x in validate(d)))
    def test_missing_gate(self):
        d=copy.deepcopy(BASE);d["nodes"][0]["gate"]["required"]=[]
        self.assertTrue(any("incomplete gate" in x for x in validate(d)))
    def test_no_critical_bypass(self):
        d=copy.deepcopy(BASE);d["nodes"][0]["gate"]["critical_checks_must_pass"]=False
        self.assertTrue(any("critical checks" in x for x in validate(d)))

if __name__=="__main__": unittest.main()
