"""Format heuristic; not javac or JUnit."""
import re

JAVA = re.compile(r"\b(?:class|interface|record|enum|package|import|public|private|protected)\b")
PROSE = re.compile(r"(?im)^\s*(?:hier ist|here is|erklärung:|explanation:|dieser code|the code|#+\s)")

def looks_like_java_only(output: str) -> bool:
    return bool(JAVA.search(output)) and not bool(PROSE.search(output)) and chr(96)*3 not in output
