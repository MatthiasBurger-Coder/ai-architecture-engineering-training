"""Allocator guard and telemetry; neither is a hardware VRAM quota."""
import subprocess
import torch
from transformers import TrainerCallback

def prepare_gpu(budget_mib: int):
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA unavailable. Test Docker --gpus all before training.")
    properties = torch.cuda.get_device_properties(0)
    total = properties.total_memory / 1048576
    if not 0 < budget_mib < total:
        raise ValueError("Allocator budget must be below physical GPU capacity")
    torch.cuda.set_per_process_memory_fraction(budget_mib / total, device=0)
    return {"gpu": properties.name, "capacity_mib": round(total),
            "allocator_budget_mib": budget_mib,
            "warning": "Allocator-only limit; external peak GPU usage must still be measured."}

def report_gpu():
    if not torch.cuda.is_available():
        return {"cuda_available": False}
    data = {"cuda_available": True, "gpu": torch.cuda.get_device_name(0),
            "reserved_mib": round(torch.cuda.memory_reserved() / 1048576),
            "peak_reserved_mib": round(torch.cuda.max_memory_reserved() / 1048576)}
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            check=True, capture_output=True, text=True, timeout=5,
        )
        data["gpu_total_used_mib"] = int(result.stdout.splitlines()[0].strip())
    except (OSError, ValueError, IndexError, subprocess.SubprocessError):
        data["gpu_total_used_mib"] = None
    return data

class GpuTelemetry(TrainerCallback):
    def __init__(self, budget_mib: int):
        self.budget_mib = budget_mib
    def on_log(self, args, state, control, logs=None, **kwargs):
        snapshot = report_gpu()
        print(f"Step {state.global_step} GPU: {snapshot}", flush=True)
        if snapshot.get("reserved_mib", 0) > self.budget_mib:
            raise RuntimeError("Reserved allocator memory exceeded configured budget")
