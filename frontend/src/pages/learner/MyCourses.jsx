import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

export default function MyCourses() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [points, setPoints] = useState({ totalPoints: 0, badge: 'Bronze' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollmentsRes, pointsRes] = await Promise.all([
                apiClient.get('/enrollments/my-courses'),
                apiClient.get('/reports/points')
            ]);
            setEnrollments(enrollmentsRes.data.enrollments);
            setPoints(pointsRes.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionButton = (enrollment) => {
        const { course, status } = enrollment;

        if (status === 'COMPLETED') {
            return { text: 'Review', color: 'bg-green-500 hover:bg-green-600' };
        }
        if (status === 'IN_PROGRESS') {
            return { text: 'Continue', color: 'bg-primary hover:bg-blue-600' };
        }
        if (status === 'JOINED') {
            return { text: 'Start', color: 'bg-primary hover:bg-blue-600' };
        }
        return { text: 'View', color: 'bg-gray-500 hover:bg-gray-600' };
    };

    const getBadgeColor = (badge) => {
        const colors = {
            Bronze: 'bg-orange-100 text-orange-700',
            Silver: 'bg-gray-100 text-gray-700',
            Gold: 'bg-yellow-100 text-yellow-700',
            Platinum: 'bg-purple-100 text-purple-700'
        };
        return colors[badge] || colors.Bronze;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </div>

                {/* Profile Panel */}
                <div className="card min-w-[200px]">
                    <div className="text-center">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3"
                        />
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Points:</span>
                                <span className="font-semibold text-primary">{points.totalPoints}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Badge:</span>
                                <span className={`badge ${getBadgeColor(points.badge)}`}>
                                    {points.badge}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="text-center py-12 card">
                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                    <Link to="/courses" className="btn-primary inline-block">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => {
                        const { course } = enrollment;
                        const action = getActionButton(enrollment);
                        const totalLessons = course.lessons?.length || 0;
                        const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
                        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                        return (
                            <div key={enrollment.id} className="card">
                                {course.imageUrl && (
                                    <img
                                        src={course.imageUrl}
                                        alt={course.title}
                                        className="w-full h-40 object-cover rounded-lg -mt-6 -mx-6 mb-4"
                                    />
                                )}

                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {course.tags && JSON.parse(course.tags).slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="badge bg-blue-100 text-blue-700 text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <Link
                                    to={`/course/${course.id}`}
                                    className={`block text-center text-white px-4 py-2 rounded-lg font-medium transition-colors ${action.color}`}
                                >
                                    {action.text}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
