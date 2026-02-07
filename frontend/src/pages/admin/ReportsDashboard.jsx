import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

export default function ReportsDashboard() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAnalytics(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await apiClient.get('/courses');
            const publishedCourses = response.data.courses.filter(c => c.published);
            setCourses(publishedCourses);
            if (publishedCourses.length > 0) {
                setSelectedCourse(publishedCourses[0].id);
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (courseId) => {
        try {
            const response = await apiClient.get(`/reports/course/${courseId}`);
            setAnalytics(response.data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="card text-center py-12">
                    <p className="text-gray-500">No published courses yet</p>
                </div>
            </div>
        );
    }

    const selectedCourseData = courses.find(c => c.id === selectedCourse);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

            {/* Course Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                    value={selectedCourse || ''}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-field max-w-md"
                >
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {analytics && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Total Enrollments</div>
                            <div className="text-3xl font-bold text-primary">{analytics.totalEnrollments}</div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Active Students</div>
                            <div className="text-3xl font-bold text-blue-600">{analytics.activeStudents}</div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                            <div className="text-3xl font-bold text-green-600">
                                {analytics.completionRate.toFixed(1)}%
                            </div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Average Rating</div>
                            <div className="text-3xl font-bold text-yellow-600">
                                ⭐ {analytics.avgRating.toFixed(1)}
                            </div>
                        </div>
                    </div>

                    {/* Enrollment Status Breakdown */}
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold mb-4">Enrollment Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-600 mb-1">Joined</div>
                                <div className="text-2xl font-bold text-blue-700">
                                    {analytics.enrollmentsByStatus.JOINED || 0}
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <div className="text-sm text-yellow-600 mb-1">In Progress</div>
                                <div className="text-2xl font-bold text-yellow-700">
                                    {analytics.enrollmentsByStatus.IN_PROGRESS || 0}
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-sm text-green-600 mb-1">Completed</div>
                                <div className="text-2xl font-bold text-green-700">
                                    {analytics.enrollmentsByStatus.COMPLETED || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
                        <div className="space-y-3">
                            {analytics.topPerformers.slice(0, 10).map((performer, idx) => (
                                <div key={performer.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{performer.userName}</p>
                                            <p className="text-sm text-gray-500">
                                                {performer.completedLessons} / {selectedCourseData?.lessons?.length || 0} lessons
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Progress</div>
                                        <div className="font-semibold text-primary">
                                            {performer.progressPercentage.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {analytics.topPerformers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No student progress yet
                            </div>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
                        <div className="space-y-4">
                            {analytics.recentReviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={review.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`}
                                                alt={review.user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="font-medium text-gray-900">{review.user.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">{review.comment}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {analytics.recentReviews.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No reviews yet
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
