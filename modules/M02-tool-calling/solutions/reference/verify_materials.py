"""Dependency-free syntax and local Markdown link checks; not a runtime test."""
import ast
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
errors = []
counts = {"markdown": 0, "python": 0, "json": 0}
for path in sorted(ROOT.rglob("*")):
    if any(part in {".venv", "__pycache__"} for part in path.parts):
        continue
    if not path.is_file() or path.suffix not in {".md", ".py", ".json"}:
        continue
    source = path.read_text(encoding="utf-8")
    try:
        if path.suffix == ".py":
            ast.parse(source, filename=str(path))
            counts["python"] += 1
        elif path.suffix == ".json":
            json.loads(source)
            counts["json"] += 1
        else:
            counts["markdown"] += 1
            if source.count("```") % 2:
                errors.append(f"{path}: unbalanced code fences")
            for target in re.findall(r"\]\(([^)]+)\)", source):
                if target.startswith(("https://", "http://", "#")):
                    continue
                local = target.split("#")[0]
                if not (path.parent / local).exists():
                    errors.append(f"{path}: broken local link: {target}")
        for number, line in enumerate(source.splitlines(), 1):
            if line.rstrip() != line:
                errors.append(f"{path}:{number}: trailing whitespace")
    except (SyntaxError, ValueError) as error:
        errors.append(f"{path}: {error}")
print(json.dumps({"counts": counts, "errors": errors}, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
