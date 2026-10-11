const crypto = require('crypto');

const evaluateOtp = (record, suppliedHash, now = new Date()) => {
  if (!record) return 'missing';
  if (record.consumed_at) return 'used';
  if (new Date(record.challenge_expires_at) <= now) return 'challenge_expired';
  if (new Date(record.expires_at) <= now) return 'expired';
  if (record.attempts >= 5) return 'attempts_exhausted';

  const expected = Buffer.from(record.code_hash, 'hex');
  const supplied = Buffer.from(suppliedHash, 'hex');
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied)
    ? 'valid'
    : 'incorrect';
};

module.exports = { evaluateOtp };
