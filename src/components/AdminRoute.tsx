import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or to dashboard if not an admin
  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authenticated and user is an admin
  return <>{children}</>;
}