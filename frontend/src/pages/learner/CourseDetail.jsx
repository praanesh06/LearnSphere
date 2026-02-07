import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

export default function CourseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [courseRes, reviewsRes] = await Promise.all([
                apiClient.get(`/courses/${id}`),
                apiClient.get(`/reviews/course/${id}`)
            ]);

            setCourse(courseRes.data.course);
            setReviews(reviewsRes.data.reviews);
            setAvgRating(reviewsRes.data.avgRating);

            // Check if enrolled
            try {
                const enrollmentsRes = await apiClient.get('/enrollments/my-courses');
                const userEnrollment = enrollmentsRes.data.enrollments.find(
                    e => e.courseId === id
                );
                setEnrollment(userEnrollment);
            } catch (err) {
                console.error('Failed to check enrollment:', err);
            }
        } catch (err) {
            console.error('Failed to load course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await apiClient.post('/enrollments', { courseId: id });
            fetchData(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    const handleStartLearning = () => {
        if (course.lessons && course.lessons.length > 0) {
            navigate(`/course/${id}/learn`);
        }
    };

    const filteredLessons = course?.lessons?.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-500">Course not found</p>
                    <Link to="/courses" className="btn-primary mt-4 inline-block">
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    const totalLessons = course.lessons?.length || 0;
    const completedLessons = enrollment?.progress?.filter(p => p.completed).length || 0;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {course.imageUrl && (
                        <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full md:w-64 h-48 object-cover rounded-lg"
                        />
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                        <p className="text-gray-600 mb-4">{course.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.tags && JSON.parse(course.tags).map((tag, idx) => (
                                <span key={idx} className="badge bg-blue-100 text-blue-700">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <span>⭐ {avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                            <span>📚 {totalLessons} lessons</span>
                            <span>👥 {course._count?.enrollments || 0} students</span>
                        </div>

                        {enrollment ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Your Progress</span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <button onClick={handleStartLearning} className="btn-primary">
                                    {enrollment.status === 'COMPLETED' ? 'Review Course' : 'Continue Learning'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="btn-primary disabled:opacity-50"
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'lessons'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Lessons
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Reviews
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>
            )}

            {activeTab === 'lessons' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Course Content</h2>
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field max-w-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredLessons.map((lesson, idx) => {
                            const isCompleted = enrollment?.progress?.some(
                                p => p.lessonId === lesson.id && p.completed
                            );

                            return (
                                <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 font-medium">{idx + 1}</span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {lesson.type} {lesson.duration && `• ${lesson.duration} min`}
                                            </p>
                                        </div>
                                    </div>
                                    {isCompleted && (
                                        <span className="text-green-500 text-sm font-medium">✓ Completed</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-gray-500">No reviews yet</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="card">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={review.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`}
                                        alt={review.user.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                                            <div className="flex items-center">
                                                <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
