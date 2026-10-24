"""Deterministic catalog integrity validator; not an assessment engine."""
from __future__ import annotations
import json
from pathlib import Path

def validate(data: dict) -> list[str]:
    errors=[]
    nodes=data.get("nodes",[])
    if not isinstance(nodes,list) or not nodes:
        return ["nodes must be a nonempty list"]
    ids=[n.get("id") for n in nodes]
    if len(ids)!=len(set(ids)):
        errors.append("duplicate node ids")
    names=set(ids)
    for n in nodes:
        node=n.get("id")
        required=n.get("requires",[])
        if not isinstance(required,list):
            errors.append(f"{node}: requires must be a list")
            continue
        for dep in required:
            if dep not in names:
                errors.append(f"{node}: missing prerequisite {dep}")
            if dep==node:
                errors.append(f"{node}: self dependency")
        g=n.get("gate",{})
        if set(g.get("required",[])) != {"theory_assessment","practical_exercise","automated_tests","architecture_review"}:
            errors.append(f"{node}: incomplete gate")
        if not (0<=g.get("min_theory_score",-1)<=100):
            errors.append(f"{node}: invalid theory threshold")
        if g.get("critical_checks_must_pass") is not True or g.get("review_required") is not True:
            errors.append(f"{node}: critical checks and review are mandatory")
        if n.get("kind")=="specialization" and n.get("implementation_status")=="planned" and n.get("path") is not None:
            errors.append(f"{node}: planned specialization path must be null")
    graph={n["id"]:n.get("requires",[]) for n in nodes if isinstance(n.get("id"),str) and isinstance(n.get("requires"),list)}
    visiting=set(); visited=set()
    def dfs(node):
        if node in visiting:
            errors.append(f"dependency cycle at {node}")
            return
        if node in visited:
            return
        visiting.add(node)
        for dep in graph.get(node,[]):
            if dep in graph: dfs(dep)
        visiting.remove(node); visited.add(node)
    for node in graph: dfs(node)
    return errors

if __name__=="__main__":
    catalog=json.loads(Path(__file__).with_name("catalog.json").read_text(encoding="utf-8"))
    problems=validate(catalog)
    if problems:
        for p in problems: print("ERROR:",p)
        raise SystemExit(1)
    print(f"VALID: {len(catalog['nodes'])} nodes; no invalid references or cycles")
