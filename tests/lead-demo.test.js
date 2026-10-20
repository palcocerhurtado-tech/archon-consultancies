import test from 'node:test';
import assert from 'node:assert/strict';
import { processSample } from '../assets/js/archon-lead-demo.js';

test('enquiries retain their source, owner and next action without modifying previous state', () => {
  const empty = Object.freeze([]);
  const first = processSample(empty, 'standard');
  const second = processSample(Object.freeze(first.records), 'urgent');
  assert.equal(empty.length, 0);
  assert.equal(first.records.length, 1);
  assert.equal(second.records.length, 2);
  assert.equal(second.records[0].id, first.records[0].id);
  assert.equal(first.records[0].source, 'Web');
  assert.equal(first.records[0].owner, 'Pablo');
  assert.equal(first.records[0].action, 'reply');
  assert.equal(second.records[1].priority, 'high');
  assert.equal(second.records[1].action, 'call');
});

test('repeating a sample preserves the record and pending action instead of creating duplicates', () => {
  const first = processSample([], 'urgent');
  const retry = processSample(first.records, 'urgent');
  assert.equal(retry.event, 'duplicate');
  assert.equal(retry.records.length, 1);
  assert.strictEqual(retry.records, first.records);
  assert.equal(retry.records[0].action, 'call');
});

test('missing source requires human review rather than ordinary follow-up', () => {
  const result = processSample([], 'incomplete');
  assert.equal(result.event, 'review');
  assert.equal(result.records[0].action, 'review');
  assert.equal(result.records[0].source, '');
  assert.equal(result.records[0].owner, 'Pablo');
});

test('all sample types coexist, duplicates do not remove other records', () => {
  let records = [];
  for (const key of ['standard', 'urgent', 'incomplete', 'standard', 'incomplete']) {
    records = processSample(records, key).records;
  }
  assert.equal(records.length, 3);
  assert.equal(new Set(records.map(x => x.id)).size, 3);
  assert.equal(records.filter(x => x.action === 'review').length, 1);
});

test('unknown samples are rejected without changing the register', () => {
  const records = processSample([], 'standard').records;
  assert.throws(() => processSample(records, 'unknown'), RangeError);
  assert.equal(records.length, 1);
});
