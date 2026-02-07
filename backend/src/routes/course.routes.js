import express from 'express';
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson
} from '../controllers/course.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public/authenticated routes
router.get('/', authMiddleware, getCourses);
router.get('/:id', authMiddleware, getCourse);

// Admin/Instructor only routes
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), createCourse);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteCourse);

// Lesson routes
router.get('/:id/lessons', authMiddleware, getLessons);
router.post('/:id/lessons', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), createLesson);
router.put('/:id/lessons/:lessonId', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), updateLesson);
router.delete('/:id/lessons/:lessonId', authMiddleware, roleMiddleware('ADMIN', 'INSTRUCTOR'), deleteLesson);

export default router;
