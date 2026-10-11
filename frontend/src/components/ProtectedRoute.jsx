import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    const dashboards = { employee: '/employee', director: '/director', accounts: '/accounts', admin: '/admin' };
    return <Navigate to={dashboards[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
