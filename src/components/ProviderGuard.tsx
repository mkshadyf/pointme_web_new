import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProviderGuardProps {
  children: ReactNode;
}

export default function ProviderGuard({ children }: ProviderGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 