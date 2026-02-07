import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./dev.db'
        }
    }
});

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.point.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.review.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@learnsphere.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        }
    });

    const instructor = await prisma.user.create({
        data: {
            email: 'instructor@learnsphere.com',
            password: hashedPassword,
            name: 'John Instructor',
            role: 'INSTRUCTOR',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        }
    });

    const learner1 = await prisma.user.create({
        data: {
            email: 'learner1@learnsphere.com',
            password: hashedPassword,
            name: 'Alice Learner',
            role: 'LEARNER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
        }
    });

    const learner2 = await prisma.user.create({
        data: {
            email: 'learner2@learnsphere.com',
            password: hashedPassword,
            name: 'Bob Student',
            role: 'LEARNER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
        }
    });

    const learner3 = await prisma.user.create({
        data: {
            email: 'learner3@learnsphere.com',
            password: hashedPassword,
            name: 'Carol Martinez',
            role: 'LEARNER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol'
        }
    });

    console.log('✅ Created users');

    // Create courses
    const webDevCourse = await prisma.course.create({
        data: {
            title: 'Web Development Fundamentals',
            description: 'Learn the basics of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.',
            tags: JSON.stringify(['Web Development', 'HTML', 'CSS', 'JavaScript', 'Beginner']),
            website: 'https://learnsphere.com/courses/web-dev',
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            published: true,
            visibility: 'EVERYONE',
            accessRule: 'OPEN',
            createdById: instructor.id,
            responsiblePersonId: instructor.id
        }
    });

    const reactCourse = await prisma.course.create({
        data: {
            title: 'Advanced React Patterns',
            description: 'Master advanced React patterns including hooks, context, custom hooks, and performance optimization techniques.',
            tags: JSON.stringify(['React', 'JavaScript', 'Advanced', 'Frontend']),
            website: 'https://learnsphere.com/courses/react',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
            published: true,
            visibility: 'SIGNED_IN',
            accessRule: 'INVITATION',
            createdById: instructor.id,
            responsiblePersonId: instructor.id
        }
    });

    const dsaCourse = await prisma.course.create({
        data: {
            title: 'Data Structures & Algorithms',
            description: 'Comprehensive course on data structures and algorithms with practical examples and coding challenges.',
            tags: JSON.stringify(['DSA', 'Algorithms', 'Computer Science', 'Interview Prep']),
            website: 'https://learnsphere.com/courses/dsa',
            imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
            published: false,
            visibility: 'SIGNED_IN',
            accessRule: 'PAYMENT',
            price: 49.99,
            createdById: admin.id,
            responsiblePersonId: admin.id
        }
    });

    console.log('✅ Created courses');

    // Create lessons for Web Dev course
    await prisma.lesson.createMany({
        data: [
            {
                courseId: webDevCourse.id,
                title: 'Introduction to Web Development',
                description: 'Overview of web development and what you will learn in this course',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
                duration: 15,
                order: 1
            },
            {
                courseId: webDevCourse.id,
                title: 'HTML Basics',
                description: 'Learn the fundamentals of HTML including tags, attributes, and semantic markup',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
                duration: 30,
                order: 2
            },
            {
                courseId: webDevCourse.id,
                title: 'CSS Fundamentals',
                description: 'Master CSS styling, selectors, box model, and layouts',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
                duration: 45,
                order: 3
            },
            {
                courseId: webDevCourse.id,
                title: 'JavaScript Essentials',
                description: 'Introduction to JavaScript programming and DOM manipulation',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
                duration: 60,
                order: 4
            },
            {
                courseId: webDevCourse.id,
                title: 'Building Your First Website',
                description: 'Hands-on project: Create a complete responsive website',
                type: 'DOCUMENT',
                contentUrl: '/uploads/first-website-guide.pdf',
                allowDownload: true,
                order: 5
            }
        ]
    });

    // Create lessons for React course
    await prisma.lesson.createMany({
        data: [
            {
                courseId: reactCourse.id,
                title: 'React Hooks Deep Dive',
                description: 'Understanding useState, useEffect, and custom hooks',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
                duration: 40,
                order: 1
            },
            {
                courseId: reactCourse.id,
                title: 'Context API & State Management',
                description: 'Managing global state with Context API',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
                duration: 35,
                order: 2
            },
            {
                courseId: reactCourse.id,
                title: 'Performance Optimization',
                description: 'React.memo, useMemo, useCallback, and code splitting',
                type: 'VIDEO',
                contentUrl: 'https://www.youtube.com/watch?v=uojLJFt9SzY',
                duration: 50,
                order: 3
            },
            {
                courseId: reactCourse.id,
                title: 'Advanced Patterns',
                description: 'Render props, HOCs, and compound components',
                type: 'DOCUMENT',
                contentUrl: '/uploads/react-patterns.pdf',
                allowDownload: true,
                order: 4
            }
        ]
    });

    console.log('✅ Created lessons');

    // Create quizzes
    const webDevQuiz = await prisma.quiz.create({
        data: {
            courseId: webDevCourse.id,
            title: 'Web Development Fundamentals Quiz',
            description: 'Test your knowledge of HTML, CSS, and JavaScript',
            passingScore: 70
        }
    });

    await prisma.question.createMany({
        data: [
            {
                quizId: webDevQuiz.id,
                text: 'What does HTML stand for?',
                options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language']),
                correctAnswers: JSON.stringify([0]),
                points: 10,
                order: 1
            },
            {
                quizId: webDevQuiz.id,
                text: 'Which CSS property is used to change the text color?',
                options: JSON.stringify(['color', 'text-color', 'font-color', 'text-style']),
                correctAnswers: JSON.stringify([0]),
                points: 10,
                order: 2
            },
            {
                quizId: webDevQuiz.id,
                text: 'Which of the following are JavaScript data types?',
                options: JSON.stringify(['String', 'Number', 'Boolean', 'All of the above']),
                correctAnswers: JSON.stringify([3]),
                points: 10,
                order: 3
            },
            {
                quizId: webDevQuiz.id,
                text: 'What is the correct syntax for referring to an external JavaScript file?',
                options: JSON.stringify(['<script src="app.js">', '<script href="app.js">', '<script name="app.js">', '<js src="app.js">']),
                correctAnswers: JSON.stringify([0]),
                points: 10,
                order: 4
            },
            {
                quizId: webDevQuiz.id,
                text: 'Which HTML tag is used to define an internal style sheet?',
                options: JSON.stringify(['<style>', '<css>', '<script>', '<link>']),
                correctAnswers: JSON.stringify([0]),
                points: 10,
                order: 5
            }
        ]
    });

    const reactQuiz = await prisma.quiz.create({
        data: {
            courseId: reactCourse.id,
            title: 'Advanced React Quiz',
            description: 'Test your understanding of advanced React concepts',
            passingScore: 75
        }
    });

    await prisma.question.createMany({
        data: [
            {
                quizId: reactQuiz.id,
                text: 'What is the purpose of useEffect hook?',
                options: JSON.stringify(['Handle side effects', 'Manage state', 'Create refs', 'Optimize performance']),
                correctAnswers: JSON.stringify([0]),
                points: 10,
                order: 1
            },
            {
                quizId: reactQuiz.id,
                text: 'Which hook would you use to optimize expensive calculations?',
                options: JSON.stringify(['useState', 'useEffect', 'useMemo', 'useCallback']),
                correctAnswers: JSON.stringify([2]),
                points: 10,
                order: 2
            },
            {
                quizId: reactQuiz.id,
                text: 'What does React.memo do?',
                options: JSON.stringify(['Memoizes component props', 'Prevents unnecessary re-renders', 'Caches API calls', 'Stores state']),
                correctAnswers: JSON.stringify([1]),
                points: 10,
                order: 3
            }
        ]
    });

    console.log('✅ Created quizzes');

    // Create enrollments
    const enrollment1 = await prisma.enrollment.create({
        data: {
            userId: learner1.id,
            courseId: webDevCourse.id,
            status: 'IN_PROGRESS'
        }
    });

    const enrollment2 = await prisma.enrollment.create({
        data: {
            userId: learner2.id,
            courseId: webDevCourse.id,
            status: 'JOINED'
        }
    });

    await prisma.enrollment.create({
        data: {
            userId: learner3.id,
            courseId: reactCourse.id,
            status: 'COMPLETED',
            completedAt: new Date()
        }
    });

    console.log('✅ Created enrollments');

    // Create progress for learner1
    const webDevLessons = await prisma.lesson.findMany({
        where: { courseId: webDevCourse.id },
        take: 2
    });

    for (const lesson of webDevLessons) {
        await prisma.progress.create({
            data: {
                enrollmentId: enrollment1.id,
                lessonId: lesson.id,
                completed: true,
                completedAt: new Date()
            }
        });
    }

    console.log('✅ Created progress');

    // Create reviews
    await prisma.review.createMany({
        data: [
            {
                courseId: webDevCourse.id,
                userId: learner1.id,
                rating: 5,
                comment: 'Excellent course! Very clear explanations and great examples.'
            },
            {
                courseId: reactCourse.id,
                userId: learner3.id,
                rating: 4,
                comment: 'Great advanced content, but could use more practical examples.'
            }
        ]
    });

    console.log('✅ Created reviews');

    // Create points
    await prisma.point.createMany({
        data: [
            { userId: learner1.id, source: 'LESSON', points: 10 },
            { userId: learner1.id, source: 'LESSON', points: 10 },
            { userId: learner3.id, source: 'COURSE_COMPLETION', points: 100 },
            { userId: learner3.id, source: 'QUIZ', points: 30 }
        ]
    });

    console.log('✅ Created points');

    console.log('🎉 Seed completed successfully!');
    console.log('\n📧 Test accounts:');
    console.log('Admin: admin@learnsphere.com / password123');
    console.log('Instructor: instructor@learnsphere.com / password123');
    console.log('Learner 1: learner1@learnsphere.com / password123');
    console.log('Learner 2: learner2@learnsphere.com / password123');
    console.log('Learner 3: learner3@learnsphere.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
