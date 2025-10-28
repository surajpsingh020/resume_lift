import express from 'express';
import { generateText } from '../controller/ai.controller.js';
// import { isUserAvailable } from '../middleware/auth.js'; // optional auth

const router = express.Router();

// Optionally protect the endpoint with auth middleware
router.post('/generate', /* isUserAvailable, */ generateText);

export default router;