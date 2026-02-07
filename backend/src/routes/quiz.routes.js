import express from 'express';
import {
    getQuiz,
    createQuiz,
    updateQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion
} from '../controllers/quiz.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId', authMiddleware, getQuiz);
router.post('/course/:courseId', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), createQuiz);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), updateQuiz);
router.post('/:id/questions', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), addQuestion);
router.put('/:id/questions/:questionId', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), updateQuestion);
router.delete('/:id/questions/:questionId', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), deleteQuestion);

export default router;
