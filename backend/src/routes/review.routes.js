import express from 'express';
import { getReviews, addReview } from '../controllers/review.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId', getReviews);
router.post('/course/:courseId', authMiddleware, addReview);

export default router;
