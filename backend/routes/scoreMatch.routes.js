import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { scoreMatchesForRequirement } from '../controllers/scoreMatch.controller.js';

const router = express.Router();

router.use(protect);
router.post('/bulk', scoreMatchesForRequirement);

export default router;
