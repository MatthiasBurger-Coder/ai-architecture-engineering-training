"""Deterministic walkthrough; all mutations stay in memory."""
import json
from runtime import Context, Runtime

runtime = Runtime()
context = Context("learner", frozenset({"training/demo"}),
                  frozenset({"issues:read", "issues:write", "repository:read"}))
args = {"repository": "training/demo", "title": "Healthcheck ergänzen",
        "body": "Nur lokale Demo", "idempotency_key": "demo-op-001"}

def call(call_id, name, arguments):
    result = runtime.execute(json.dumps({
        "call_id": call_id, "name": name, "arguments": arguments
    }), context)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))

call("c-1", "get_issue", {"repository": "training/demo", "issue_id": 1})
call("c-2", "create_issue", args)  # APPROVAL_REQUIRED
runtime.approve(context, "create_issue", args)
call("c-3", "create_issue", args)  # Creates issue 2.
call("c-4", "create_issue", args)  # Same issue 2; new call ID.
call("c-5", "search_repository",
     {"repository": "training/demo", "query": "Healthcheck", "limit": 1})
update = {"repository": "training/demo", "issue_id": 1,
          "expected_version": 1, "state": "closed",
          "idempotency_key": "demo-update-001"}
runtime.approve(context, "update_issue", update)
call("c-6", "update_issue", update)
stale = {**update, "idempotency_key": "demo-update-002"}
runtime.approve(context, "update_issue", stale)
call("c-7", "update_issue", stale)  # VERSION_CONFLICT
call("c-8", "delete_repository",
     {"repository": "training/demo", "reason": "Demo"})
print("issue_count=" + str(len(runtime.issues["training/demo"])))
print("issue_1_version=" + str(runtime.issues["training/demo"][1]["version"]))
print("audit=" + json.dumps(runtime.audit, sort_keys=True))
