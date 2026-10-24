# syntax=docker/dockerfile:1
# CUDA userspace in image; NVIDIA Windows driver remains on the WSL2 host.
FROM nvidia/cuda:12.6.3-cudnn-runtime-ubuntu22.04
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 HF_HOME=/hf-cache PYTHONPATH=/workspace/src \
    PATH=/opt/venv/bin:$PATH
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv git curl ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/venv && \
    pip install --upgrade pip setuptools wheel && \
    pip install --index-url https://download.pytorch.org/whl/cu126 torch==2.7.1
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
WORKDIR /workspace
COPY src/ /workspace/src/
ENTRYPOINT ["python", "-m", "java_trainer.cli"]
CMD ["train"]
