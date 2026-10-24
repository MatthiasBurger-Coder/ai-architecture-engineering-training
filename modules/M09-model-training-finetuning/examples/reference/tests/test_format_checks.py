import unittest
from java_trainer.format_checks import looks_like_java_only

class FormatTests(unittest.TestCase):
    def test_java(self):
        self.assertTrue(looks_like_java_only("public record Id(String value) {}"))
    def test_markdown(self):
        self.assertFalse(looks_like_java_only(chr(96)*3+"java\npublic class A {}"))
    def test_prose(self):
        self.assertFalse(looks_like_java_only("Hier ist der Code:\npublic class A {}"))
