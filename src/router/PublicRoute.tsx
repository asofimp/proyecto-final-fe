import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authStore'
import { RUTAS } from './paths'

// Rutas solo para usuarios sin sesión (login)
export function PublicRoute() {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Navigate to={RUTAS.inicio} replace />
  }
  return <Outlet />
}
