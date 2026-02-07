import prisma from '../utils/prisma.js';

export const getReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { courseId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({ reviews, avgRating, count: reviews.length });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

export const addReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if user is enrolled
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ error: 'Must be enrolled to review' });
        }

        const review = await prisma.review.upsert({
            where: {
                courseId_userId: {
                    courseId,
                    userId: req.user.id
                }
            },
            create: {
                courseId,
                userId: req.user.id,
                rating,
                comment
            },
            update: {
                rating,
                comment
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        res.status(201).json({ review });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};
