"""QLoRA SFT by default; optional low-memory DPO experiment."""
from datetime import datetime, timezone
import json
from pathlib import Path

import torch
from datasets import Dataset
from peft import LoraConfig, PeftModel, prepare_model_for_kbit_training
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer, DPOConfig, DPOTrainer

from .config import Settings
from .datasets import read_rows, validate, dataset_sha256
from .gpu import GpuTelemetry, prepare_gpu, report_gpu
from .prompts import make_prompt

def load_base(cfg: Settings):
    tokenizer = AutoTokenizer.from_pretrained(cfg.base_model, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    q = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                           bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16)
    model = AutoModelForCausalLM.from_pretrained(
        cfg.base_model, quantization_config=q, device_map={"": 0},
        torch_dtype=torch.float16, low_cpu_mem_usage=True,
    )
    model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)
    return model, tokenizer

def train(cfg: Settings):
    validate(cfg.dataset_dir)
    rows, files = read_rows(cfg.dataset_dir, cfg.stage)
    if cfg.initial_adapter and cfg.stage == "sft":
        raise ValueError("INITIAL_ADAPTER is supported only for DPO")
    print("Training input files:", *map(str, files), sep="\n  ", flush=True)
    gpu_info = prepare_gpu(cfg.allocator_budget_mib)
    print("GPU preflight:", gpu_info, flush=True)
    model, tokenizer = load_base(cfg)
    prepared = []
    for row in rows:
        entry = {"prompt": make_prompt(row["instruction"])}
        if cfg.stage == "sft":
            entry["completion"] = [{"role": "assistant", "content": row["response"]}]
        else:
            for kind in ("chosen", "rejected"):
                entry[kind] = [{"role": "assistant", "content": row[kind]}]
        prepared.append(entry)
    for number, entry in enumerate(prepared, 1):
        prompt_tokens = len(tokenizer.apply_chat_template(
            entry["prompt"], tokenize=True, add_generation_prompt=True
        ))
        if cfg.stage == "dpo" and prompt_tokens > cfg.max_prompt_length:
            raise ValueError(f"Prompt #{number} exceeds MAX_PROMPT_LENGTH")
        for name in (("completion",) if cfg.stage == "sft" else ("chosen", "rejected")):
            size = len(tokenizer.apply_chat_template(entry["prompt"]+entry[name], tokenize=True))
            if size > cfg.max_length:
                raise ValueError(f"{cfg.stage} #{number}/{name}: {size} > MAX_LENGTH={cfg.max_length}")
    dataset = Dataset.from_list(prepared)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output = cfg.output_dir / (stamp + "-" + cfg.stage)
    count = 1
    while output.exists():
        output = cfg.output_dir / f"{stamp}-{cfg.stage}-{count}"
        count += 1
    output.mkdir(parents=True)
    common = dict(output_dir=str(output), per_device_train_batch_size=1,
                  gradient_accumulation_steps=cfg.accumulation, num_train_epochs=cfg.epochs,
                  learning_rate=cfg.learning_rate, fp16=True, bf16=False,
                  gradient_checkpointing=True,
                  gradient_checkpointing_kwargs={"use_reentrant": False},
                  optim="paged_adamw_8bit", report_to="none", logging_steps=1,
                  save_strategy="no", dataloader_num_workers=0, remove_unused_columns=False)
    lora = LoraConfig(r=cfg.lora_r, lora_alpha=cfg.lora_alpha, lora_dropout=0.05,
                      target_modules=["q_proj", "v_proj"], bias="none", task_type="CAUSAL_LM")
    callbacks = [GpuTelemetry(cfg.allocator_budget_mib)]
    if cfg.stage == "sft":
        args = SFTConfig(max_length=cfg.max_length, completion_only_loss=True, packing=False, **common)
        trainer = SFTTrainer(model=model, args=args, train_dataset=dataset,
                             processing_class=tokenizer, peft_config=lora, callbacks=callbacks)
    else:
        if cfg.initial_adapter:
            path = Path(cfg.initial_adapter)
            manifest = path / "adapter_config.json"
            if not manifest.is_file():
                raise ValueError(f"Missing adapter_config.json: {path}")
            if json.loads(manifest.read_text(encoding="utf-8")).get("base_model_name_or_path") != cfg.base_model:
                raise ValueError("Adapter base model is not BASE_MODEL")
            model = PeftModel.from_pretrained(model, str(path), adapter_name="train", is_trainable=True)
            model.load_adapter(str(path), adapter_name="reference", is_trainable=False)
            args = DPOConfig(max_length=cfg.max_length, max_prompt_length=cfg.max_prompt_length,
                             precompute_ref_log_probs=True, model_adapter_name="train",
                             ref_adapter_name="reference", **common)
            trainer = DPOTrainer(model=model, ref_model=None, args=args, train_dataset=dataset,
                                 processing_class=tokenizer, callbacks=callbacks)
        else:
            args = DPOConfig(max_length=cfg.max_length, max_prompt_length=cfg.max_prompt_length,
                             precompute_ref_log_probs=True, **common)
            trainer = DPOTrainer(model=model, ref_model=None, args=args, train_dataset=dataset,
                                 processing_class=tokenizer, peft_config=lora, callbacks=callbacks)
    metrics = trainer.train().metrics
    trainer.save_model(str(output))
    tokenizer.save_pretrained(str(output))
    (output/"training-manifest.json").write_text(json.dumps({
        "stage": cfg.stage, "base_model": cfg.base_model, "source_adapter": cfg.initial_adapter or None,
        "files": [str(p.relative_to(cfg.dataset_dir)) for p in files],
        "dataset_sha256": dataset_sha256(rows), "records": len(rows), "limits": gpu_info,
        "end_gpu": report_gpu(), "metrics": metrics,
        "warning": "External measured peak VRAM and independent Java eval still required",
    }, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(f"Saved adapter: {output}", flush=True)
