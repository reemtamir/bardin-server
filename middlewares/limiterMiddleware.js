const rateLimit = require('express-rate-limit');

// Set a rate limit of 10 requests per minute
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 1000, // 10000 requests
});

module.exports = limiter;
