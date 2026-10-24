# Assessment Engine v0.2

Run:
```bash
python learning-tree/validate.py
python -m unittest discover -s learning-tree/tests -v
python learning-tree/assessment.py --records learning-tree/records.example.json
```

The empty example produces M01 AVAILABLE and downstream nodes LOCKED, not false passes.

## Input record
Each assessment contains node_id, catalog_version, commit_sha, theory_score,
practical_exercise (boolean), automated_tests (boolean), critical_checks
(boolean), test_command, evidence_paths, review (accepted, reviewer, date),
decision=PASSED. The engine rejects incomplete or invalid claims, unknown
nodes and duplicates. Dependencies are enforced; planned specializations cannot
be marked PASSED.

## Security / scope
Records are **claims**, not cryptographic proofs. A person who can edit JSON
can forge a passing record. Therefore v0.2 is suitable as a *local deterministic
decision prototype*, not as a trusted certification or production approval
system. Future v0.3 work: GitHub Actions run attestation, immutable artifact
digests, reviewer identity verification, signed decisions, provenance checks,
revocation, anti-replay and file-presence/content validation.

Never publish real candidate data, secrets or sensitive records as test fixtures.
