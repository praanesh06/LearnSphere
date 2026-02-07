import prisma from '../utils/prisma.js';

export const getCourses = async (req, res) => {
    try {
        const { role } = req.user || {};
        const isAdmin = role === 'ADMIN' || role === 'INSTRUCTOR';

        const where = isAdmin
            ? {} // Admins see all courses
            : {
                OR: [
                    { published: true, visibility: 'EVERYONE' },
                    { published: true, visibility: 'SIGNED_IN' }
                ]
            };

        const courses = await prisma.course.findMany({
            where,
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                responsiblePerson: { select: { id: true, name: true } },
                lessons: { select: { id: true } },
                _count: { select: { enrollments: true, reviews: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ courses });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const getCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                responsiblePerson: { select: { id: true, name: true } },
                lessons: {
                    orderBy: { order: 'asc' },
                    include: { attachments: true }
                },
                quiz: {
                    include: {
                        questions: { orderBy: { order: 'asc' } }
                    }
                },
                reviews: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                _count: { select: { enrollments: true } }
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const course = await prisma.course.create({
            data: {
                title,
                createdById: req.user.id
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(201).json({ course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, website, imageUrl, published, visibility, accessRule, price, responsiblePersonId } = req.body;

        // Check ownership
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.createdById !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.course.update({
            where: { id },
            data: {
                title,
                description,
                tags,
                website,
                imageUrl,
                published,
                visibility,
                accessRule,
                price,
                responsiblePersonId
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                responsiblePerson: { select: { id: true, name: true } }
            }
        });

        res.json({ course: updated });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.createdById !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.course.delete({ where: { id } });

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

export const getLessons = async (req, res) => {
    try {
        const { id } = req.params;

        const lessons = await prisma.lesson.findMany({
            where: { courseId: id },
            include: { attachments: true },
            orderBy: { order: 'asc' }
        });

        res.json({ lessons });
    } catch (error) {
        console.error('Get lessons error:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
};

export const createLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, contentUrl, duration, allowDownload } = req.body;

        if (!title || !type) {
            return res.status(400).json({ error: 'Title and type are required' });
        }

        // Get the highest order number
        const lastLesson = await prisma.lesson.findFirst({
            where: { courseId: id },
            orderBy: { order: 'desc' }
        });

        const lesson = await prisma.lesson.create({
            data: {
                courseId: id,
                title,
                description,
                type,
                contentUrl,
                duration,
                allowDownload,
                order: (lastLesson?.order || 0) + 1
            },
            include: { attachments: true }
        });

        res.status(201).json({ lesson });
    } catch (error) {
        console.error('Create lesson error:', error);
        res.status(500).json({ error: 'Failed to create lesson' });
    }
};

export const updateLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { title, description, type, contentUrl, duration, allowDownload } = req.body;

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: { title, description, type, contentUrl, duration, allowDownload },
            include: { attachments: true }
        });

        res.json({ lesson });
    } catch (error) {
        console.error('Update lesson error:', error);
        res.status(500).json({ error: 'Failed to update lesson' });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        await prisma.lesson.delete({ where: { id: lessonId } });

        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Delete lesson error:', error);
        res.status(500).json({ error: 'Failed to delete lesson' });
    }
};
