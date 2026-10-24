"""Multiple deterministic JSONL files, duplicate detection and held-out leakage checks."""
import hashlib
import json
from pathlib import Path

REQUIRED = {
    "sft": {"instruction", "response"},
    "dpo": {"instruction", "chosen", "rejected"},
    "eval": {"instruction"},
}

def read_rows(root: Path, split: str, *, allow_empty: bool = False):
    if split not in REQUIRED:
        raise ValueError(f"Unknown split {split}")
    folder = root / split
    files = sorted(folder.rglob("*.jsonl")) if folder.is_dir() else []
    if not files and not allow_empty:
        raise ValueError(f"No JSONL files in {folder}")
    rows, seen = [], set()
    for filename in files:
        with filename.open(encoding="utf-8") as stream:
            for line_no, line in enumerate(stream, 1):
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"{filename}:{line_no}: invalid JSON: {exc}") from exc
                if not isinstance(row, dict) or not REQUIRED[split].issubset(row):
                    raise ValueError(f"{filename}:{line_no}: required {sorted(REQUIRED[split])}")
                if any(not isinstance(row[k], str) or not row[k].strip() for k in REQUIRED[split]):
                    raise ValueError(f"{filename}:{line_no}: empty/non-string mandatory field")
                if split == "dpo" and row["chosen"].strip() == row["rejected"].strip():
                    raise ValueError(f"{filename}:{line_no}: same chosen/rejected")
                text = row.get("response", row.get("chosen", ""))
                if ""+chr(96)*3 in text:
                    raise ValueError(f"{filename}:{line_no}: preferred response contains Markdown fences")
                key = json.dumps({k: row[k] for k in sorted(REQUIRED[split])}, ensure_ascii=False, sort_keys=True)
                digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
                if digest in seen:
                    raise ValueError(f"{filename}:{line_no}: duplicate {split} record")
                seen.add(digest)
                rows.append(row)
    if not rows and not allow_empty:
        raise ValueError(f"No records in {folder}")
    return rows, files

def dataset_sha256(rows: list[dict]) -> str:
    canonical = "\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

def validate(root: Path):
    result = {}
    for split in ("sft", "dpo", "eval"):
        rows, files = read_rows(root, split, allow_empty=True)
        result[split] = {
            "files": [str(p.relative_to(root)) for p in files],
            "records": len(rows),
            "sha256": dataset_sha256(rows),
        }
    held, _ = read_rows(root, "eval", allow_empty=True)
    eval_prompts = {x["instruction"].strip().casefold() for x in held}
    for split in ("sft", "dpo"):
        train, _ = read_rows(root, split, allow_empty=True)
        if any(r["instruction"].strip().casefold() in eval_prompts for r in train):
            raise ValueError(f"Evaluation leakage into {split}")
    if not result["sft"]["records"]:
        raise ValueError("SFT data missing")
    return result
