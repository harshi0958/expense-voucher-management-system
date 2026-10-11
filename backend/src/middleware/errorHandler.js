const errorHandler = (err, req, res, next) => {
  // Keep diagnostic detail in server logs only; never return SQL details to clients.
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  } else {
    console.error(err.stack || err);
  }

  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with those details already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'This operation references a record that does not exist.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'The uploaded file is too large.' });
  }

  const requestedStatus = Number(err.status || err.statusCode || 500);
  const status = requestedStatus >= 400 && requestedStatus < 600 ? requestedStatus : 500;
  const message = status >= 500
    ? 'Something went wrong. Please try again later.'
    : (err.publicMessage || err.message || 'The request could not be completed.');

  return res.status(status).json({ message });
};

module.exports = errorHandler;
