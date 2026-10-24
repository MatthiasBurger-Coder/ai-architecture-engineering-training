"""Environment-only runtime settings; no absolute user paths."""
from dataclasses import dataclass
from pathlib import Path
import os

@dataclass(frozen=True)
class Settings:
    base_model: str
    dataset_dir: Path
    output_dir: Path
    stage: str
    total_budget_mib: int
    allocator_budget_mib: int
    max_length: int
    max_prompt_length: int
    lora_r: int
    lora_alpha: int
    epochs: float
    learning_rate: float
    accumulation: int
    initial_adapter: str

    @classmethod
    def from_env(cls):
        value = cls(
            base_model=os.getenv("BASE_MODEL", "Qwen/Qwen2.5-Coder-0.5B-Instruct"),
            dataset_dir=Path(os.getenv("DATASET_DIR", "/workspace/datasets")),
            output_dir=Path(os.getenv("OUTPUT_DIR", "/workspace/outputs")),
            stage=os.getenv("TRAIN_STAGE", "sft").strip().lower(),
            total_budget_mib=int(os.getenv("GPU_TOTAL_BUDGET_MIB", "4096")),
            allocator_budget_mib=int(os.getenv("GPU_ALLOCATOR_BUDGET_MIB", "3400")),
            max_length=int(os.getenv("MAX_LENGTH", "256")),
            max_prompt_length=int(os.getenv("MAX_PROMPT_LENGTH", "128")),
            lora_r=int(os.getenv("LORA_R", "4")),
            lora_alpha=int(os.getenv("LORA_ALPHA", "8")),
            epochs=float(os.getenv("EPOCHS", "1")),
            learning_rate=float(os.getenv("LEARNING_RATE", "0.0001")),
            accumulation=int(os.getenv("GRADIENT_ACCUMULATION", "16")),
            initial_adapter=os.getenv("INITIAL_ADAPTER", "").strip(),
        )
        if value.stage not in {"sft", "dpo"}:
            raise ValueError("TRAIN_STAGE must be sft or dpo")
        if not 512 <= value.allocator_budget_mib < value.total_budget_mib <= 4096:
            raise ValueError("Invalid VRAM limits (allocator < total <= 4096 MiB)")
        if not 64 <= value.max_length <= 1024 or not 16 <= value.max_prompt_length < value.max_length:
            raise ValueError("MAX_PROMPT_LENGTH must be < MAX_LENGTH; lengths <=1024")
        if min(value.lora_r, value.lora_alpha, value.epochs, value.learning_rate, value.accumulation) <= 0:
            raise ValueError("All training hyperparameters must be positive")
        return value
