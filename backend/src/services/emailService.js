const sendEmail = async ({ to, subject, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    const error = new Error('Email delivery is not configured (RESEND_API_KEY and EMAIL_FROM are required)');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (cause) {
    const error = new Error('Email provider could not be reached');
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    console.error(`Email provider returned HTTP ${response.status}`);
    throw new Error('Email provider rejected the message');
  }
};

module.exports = { sendEmail };
