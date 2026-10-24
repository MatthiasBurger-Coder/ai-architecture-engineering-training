"""Held-out Java-format evaluation: heuristic only."""
from datetime import datetime, timezone
import json
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel
from .config import Settings
from .datasets import read_rows
from .gpu import prepare_gpu, report_gpu
from .prompts import make_prompt
from .format_checks import looks_like_java_only

def evaluate(cfg: Settings):
    data, files = read_rows(cfg.dataset_dir, "eval")
    prepare_gpu(cfg.allocator_budget_mib)
    tokenizer = AutoTokenizer.from_pretrained(cfg.base_model, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    q = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                           bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16)
    model = AutoModelForCausalLM.from_pretrained(
        cfg.base_model, quantization_config=q, device_map={"": 0},
        torch_dtype=torch.float16, low_cpu_mem_usage=True,
    )
    if cfg.initial_adapter:
        p = Path(cfg.initial_adapter)
        info = p / "adapter_config.json"
        if not info.is_file():
            raise ValueError(f"Invalid adapter: {p}")
        if json.loads(info.read_text(encoding="utf-8")).get("base_model_name_or_path") != cfg.base_model:
            raise ValueError("Wrong adapter base model")
        model = PeftModel.from_pretrained(model, str(p), is_trainable=False)
    model.eval()
    outputs = []
    for row in data:
        ids = tokenizer.apply_chat_template(
            make_prompt(row["instruction"]), add_generation_prompt=True, return_tensors="pt"
        ).to(model.device)
        if ids.shape[-1] >= cfg.max_length:
            raise ValueError("Eval instruction exceeds MAX_LENGTH")
        with torch.inference_mode():
            output = model.generate(input_ids=ids, max_new_tokens=128, do_sample=False,
                                    pad_token_id=tokenizer.eos_token_id)
        text = tokenizer.decode(output[0][ids.shape[-1]:], skip_special_tokens=True).strip()
        outputs.append({"instruction": row["instruction"], "response": text,
                        "java_only_heuristic": looks_like_java_only(text)})
    cfg.output_dir.mkdir(exist_ok=True, parents=True)
    suffix = "adapter" if cfg.initial_adapter else "baseline"
    dest = cfg.output_dir / (datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")+f"-eval-{suffix}.json")
    report = {"base_model": cfg.base_model, "adapter": cfg.initial_adapter or None,
              "heldout_files": list(map(str, files)), "n": len(outputs),
              "java_only_heuristic_rate": sum(int(x["java_only_heuristic"]) for x in outputs)/len(outputs),
              "outputs": outputs, "gpu": report_gpu(),
              "warning": "Heuristic only: compilation and JUnit tests not executed"}
    dest.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Evaluation written:", dest)
