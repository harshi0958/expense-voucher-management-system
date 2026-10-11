const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { validateSignatureImage } = require('../src/middleware/upload');

const runValidator = async (filePath) => {
  let statusCode = 200;
  let responseBody;
  let nextCalled = false;
  const req = { file: { path: filePath } };
  const res = {
    status(code) { statusCode = code; return this; },
    json(body) { responseBody = body; return this; },
  };
  await validateSignatureImage(req, res, (error) => {
    if (error) throw error;
    nextCalled = true;
  });
  return { statusCode, responseBody, nextCalled };
};

test('signature validator accepts a PNG signature', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'evms-upload-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'valid.png');
  await fs.writeFile(file, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]));

  const result = await runValidator(file);
  assert.equal(result.nextCalled, true);
  assert.equal(result.statusCode, 200);
});

test('signature validator rejects and removes a spoofed image', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'evms-upload-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'spoofed.png');
  await fs.writeFile(file, Buffer.from('not an image'));

  const result = await runValidator(file);
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 400);
  assert.match(result.responseBody.message, /not a supported image/i);
  await assert.rejects(fs.access(file));
});
