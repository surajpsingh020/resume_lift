import express from 'express';
// import rateLimit from 'express-rate-limit';
import { generateText } from '../controller/ai.controller.js';
// import { isUserAvailable } from '../middleware/auth.js'; // optional auth

const router = express.Router();

// Rate limiter: max 20 requests per 15 minutes per IP
// TODO: Re-enable rate limiting after fixing import issue
// const aiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // Limit each IP to 20 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many AI requests from this IP, please try again after 15 minutes',
//     statusCode: 429
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// Optionally protect the endpoint with auth middleware
router.post('/generate', /* aiLimiter, isUserAvailable, */ generateText);

export default router;

