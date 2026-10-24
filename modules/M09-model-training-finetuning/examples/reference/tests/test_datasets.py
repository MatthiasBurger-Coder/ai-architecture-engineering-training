import json
from pathlib import Path
import tempfile
import unittest
from java_trainer.datasets import read_rows, validate

class DatasetTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        for split in ("sft", "dpo", "eval"):
            (self.root / split).mkdir()

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, split, name, rows):
        (self.root / split / name).write_text(
            "".join(json.dumps(r)+"\n" for r in rows), encoding="utf-8"
        )

    def test_sort(self):
        self.write("sft", "z.jsonl", [{"instruction":"z","response":"public class Z {}"}])
        self.write("sft", "a.jsonl", [{"instruction":"a","response":"public class A {}"}])
        self.assertEqual([p.name for p in read_rows(self.root, "sft")[1]], ["a.jsonl","z.jsonl"])

    def test_duplicate(self):
        x = {"instruction":"a","response":"public class A {}"}
        self.write("sft", "a.jsonl", [x,x])
        with self.assertRaisesRegex(ValueError, "duplicate"):
            validate(self.root)

    def test_dpo_equal(self):
        self.write("dpo", "a.jsonl", [{"instruction":"a","chosen":"public A{}","rejected":"public A{}"}])
        with self.assertRaisesRegex(ValueError, "same chosen"):
            read_rows(self.root, "dpo")

    def test_holdout_leak(self):
        self.write("sft", "a.jsonl", [{"instruction":"a","response":"public class A {}"}])
        self.write("eval", "e.jsonl", [{"instruction":"a"}])
        with self.assertRaisesRegex(ValueError, "leakage"):
            validate(self.root)

    def test_empty_file_allowed(self):
        self.write("sft", "a.jsonl", [{"instruction":"a","response":"public class A {}"}])
        (self.root / "sft" / "today.jsonl").touch()
        self.assertEqual(validate(self.root)["sft"]["records"], 1)
