// Specification example consistency only. This is not a runtime input validator.
import assert from 'node:assert/strict';
import * as f from '../src/app/contracts.fixtures.ts';

assert.equal(f.sameRepository.trainings[0].content.repository.name,
  f.sameRepository.trainings[0].questions.repository.name);
assert.notEqual(f.separateRepositories.trainings[0].content.repository.name,
  f.separateRepositories.trainings[0].questions.repository.name);
assert.equal(f.dataset.attempts.length, 3);
assert.equal(new Set(f.dataset.attempts.map(a => a.id)).size, 3);
for (const a of f.dataset.attempts) {
  const q = a.questions.snapshot;
  assert.equal(a.trainingId, q.trainingId);
  assert.match(a.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(a.questions.provenance.commit, /^[0-9a-f]{40}$/);
  assert.equal(new Set(q.questions.map(q => q.id)).size, q.questions.length);
  assert.equal(new Set(a.answers.map(a => a.questionId)).size, q.questions.length);
  assert.equal(a.answers.length, q.questions.length);
  const earned = q.questions.filter(q => {
    const answer = a.answers.find(a => a.questionId === q.id);
    assert.ok(answer && q.options.some(o => o.id === answer.optionId));
    assert.ok(q.options.some(o => o.id === q.correctOptionId));
    return answer.optionId === q.correctOptionId;
  }).length;
  assert.deepEqual(a.score, {
    earned, possible: q.questions.length, required: Math.ceil(3 * q.questions.length / 4),
    passed: 4 * earned >= 3 * q.questions.length,
  });
  assert.ok(Date.parse(a.startedAt) <= Date.parse(a.completedAt));
}
assert.equal(f.inFlightUpdate.started.snapshot.version, 1);
assert.equal(f.inFlightUpdate.refreshed.snapshot.version, 2);
assert.equal(f.inFlightUpdate.expectedCompletionSnapshot.snapshot.version, 1);
assert.deepEqual(JSON.parse(f.dataset.legacy[0].raw), JSON.parse(f.legacyValid));
assert.throws(() => JSON.parse(f.legacyCorrupt));
assert.equal(f.dataset.attempts.at(-1).score.earned, 4);
assert.equal(Math.max(...f.dataset.attempts.map(a => a.score.earned)), 4);
assert.equal(Math.round(10000 / 9) / 100, 11.11);
console.log('PASS: source separation, 3 attempt snapshots/scores, version binding, legacy bytes and example metrics.');
console.log('Negative-case expectations require future validators/adapters; not runtime verification.');
