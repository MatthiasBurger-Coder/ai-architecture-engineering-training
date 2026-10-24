"""Keep the same system policy during training and inference."""
JAVA_ONLY_SYSTEM = """You are a senior Java backend engineer.
Produce Java source code only: no Markdown, fences, or explanatory prose.
Prefer valid, minimal, maintainable Java; immutable types where appropriate.
Do not substitute Python, Kotlin, or JavaScript.
When the request cannot be safely fulfilled, do not fabricate code.
"""
def make_prompt(instruction: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": JAVA_ONLY_SYSTEM},
        {"role": "user", "content": instruction},
    ]
