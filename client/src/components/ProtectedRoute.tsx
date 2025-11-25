import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, role, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to login
      if (!user) {
        setLocation('/login');
        return;
      }

      // If role is required and doesn't match, redirect to appropriate dashboard
      if (requiredRole && role !== requiredRole) {
        if (role === 'admin') {
          setLocation('/admin/dashboard');
        } else if (role === 'client') {
          setLocation('/client/dashboard');
        } else {
          setLocation('/login');
        }
      }
    }
  }, [user, role, loading, requiredRole, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or wrong role, don't render children
  if (!user || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="client">{children}</ProtectedRoute>;
}
