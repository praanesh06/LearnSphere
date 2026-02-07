import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/api';

export default function BrowseCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiClient.get('/courses');
            setCourses(response.data.courses);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Courses</h1>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field max-w-md"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        className="card hover:shadow-lg transition-shadow"
                    >
                        {course.imageUrl && (
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                            />
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.tags && JSON.parse(course.tags).slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="badge bg-blue-100 text-blue-700">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{course.lessons?.length || 0} lessons</span>
                            <span>{course._count?.enrollments || 0} students</span>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No courses found</p>
                </div>
            )}
        </div>
    );
}
