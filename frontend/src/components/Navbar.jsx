import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-2xl font-bold text-primary">
                            LearnSphere
                        </Link>

                        {user && (
                            <div className="hidden md:flex space-x-4">
                                {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') ? (
                                    <>
                                        <Link
                                            to="/admin/courses"
                                            className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Manage Courses
                                        </Link>
                                        <Link
                                            to="/admin/reports"
                                            className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Reports
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/courses"
                                            className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Browse Courses
                                        </Link>
                                        <Link
                                            to="/my-courses"
                                            className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            My Courses
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary text-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
