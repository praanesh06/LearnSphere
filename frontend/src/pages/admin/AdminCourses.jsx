import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

export default function AdminCourses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiClient.get('/courses');
            setCourses(response.data.courses);
        } catch (err) {
            console.error('Failed to load courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseTitle.trim()) return;

        setCreating(true);
        try {
            const response = await apiClient.post('/courses', { title: newCourseTitle });
            setShowCreateModal(false);
            setNewCourseTitle('');
            navigate(`/admin/course/${response.data.course.id}/edit`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create course');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            await apiClient.delete(`/courses/${courseId}`);
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedCourses = {
        draft: filteredCourses.filter(c => !c.published),
        published: filteredCourses.filter(c => c.published)
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
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Courses</h1>
                    <p className="text-gray-600">Create and manage your courses</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    + Create Course
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field flex-1"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'kanban'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Kanban View
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                {course.imageUrl && (
                                    <img
                                        src={course.imageUrl}
                                        alt={course.title}
                                        className="w-32 h-24 object-cover rounded-lg"
                                    />
                                )}

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Created by {course.createdBy?.name}
                                            </p>
                                        </div>
                                        {course.published && (
                                            <span className="badge bg-green-100 text-green-700">Published</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {course.tags && JSON.parse(course.tags).slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="badge bg-blue-100 text-blue-700 text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                        <span>📚 {course.lessons?.length || 0} lessons</span>
                                        <span>👥 {course._count?.enrollments || 0} students</span>
                                        <span>⭐ {course._count?.reviews || 0} reviews</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/course/${course.id}/edit`}
                                            className="btn-primary text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`);
                                                alert('Link copied!');
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            Share
                                        </button>
                                        {user.role === 'ADMIN' && (
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="btn-danger text-sm"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Draft Column */}
                    <div>
                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                            <h2 className="font-semibold text-gray-900">
                                Draft ({groupedCourses.draft.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {groupedCourses.draft.map((course) => (
                                <div key={course.id} className="card">
                                    {course.imageUrl && (
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className="w-full h-32 object-cover rounded-lg -mt-6 -mx-6 mb-4"
                                        />
                                    )}
                                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                                    <div className="text-sm text-gray-600 mb-4">
                                        {course.lessons?.length || 0} lessons • {course._count?.enrollments || 0} students
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/course/${course.id}/edit`} className="btn-primary text-sm flex-1">
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Published Column */}
                    <div>
                        <div className="bg-green-100 rounded-lg p-4 mb-4">
                            <h2 className="font-semibold text-gray-900">
                                Published ({groupedCourses.published.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {groupedCourses.published.map((course) => (
                                <div key={course.id} className="card">
                                    {course.imageUrl && (
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className="w-full h-32 object-cover rounded-lg -mt-6 -mx-6 mb-4"
                                        />
                                    )}
                                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                                    <div className="text-sm text-gray-600 mb-4">
                                        {course.lessons?.length || 0} lessons • {course._count?.enrollments || 0} students
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/course/${course.id}/edit`} className="btn-primary text-sm flex-1">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`);
                                                alert('Link copied!');
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            Share
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 card">
                    <p className="text-gray-500 mb-4">No courses found</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        Create Your First Course
                    </button>
                </div>
            )}

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
                        <form onSubmit={handleCreateCourse}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter course title..."
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewCourseTitle('');
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
