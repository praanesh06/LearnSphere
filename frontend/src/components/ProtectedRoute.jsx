import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const { user } = useAuth();

    if (user) {
        // Redirect based on role
        if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
            return <Navigate to="/admin/courses" replace />;
        }
        return <Navigate to="/my-courses" replace />;
    }

    return children;
};
