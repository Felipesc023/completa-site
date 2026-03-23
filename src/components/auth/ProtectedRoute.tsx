import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageLoader } from '@/components/ui/PageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
