"""Create a new daily JSONL file, never overwrite previous training examples."""
import argparse
from datetime import date
from pathlib import Path

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--stage", choices=("sft", "dpo"), default="sft")
    p.add_argument("--topic", default="java")
    p.add_argument("--root", default="datasets")
    args = p.parse_args()
    topic = "".join(x if x.isalnum() or x in "-_" else "-" for x in args.topic.lower()).strip("-") or "java"
    path = Path(args.root) / args.stage / f"{date.today().isoformat()}-{topic}.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        print("Already exists (unchanged):", path)
    else:
        path.touch(exist_ok=False)
        print("Created:", path)
    print("Add JSON objects, one per line; the empty file is skipped by the loader.")

if __name__ == "__main__":
    main()
