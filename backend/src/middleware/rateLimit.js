const createRateLimit = ({ limit, windowMs }) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    if (requests.size > 10000) {
      for (const [ip, current] of requests) {
        if (now >= current.resetAt) requests.delete(ip);
      }
    }
    const bucket = requests.get(key);
    if (!bucket || now >= bucket.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= limit) {
      res.set('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    bucket.count += 1;
    return next();
  };
};

module.exports = createRateLimit;
