"""Kleines, reproduzierbares Labor für M01.

Keine externe Bibliothek, keine Modellabfrage und keine Behauptung von
Produktionsnähe. Jede Funktion ist absichtlich klein genug, um sie per Hand
zu prüfen.
"""

from __future__ import annotations

import math
import random
from typing import Iterable


VOCAB = ["<bos>", "deploy", "service", "restart", "status", "now"]
EMBEDDINGS = {
    "deploy": (1.0, 0.0),
    "service": (0.8, 0.2),
    "restart": (0.0, 1.0),
    "status": (0.2, 0.8),
    "now": (0.5, 0.5),
}


def tokenize(text: str) -> list[str]:
    """Toy-Tokenizer: whitespace split, damit die Grenze sichtbar bleibt."""
    return [part.lower() for part in text.split()]


def softmax(logits: Iterable[float], temperature: float = 1.0) -> list[float]:
    values = list(logits)
    if temperature <= 0:
        raise ValueError("temperature must be > 0")
    scaled = [value / temperature for value in values]
    maximum = max(scaled)
    exps = [math.exp(value - maximum) for value in scaled]
    total = sum(exps)
    return [value / total for value in exps]


def attention(query: list[float], keys: list[list[float]], values: list[list[float]]) -> tuple[list[float], list[float]]:
    """Eine einzelne Query über mehrere Keys/Values."""
    dimension = len(query)
    scores = [sum(q * k for q, k in zip(query, key)) / math.sqrt(dimension) for key in keys]
    weights = softmax(scores)
    result = [sum(weight * value[index] for weight, value in zip(weights, values)) for index in range(len(values[0]))]
    return weights, result


def filter_top_k(probabilities: list[float], k: int) -> list[float]:
    if not 1 <= k <= len(probabilities):
        raise ValueError("k must be within the probability vector")
    keep = set(sorted(range(len(probabilities)), key=probabilities.__getitem__, reverse=True)[:k])
    filtered = [probability if index in keep else 0.0 for index, probability in enumerate(probabilities)]
    total = sum(filtered)
    return [probability / total for probability in filtered]


def filter_top_p(probabilities: list[float], p: float) -> list[float]:
    if not 0 < p <= 1:
        raise ValueError("p must be in (0, 1]")
    order = sorted(range(len(probabilities)), key=probabilities.__getitem__, reverse=True)
    keep: set[int] = set()
    cumulative = 0.0
    for index in order:
        keep.add(index)
        cumulative += probabilities[index]
        if cumulative >= p:
            break
    filtered = [probability if index in keep else 0.0 for index, probability in enumerate(probabilities)]
    total = sum(filtered)
    return [probability / total for probability in filtered]


def sample(labels: list[str], probabilities: list[float], seed: int) -> str:
    return random.Random(seed).choices(labels, weights=probabilities, k=1)[0]


def main() -> None:
    text = "deploy service now"
    tokens = tokenize(text)
    print("tokens:", tokens)
    print("embedding(service):", EMBEDDINGS["service"])

    query = [1.0, 0.0]
    keys = [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]
    values = [[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]]
    weights, result = attention(query, keys, values)
    print("attention weights:", [round(value, 4) for value in weights])
    print("attention result:", [round(value, 4) for value in result])

    labels = VOCAB[1:]
    logits = [2.4, 1.4, 0.7, 0.1, -0.4]
    for temperature in (0.5, 1.0, 1.8):
        probabilities = softmax(logits, temperature)
        print(f"temperature={temperature}:", [round(value, 4) for value in probabilities])
    base = softmax(logits)
    print("top-k=2:", [round(value, 4) for value in filter_top_k(base, 2)])
    print("top-p=0.80:", [round(value, 4) for value in filter_top_p(base, 0.80)])
    print("seeded samples:", [sample(labels, base, seed) for seed in range(5)])


if __name__ == "__main__":
    main()
