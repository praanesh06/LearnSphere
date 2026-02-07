import express from 'express';
import {
    enroll,
    getMyCourses,
    getProgress,
    markLessonComplete,
    submitQuizAttempt,
    completeCourse
} from '../controllers/enrollment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, enroll);
router.get('/my-courses', authMiddleware, getMyCourses);
router.get('/:id/progress', authMiddleware, getProgress);
router.post('/:id/progress', authMiddleware, markLessonComplete);
router.post('/:id/quiz-attempt', authMiddleware, submitQuizAttempt);
router.post('/:id/complete', authMiddleware, completeCourse);

export default router;
