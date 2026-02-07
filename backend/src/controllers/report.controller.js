import prisma from '../utils/prisma.js';

export const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify user has access (admin/instructor/course creator)
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (
            req.user.role !== 'ADMIN' &&
            course.createdById !== req.user.id &&
            course.responsiblePersonId !== req.user.id
        ) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get enrollments with status breakdown
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                progress: true,
                quizAttempts: true
            }
        });

        const totalParticipants = enrollments.length;
        const yetToStart = enrollments.filter(e => e.status === 'JOINED').length;
        const inProgress = enrollments.filter(e => e.status === 'IN_PROGRESS').length;
        const completed = enrollments.filter(e => e.status === 'COMPLETED').length;

        // Get total lessons for progress calculation
        const lessonsCount = await prisma.lesson.count({
            where: { courseId }
        });

        // Prepare participant details
        const participants = enrollments.map(enrollment => {
            const progressCount = enrollment.progress.filter(p => p.completed).length;
            const progressPercentage = lessonsCount > 0 ? (progressCount / lessonsCount) * 100 : 0;

            return {
                id: enrollment.id,
                user: enrollment.user,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
                progressPercentage: Math.round(progressPercentage),
                quizAttempts: enrollment.quizAttempts.length
            };
        });

        res.json({
            overview: {
                totalParticipants,
                yetToStart,
                inProgress,
                completed
            },
            participants
        });
    } catch (error) {
        console.error('Get course analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export const getUserPoints = async (req, res) => {
    try {
        const points = await prisma.point.findMany({
            where: { userId: req.user.id },
            orderBy: { earnedAt: 'desc' }
        });

        const totalPoints = points.reduce((sum, p) => sum + p.points, 0);

        // Calculate badge level
        let badge = 'Bronze';
        if (totalPoints > 3000) badge = 'Platinum';
        else if (totalPoints > 1500) badge = 'Gold';
        else if (totalPoints > 500) badge = 'Silver';

        res.json({ points, totalPoints, badge });
    } catch (error) {
        console.error('Get user points error:', error);
        res.status(500).json({ error: 'Failed to fetch points' });
    }
};
