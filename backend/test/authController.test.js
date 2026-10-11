const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../src/config/db');
const { register } = require('../src/controllers/authController');

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('public registration rejects privileged roles before touching the database', async () => {
  const originalQuery = pool.query;
  let queryCount = 0;
  pool.query = async () => { queryCount += 1; throw new Error('Unexpected database access'); };
  try {
    const res = response();
    await register({ body: { name: 'Test Admin', email: 'admin@example.com', password: 'long-enough-password', role: 'admin' } }, res, assert.fail);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /employee or director/i);
    assert.equal(queryCount, 0);
  } finally {
    pool.query = originalQuery;
  }
});

test('registration reports duplicate emails as a conflict', async () => {
  const originalQuery = pool.query;
  pool.query = async () => {
    const error = new Error('duplicate');
    error.code = '23505';
    throw error;
  };
  try {
    const res = response();
    await register({ body: { name: 'Test User', email: 'test@example.com', password: 'long-enough-password', role: 'employee' } }, res, assert.fail);
    assert.equal(res.statusCode, 409);
    assert.match(res.body.message, /already exists/i);
  } finally {
    pool.query = originalQuery;
  }
});
