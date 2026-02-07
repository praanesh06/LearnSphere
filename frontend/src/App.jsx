import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Learner pages
import BrowseCourses from './pages/learner/BrowseCourses';
import MyCourses from './pages/learner/MyCourses';
import CourseDetail from './pages/learner/CourseDetail';
import LessonPlayer from './pages/learner/LessonPlayer';

// Admin pages
import AdminCourses from './pages/admin/AdminCourses';
import CourseForm from './pages/admin/CourseForm';
import ReportsDashboard from './pages/admin/ReportsDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Learner routes */}
            <Route path="/courses" element={<ProtectedRoute><BrowseCourses /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/course/:id/learn" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />

            {/* Admin/Instructor routes */}
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'INSTRUCTOR']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/course/:id/edit"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'INSTRUCTOR']}>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'INSTRUCTOR']}>
                  <ReportsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
