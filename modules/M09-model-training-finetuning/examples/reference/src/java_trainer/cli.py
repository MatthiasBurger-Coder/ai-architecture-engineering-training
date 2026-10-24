"""Docker commands: gpu, validate, train, evaluate."""
import argparse
import json
from .config import Settings
from .datasets import validate

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", nargs="?", default="train",
                        choices=("gpu", "validate", "train", "evaluate"))
    args = parser.parse_args()
    cfg = Settings.from_env()
    if args.command == "validate":
        print(json.dumps(validate(cfg.dataset_dir), indent=2, ensure_ascii=False))
    elif args.command == "gpu":
        from .gpu import prepare_gpu, report_gpu
        print(json.dumps(prepare_gpu(cfg.allocator_budget_mib), indent=2))
        print(json.dumps(report_gpu(), indent=2))
    elif args.command == "evaluate":
        from .evaluate import evaluate
        evaluate(cfg)
    else:
        from .training import train
        train(cfg)

if __name__ == "__main__":
    main()
