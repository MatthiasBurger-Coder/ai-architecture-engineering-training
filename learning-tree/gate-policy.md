# Learning Gate Policy v0.1

A node becomes PASSED only after prerequisite nodes have passed and the following checks are complete:

1. Theory examination at or above 85/100.
2. Practical implementation and recorded evidence.
3. Automated tests pass, including every critical security check.
4. Independent architecture review accepts the result.

Statuses: locked, available, in_progress, submitted, blocked, passed.

Record the module ID, catalog version, source commit, test commands, actual results, evidence paths, reviewer and decision. Missing evidence blocks a pass. Prior expertise can be accepted through an equivalent independent assessment, not by skipping criteria.

The catalog validator checks structural consistency only. It does not grade learners, verify evidence, or issue credentials. The example progress file is illustrative and not a record of actual learning.
