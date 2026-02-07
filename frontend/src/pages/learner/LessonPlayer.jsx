import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';

export default function LessonPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pointsEarned, setPointsEarned] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [courseRes, enrollmentsRes, quizRes] = await Promise.all([
                apiClient.get(`/courses/${id}`),
                apiClient.get('/enrollments/my-courses'),
                apiClient.get(`/quizzes/course/${id}`).catch(() => ({ data: { quiz: null } }))
            ]);

            setCourse(courseRes.data.course);
            setQuiz(quizRes.data.quiz);

            const userEnrollment = enrollmentsRes.data.enrollments.find(e => e.courseId === id);
            setEnrollment(userEnrollment);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const currentLesson = course?.lessons?.[currentLessonIndex];
    const isLessonCompleted = enrollment?.progress?.some(
        p => p.lessonId === currentLesson?.id && p.completed
    );

    const handleMarkComplete = async () => {
        if (!currentLesson || isLessonCompleted) return;

        try {
            await apiClient.post(`/enrollments/${enrollment.id}/progress`, {
                lessonId: currentLesson.id
            });

            // Show points earned
            setPointsEarned(10);
            setTimeout(() => setPointsEarned(null), 3000);

            // Refresh enrollment data
            const enrollmentsRes = await apiClient.get('/enrollments/my-courses');
            const updatedEnrollment = enrollmentsRes.data.enrollments.find(e => e.courseId === id);
            setEnrollment(updatedEnrollment);
        } catch (err) {
            console.error('Failed to mark complete:', err);
        }
    };

    const handleNextLesson = () => {
        if (currentLessonIndex < (course?.lessons?.length || 0) - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        } else if (quiz && !showQuiz) {
            setShowQuiz(true);
        }
    };

    const handlePreviousLesson = () => {
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(currentLessonIndex - 1);
        }
    };

    const handleQuizAnswer = (questionId, answerIndex) => {
        setQuizAnswers({ ...quizAnswers, [questionId]: [answerIndex] });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        try {
            const response = await apiClient.post(`/enrollments/${enrollment.id}/quiz-attempt`, {
                quizId: quiz.id,
                answers: quizAnswers
            });

            setQuizResult(response.data);
            setQuizSubmitted(true);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            alert('Failed to submit quiz');
        }
    };

    const handleCompleteCourse = async () => {
        try {
            await apiClient.post(`/enrollments/${enrollment.id}/complete`);
            navigate(`/course/${id}`);
        } catch (err) {
            console.error('Failed to complete course:', err);
        }
    };

    const renderLessonContent = () => {
        if (!currentLesson) return null;

        switch (currentLesson.type) {
            case 'VIDEO':
                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {currentLesson.contentUrl?.includes('youtube.com') || currentLesson.contentUrl?.includes('youtu.be') ? (
                            <iframe
                                src={currentLesson.contentUrl.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                title={currentLesson.title}
                            />
                        ) : (
                            <video src={currentLesson.contentUrl} controls className="w-full h-full" />
                        )}
                    </div>
                );

            case 'DOCUMENT':
                return (
                    <div className="bg-white rounded-lg p-8 min-h-[500px]">
                        <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                        <p className="text-gray-700 mb-6">{currentLesson.description}</p>
                        {currentLesson.allowDownload && (
                            <a
                                href={currentLesson.contentUrl}
                                download
                                className="btn-primary inline-block"
                            >
                                Download Document
                            </a>
                        )}
                    </div>
                );

            case 'IMAGE':
                return (
                    <div className="bg-white rounded-lg p-4">
                        <img
                            src={currentLesson.contentUrl}
                            alt={currentLesson.title}
                            className="max-w-full h-auto mx-auto rounded-lg"
                        />
                        {currentLesson.description && (
                            <p className="text-gray-700 mt-4 text-center">{currentLesson.description}</p>
                        )}
                    </div>
                );

            default:
                return <div className="text-center text-gray-500">Unsupported lesson type</div>;
        }
    };

    const renderQuiz = () => {
        if (!quiz || !quiz.questions) return null;

        if (quizSubmitted && quizResult) {
            return (
                <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="card">
                        <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
                        <div className="text-6xl mb-4">
                            {quizResult.score >= quiz.passingScore ? '🎉' : '📚'}
                        </div>
                        <p className="text-2xl font-semibold mb-2">
                            Score: {quizResult.score.toFixed(1)}%
                        </p>
                        <p className="text-gray-600 mb-6">
                            {quizResult.earnedPoints} / {quizResult.totalPoints} points earned
                        </p>

                        {quizResult.score >= quiz.passingScore ? (
                            <div className="space-y-4">
                                <p className="text-green-600 font-medium">Congratulations! You passed!</p>
                                <button onClick={handleCompleteCourse} className="btn-primary">
                                    Complete Course & Earn 100 Points
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-orange-600 font-medium">
                                    You need {quiz.passingScore}% to pass. Try again!
                                </p>
                                <button
                                    onClick={() => {
                                        setQuizSubmitted(false);
                                        setQuizAnswers({});
                                        setCurrentQuestionIndex(0);
                                    }}
                                    className="btn-primary"
                                >
                                    Retake Quiz
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const currentQuestion = quiz.questions[currentQuestionIndex];
        const options = JSON.parse(currentQuestion.options);
        const selectedAnswer = quizAnswers[currentQuestion.id];

        return (
            <div className="max-w-3xl mx-auto">
                <div className="card">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">
                                Question {currentQuestionIndex + 1} of {quiz.questions.length}
                            </span>
                            <span className="text-sm text-gray-500">
                                {currentQuestion.points} points
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

                    <div className="space-y-3 mb-8">
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizAnswer(currentQuestion.id, idx)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedAnswer?.[0] === idx
                                        ? 'border-primary bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer?.[0] === idx ? 'border-primary bg-primary' : 'border-gray-300'
                                        }`}>
                                        {selectedAnswer?.[0] === idx && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={Object.keys(quizAnswers).length !== quiz.questions.length}
                                className="btn-primary disabled:opacity-50"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="btn-primary"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course || !enrollment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Course not found or not enrolled</p>
                    <button onClick={() => navigate('/my-courses')} className="btn-primary">
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    const totalLessons = course.lessons?.length || 0;
    const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Points Popup */}
            {pointsEarned && (
                <div className="fixed top-20 right-8 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
                        +{pointsEarned} points! 🎉
                    </div>
                </div>
            )}

            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-80 bg-white overflow-y-auto">
                    <div className="p-6 border-b">
                        <button
                            onClick={() => navigate(`/course/${id}`)}
                            className="text-primary hover:underline mb-4 flex items-center"
                        >
                            ← Back to Course
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
                        <div className="text-sm text-gray-600 mb-3">
                            Progress: {Math.round(progressPercentage)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Lessons</h3>
                        <div className="space-y-2">
                            {course.lessons?.map((lesson, idx) => {
                                const completed = enrollment.progress?.some(
                                    p => p.lessonId === lesson.id && p.completed
                                );
                                const isCurrent = idx === currentLessonIndex && !showQuiz;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => {
                                            setCurrentLessonIndex(idx);
                                            setShowQuiz(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${isCurrent
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className={`font-medium text-sm ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                                                    {lesson.title}
                                                </p>
                                                <p className={`text-xs ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {lesson.type} {lesson.duration && `• ${lesson.duration} min`}
                                                </p>
                                            </div>
                                            {completed && <span className="text-green-500">✓</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {quiz && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Quiz</h3>
                                <button
                                    onClick={() => setShowQuiz(true)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${showQuiz
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <p className={`font-medium text-sm ${showQuiz ? 'text-white' : 'text-gray-900'}`}>
                                        {quiz.title}
                                    </p>
                                    <p className={`text-xs ${showQuiz ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {quiz.questions?.length} questions
                                    </p>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-gray-100">
                    <div className="p-8">
                        {showQuiz ? (
                            renderQuiz()
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {currentLesson?.title}
                                    </h1>
                                    <p className="text-gray-600">{currentLesson?.description}</p>
                                </div>

                                {renderLessonContent()}

                                <div className="flex justify-between items-center mt-8">
                                    <button
                                        onClick={handlePreviousLesson}
                                        disabled={currentLessonIndex === 0}
                                        className="btn-secondary disabled:opacity-50"
                                    >
                                        ← Previous Lesson
                                    </button>

                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={isLessonCompleted}
                                        className={`btn-primary disabled:opacity-50 ${isLessonCompleted ? 'bg-green-500' : ''
                                            }`}
                                    >
                                        {isLessonCompleted ? '✓ Completed' : 'Mark as Complete'}
                                    </button>

                                    <button
                                        onClick={handleNextLesson}
                                        className="btn-primary"
                                    >
                                        {currentLessonIndex === (course.lessons?.length || 0) - 1
                                            ? quiz ? 'Take Quiz →' : 'Finish Course'
                                            : 'Next Lesson →'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
