const test = require('node:test');
const assert = require('node:assert/strict');
const { sendEmail } = require('../src/services/emailService');

const withConfig = async (apiKey, from, action) => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;
  try {
    if (apiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = apiKey;
    if (from === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = from;
    await action();
  } finally {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalFrom;
  }
};

test('email service refuses to claim delivery without Resend configuration', async () => {
  await withConfig(undefined, undefined, async () => {
    await assert.rejects(
      sendEmail({ to: 'user@example.com', subject: 'Test', text: 'Code' }),
      (error) => error.code === 'EMAIL_NOT_CONFIGURED'
    );
  });
});

test('email service rejects a failed provider response', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 401 });
  try {
    await withConfig('test-key', 'ExpenseVMS <noreply@example.com>', async () => {
      await assert.rejects(
        sendEmail({ to: 'user@example.com', subject: 'Test', text: 'Code' }),
        /rejected the message/
      );
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test('email service sends OTP mail through the configured Resend API', async () => {
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };
  try {
    await withConfig('test-key', 'ExpenseVMS <noreply@example.com>', async () => {
      await sendEmail({ to: 'user@example.com', subject: 'Verify', text: 'Code body' });
    });
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(request.options.body), {
      from: 'ExpenseVMS <noreply@example.com>',
      to: ['user@example.com'],
      subject: 'Verify',
      text: 'Code body',
    });
  } finally {
    global.fetch = originalFetch;
  }
});
