const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { evaluateOtp } = require('../src/utils/otpPolicy');

const NOW = new Date('2026-10-11T12:00:00.000Z');
const record = (overrides = {}) => ({
  code_hash: crypto.createHash('sha256').update('123456').digest('hex'),
  expires_at: new Date(NOW.getTime() + 60_000),
  challenge_expires_at: new Date(NOW.getTime() + 600_000),
  attempts: 0,
  consumed_at: null,
  ...overrides,
});
const hash = (code) => crypto.createHash('sha256').update(code).digest('hex');

test('accepts a valid code that has not expired or been used', () => {
  assert.equal(evaluateOtp(record(), hash('123456'), NOW), 'valid');
});

test('rejects an incorrect code and consumed challenge', () => {
  assert.equal(evaluateOtp(record(), hash('000000'), NOW), 'incorrect');
  assert.equal(evaluateOtp(record({ consumed_at: NOW }), hash('123456'), NOW), 'used');
});

test('rejects expired codes, expired challenges, and exhausted attempts', () => {
  assert.equal(evaluateOtp(record({ expires_at: NOW }), hash('123456'), NOW), 'expired');
  assert.equal(evaluateOtp(record({ challenge_expires_at: NOW }), hash('123456'), NOW), 'challenge_expired');
  assert.equal(evaluateOtp(record({ attempts: 5 }), hash('123456'), NOW), 'attempts_exhausted');
});

test('rejects a missing verification record', () => {
  assert.equal(evaluateOtp(null, '', NOW), 'missing');
});
