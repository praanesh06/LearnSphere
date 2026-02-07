import prisma from '../utils/prisma.js';

export const getQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;

        const quiz = await prisma.quiz.findUnique({
            where: { courseId },
            include: {
                questions: { orderBy: { order: 'asc' } }
            }
        });

        res.json({ quiz });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

export const createQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, passingScore } = req.body;

        const quiz = await prisma.quiz.create({
            data: {
                courseId,
                title: title || 'Course Quiz',
                description,
                passingScore: passingScore || 70
            },
            include: {
                questions: true
            }
        });

        res.status(201).json({ quiz });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, passingScore } = req.body;

        const quiz = await prisma.quiz.update({
            where: { id },
            data: { title, description, passingScore },
            include: { questions: { orderBy: { order: 'asc' } } }
        });

        res.json({ quiz });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};

export const addQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, options, correctAnswers, points } = req.body;

        if (!text || !options || !correctAnswers) {
            return res.status(400).json({ error: 'Text, options, and correctAnswers are required' });
        }

        // Get the highest order number
        const lastQuestion = await prisma.question.findFirst({
            where: { quizId: id },
            orderBy: { order: 'desc' }
        });

        const question = await prisma.question.create({
            data: {
                quizId: id,
                text,
                options: JSON.stringify(options),
                correctAnswers: JSON.stringify(correctAnswers),
                points: points || 10,
                order: (lastQuestion?.order || 0) + 1
            }
        });

        res.status(201).json({ question });
    } catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { text, options, correctAnswers, points } = req.body;

        const question = await prisma.question.update({
            where: { id: questionId },
            data: {
                text,
                options: options ? JSON.stringify(options) : undefined,
                correctAnswers: correctAnswers ? JSON.stringify(correctAnswers) : undefined,
                points
            }
        });

        res.json({ question });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        await prisma.question.delete({ where: { id: questionId } });

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
};
