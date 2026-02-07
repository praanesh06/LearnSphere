import express from 'express';
import { getCourseAnalytics, getUserPoints } from '../controllers/report.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId/analytics', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), getCourseAnalytics);
router.get('/points', authMiddleware, getUserPoints);

export default router;
