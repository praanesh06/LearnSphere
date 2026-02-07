import prisma from '../utils/prisma.js';

export const enroll = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: req.user.id,
                courseId,
                status: 'JOINED'
            },
            include: {
                course: {
                    include: {
                        lessons: { orderBy: { order: 'asc' } }
                    }
                }
            }
        });

        res.status(201).json({ enrollment });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
};

export const getMyCourses = async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: {
                course: {
                    include: {
                        lessons: { select: { id: true } },
                        _count: { select: { reviews: true } }
                    }
                },
                progress: true,
                quizAttempts: true
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.json({ enrollments });
    } catch (error) {
        console.error('Get my courses error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

export const getProgress = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                progress: {
                    include: {
                        lesson: true
                    }
                },
                course: {
                    include: {
                        lessons: { orderBy: { order: 'asc' } }
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        if (enrollment.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ enrollment });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};

export const markLessonComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const { lessonId } = req.body;

        // Verify enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: { course: { include: { lessons: true } } }
        });

        if (!enrollment || enrollment.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Mark lesson complete
        const progress = await prisma.progress.upsert({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: id,
                    lessonId
                }
            },
            create: {
                enrollmentId: id,
                lessonId,
                completed: true,
                completedAt: new Date()
            },
            update: {
                completed: true,
                completedAt: new Date()
            }
        });

        // Award points for lesson completion
        await prisma.point.create({
            data: {
                userId: req.user.id,
                source: 'LESSON',
                points: 10
            }
        });

        // Check if all lessons are complete
        const totalLessons = enrollment.course.lessons.length;
        const completedLessons = await prisma.progress.count({
            where: {
                enrollmentId: id,
                completed: true
            }
        });

        // Update enrollment status
        if (completedLessons === totalLessons) {
            await prisma.enrollment.update({
                where: { id },
                data: {
                    status: 'IN_PROGRESS'
                }
            });
        }

        res.json({ progress });
    } catch (error) {
        console.error('Mark lesson complete error:', error);
        res.status(500).json({ error: 'Failed to mark lesson complete' });
    }
};

export const submitQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const { quizId, answers } = req.body;

        // Verify enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: { id }
        });

        if (!enrollment || enrollment.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate score
        let totalPoints = 0;
        let earnedPoints = 0;

        quiz.questions.forEach(question => {
            totalPoints += question.points;
            const userAnswer = answers[question.id];
            const correctAnswers = JSON.parse(question.correctAnswers);

            if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswers)) {
                earnedPoints += question.points;
            }
        });

        const score = (earnedPoints / totalPoints) * 100;

        // Get attempt number
        const attemptCount = await prisma.quizAttempt.count({
            where: { enrollmentId: id, quizId }
        });

        // Create attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                enrollmentId: id,
                quizId,
                answers: JSON.stringify(answers),
                score,
                attemptNumber: attemptCount + 1
            }
        });

        // Award points
        await prisma.point.create({
            data: {
                userId: req.user.id,
                source: 'QUIZ',
                points: Math.round(earnedPoints)
            }
        });

        res.json({ attempt, score, earnedPoints, totalPoints });
    } catch (error) {
        console.error('Submit quiz attempt error:', error);
        res.status(500).json({ error: 'Failed to submit quiz attempt' });
    }
};

export const completeCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await prisma.enrollment.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        // Award completion points
        await prisma.point.create({
            data: {
                userId: req.user.id,
                source: 'COURSE_COMPLETION',
                points: 100
            }
        });

        res.json({ enrollment });
    } catch (error) {
        console.error('Complete course error:', error);
        res.status(500).json({ error: 'Failed to complete course' });
    }
};
