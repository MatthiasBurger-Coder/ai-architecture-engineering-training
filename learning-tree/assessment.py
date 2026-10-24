"""Fail-closed assessment of supplied evidence records; stdlib only.

This validates machine-readable claims and review attestations; it cannot establish
the authenticity of a reviewer or that a test was actually executed.
"""
import json
import re
from pathlib import Path

SHA = re.compile(r"^[0-9a-f]{40}$")
DECISIONS = {"PASSED", "BLOCKED", "SUBMITTED"}

def assess(catalog, records):
    if not isinstance(records, list):
        raise ValueError("records must be a list")
    nodes = {n["id"]: n for n in catalog["nodes"]}
    by_id = {}
    errors = []
    for record in records:
        if not isinstance(record, dict) or not isinstance(record.get("node_id"), str):
            errors.append("invalid record")
            continue
        key = record["node_id"]
        if key in by_id:
            errors.append(f"duplicate record for {key}")
        if key not in nodes:
            errors.append(f"unknown node {key}")
        by_id[key] = record
    if errors:
        return {"valid": False, "errors": errors, "nodes": {}}
    passed = set()
    # Evaluate declared evidence; prerequisite resolution happens in a separate pass.
    eligible = {}
    for key, node in nodes.items():
        rec = by_id.get(key)
        checks = []
        if rec is not None:
            gate = node["gate"]
            checks = [
                rec.get("catalog_version") == catalog["schema_version"],
                isinstance(rec.get("commit_sha"), str) and SHA.fullmatch(rec["commit_sha"]) is not None,
                isinstance(rec.get("theory_score"), (int, float)) and not isinstance(rec.get("theory_score"), bool)
                    and gate["min_theory_score"] <= rec["theory_score"] <= 100,
                rec.get("practical_exercise") is True,
                rec.get("automated_tests") is True,
                rec.get("critical_checks") is True,
                isinstance(rec.get("test_command"), str) and bool(rec["test_command"].strip()),
                isinstance(rec.get("evidence_paths"), list) and len(rec["evidence_paths"]) > 0
                    and all(isinstance(x,str) and x.startswith("modules/") and ".." not in x.split("/") for x in rec["evidence_paths"]),
                isinstance(rec.get("review"), dict) and rec["review"].get("accepted") is True
                    and isinstance(rec["review"].get("reviewer"), str) and bool(rec["review"]["reviewer"].strip())
                    and isinstance(rec["review"].get("date"), str) and bool(rec["review"]["date"].strip()),
                rec.get("decision") == "PASSED",
            ]
        eligible[key] = bool(checks) and all(checks)
    # Topological fixed point: no unlocking without accepted prerequisite records.
    changed = True
    while changed:
        before = len(passed)
        passed.update(k for k,n in nodes.items() if eligible[k] and all(dep in passed for dep in n["requires"]) and n.get("implementation_status") != "planned")
        changed = len(passed) != before
    result = {}
    for key,node in nodes.items():
        deps = node["requires"]
        missing = [d for d in deps if d not in passed]
        if node.get("implementation_status") == "planned":
            status = "PLANNED"
        elif key in passed:
            status = "PASSED"
        elif missing:
            status = "LOCKED"
        elif key in by_id:
            status = "BLOCKED"
        else:
            status = "AVAILABLE"
        result[key] = {"status": status, "missing_prerequisites": missing, "gate_claim_accepted": eligible[key]}
    return {"valid": True, "errors": [], "nodes": result}

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--records", required=True, type=Path)
    args = ap.parse_args()
    root = Path(__file__).resolve().parent
    catalog = json.loads((root/"catalog.json").read_text(encoding="utf-8"))
    records = json.loads(args.records.read_text(encoding="utf-8"))
    result = assess(catalog, records)
    print(json.dumps(result, indent=2))
    if not result["valid"] or any(x["status"] == "BLOCKED" for x in result["nodes"].values()):
        raise SystemExit(1)
