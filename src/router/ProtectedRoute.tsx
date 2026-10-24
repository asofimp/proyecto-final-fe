import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '../store/authStore'
import { RUTAS } from './paths'

// Exige sesión iniciada; si no hay token redirige al login recordando la ruta pedida
export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to={RUTAS.login} replace state={{ desde: location }} />
  }
  return <Outlet />
}
