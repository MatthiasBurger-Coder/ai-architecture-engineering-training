"""Offline reference boundary. No SDK, network, shell execution or persistence."""
from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from hashlib import sha256
import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
CATALOG = json.loads((HERE / "catalog.json").read_text(encoding="utf-8"))
ENVELOPE = json.loads((HERE / "envelope.schema.json").read_text(encoding="utf-8"))
RESULT = json.loads((HERE / "result.schema.json").read_text(encoding="utf-8"))

for schema in [ENVELOPE, RESULT] + [
    t[k] for t in CATALOG["tools"].values()
    for k in ("input_schema", "output_schema")
]:
    Draft202012Validator.check_schema(schema)


@dataclass(frozen=True)
class Context:
    # Trusted host data, NEVER parsed from model arguments.
    principal: str
    repositories: frozenset[str]
    permissions: frozenset[str]


class DomainError(Exception):
    """Known errors raised BEFORE any mutation in the fake handlers."""


def fingerprint(name: str, arguments: dict) -> str:
    canonical = json.dumps(
        [name, arguments], sort_keys=True, separators=(",", ":"),
        ensure_ascii=False, allow_nan=False,
    )
    return sha256(canonical.encode("utf-8")).hexdigest()


def no_duplicates(pairs: list[tuple[str, Any]]) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate key")
        result[key] = value
    return result


def reject_constant(value: str) -> None:
    raise ValueError("non-JSON number")


def valid(schema: dict, data: Any) -> bool:
    return Draft202012Validator(schema).is_valid(data)


class Runtime:
    """Sequential, single-process fake. No distributed safety claim."""

    def __init__(self) -> None:
        self.catalog = deepcopy(CATALOG["tools"])
        self.issues = {
            "training/demo": {
                1: {"issue_id": 1, "title": "Healthcheck fehlt", "body": "Demo",
                    "state": "open", "version": 1, "comments": []}
            }
        }
        self.documents = {
            "training/demo": {
                "README.md": ["Healthcheck: GET /health", "Demo, keine Produktion."],
                "ops.md": ["Healthcheck vor Rollout prüfen."]
            }
        }
        self.approvals: set[tuple[str, str]] = set()
        self.journal: dict[tuple, dict] = {}
        self.audit: list[dict] = []
        self.handlers = {
            "get_issue": self.get_issue,
            "search_repository": self.search_repository,
            "create_issue": self.create_issue,
            "update_issue": self.update_issue,
            # Intentionally no destructive handler.
        }

    def approve(self, context: Context, name: str, arguments: dict) -> None:
        """Simulates trusted out-of-band approval; not exposed as a tool."""
        self.approvals.add((context.principal, fingerprint(name, arguments)))

    def finish(self, context: Context, call_id, name, code, data=None,
               disposition="rejected") -> dict:
        result = (
            {"call_id": call_id, "status": "ok", "data": deepcopy(data)}
            if code is None else
            {"call_id": call_id, "status": "error",
             "error": {"code": code, "retryable": False}}
        )
        if not valid(RESULT, result):
            raise AssertionError("internal result contract violated")
        # Deliberately allowlisted metadata: no titles, bodies, credentials.
        self.audit.append({
            "sequence": len(self.audit) + 1, "principal": context.principal,
            "call_id": call_id, "tool": name, "status": result["status"],
            "code": code, "disposition": disposition,
        })
        return result

    def execute(self, raw: str, context: Context) -> dict:
        call_id = name = None

        def fail(code, disposition="rejected"):
            return self.finish(context, call_id, name, code,
                               disposition=disposition)

        try:
            if not isinstance(raw, str) or len(raw.encode("utf-8")) > 16384:
                return fail("INPUT_TOO_LARGE")
            proposal = json.loads(
                raw, object_pairs_hook=no_duplicates, parse_constant=reject_constant
            )
        except (ValueError, UnicodeError, RecursionError):
            return fail("INVALID_JSON")
        if not valid(ENVELOPE, proposal):
            return fail("INVALID_ENVELOPE")
        call_id, name, args = (
            proposal["call_id"], proposal["name"], proposal["arguments"]
        )
        contract = self.catalog.get(name)
        if contract is None:
            return fail("UNKNOWN_TOOL")
        if not valid(contract["input_schema"], args):
            return fail("INVALID_ARGUMENTS")
        if not contract["enabled"]:
            return fail("TOOL_DISABLED")
        if (args["repository"] not in context.repositories
                or contract["permission"] not in context.permissions
                or (contract["privileged"]
                    and "platform:privileged" not in context.permissions)):
            return fail("FORBIDDEN")
        digest = fingerprint(name, args)
        if (contract["approval_required"]
                and (context.principal, digest) not in self.approvals):
            return fail("APPROVAL_REQUIRED")
        journal_key = None
        if contract["effect"] != "READ":
            journal_key = (
                context.principal, args["repository"], name, args["idempotency_key"]
            )
            previous = self.journal.get(journal_key)
            if previous:
                if previous["digest"] != digest:
                    return fail("IDEMPOTENCY_CONFLICT")
                if previous["state"] != "done":
                    return fail("EXECUTION_UNKNOWN", "unknown")
                return self.finish(context, call_id, name, None,
                                   previous["data"], "replayed")
            self.journal[journal_key] = {"digest": digest, "state": "unknown"}
        handler = self.handlers.get(name)
        if handler is None:
            return fail("TOOL_DISABLED")
        try:
            data = handler(args)
        except DomainError as error:
            if journal_key is not None:
                # Fake DomainErrors are guaranteed before mutation.
                self.journal.pop(journal_key)
            return fail(str(error))
        except Exception:
            return fail("EXECUTION_UNKNOWN", "unknown")
        if not valid(contract["output_schema"], data):
            return fail("OUTPUT_INVALID", "unknown")
        if journal_key is not None:
            self.journal[journal_key] = {
                "digest": digest, "state": "done", "data": deepcopy(data)
            }
        return self.finish(context, call_id, name, None, data, "executed")

    def run_batch(self, proposals: list[dict], context: Context) -> list[dict]:
        if not isinstance(proposals, list) or len(proposals) > 4:
            return [self.finish(context, None, None, "BUDGET_EXCEEDED")]
        if not all(valid(ENVELOPE, p) for p in proposals):
            return [self.finish(context, None, None, "INVALID_ENVELOPE")]
        ids = [p["call_id"] for p in proposals]
        if len(set(ids)) != len(ids):
            return [self.finish(context, None, None, "DUPLICATE_CALL_ID")]
        return [self.execute(json.dumps(p), context) for p in proposals]

    def issue(self, args: dict) -> dict:
        try:
            return self.issues[args["repository"]][args["issue_id"]]
        except KeyError:
            raise DomainError("NOT_FOUND") from None

    def get_issue(self, args: dict) -> dict:
        data = deepcopy(self.issue(args))
        if not args.get("include_comments", False):
            data["comments"] = []
        else:
            data["comments"] = data["comments"][:10]
        return data

    def search_repository(self, args: dict) -> dict:
        if args["repository"] not in self.documents:
            raise DomainError("NOT_FOUND")
        matches = []
        for path, lines in sorted(self.documents[args["repository"]].items()):
            for number, line in enumerate(lines, 1):
                if args["query"].casefold() in line.casefold():
                    matches.append({"path": path, "line": number, "text": line[:300]})
        limit = args.get("limit", 5)
        return {"matches": matches[:limit], "truncated": len(matches) > limit}

    def create_issue(self, args: dict) -> dict:
        if args["repository"] not in self.issues:
            raise DomainError("NOT_FOUND")
        issues = self.issues[args["repository"]]
        number = max(issues, default=0) + 1
        data = {"issue_id": number, "title": args["title"], "body": args["body"],
                "state": "open", "version": 1, "comments": []}
        issues[number] = data
        return deepcopy(data)

    def update_issue(self, args: dict) -> dict:
        data = self.issue(args)
        if data["version"] != args["expected_version"]:
            raise DomainError("VERSION_CONFLICT")
        for key in ("title", "state"):
            if key in args:
                data[key] = args[key]
        data["version"] += 1
        return deepcopy(data)
