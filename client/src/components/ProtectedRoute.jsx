import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageSkeleton } from './Loader.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
