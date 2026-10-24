import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/authStore'
import type { CodigoPermiso, RolSistema } from '../types/enums'
import { RUTAS } from './paths'

interface PermissionRouteProps {
  // Basta con tener uno de estos permisos
  permisos?: CodigoPermiso[]
  // Si se indica, además el usuario debe tener uno de estos roles
  roles?: RolSistema[]
}

export function PermissionRoute({ permisos = [], roles }: PermissionRouteProps) {
  const rol = useAuthStore((state) => state.usuario?.rol)
  const conPermiso = useAuthStore(
    (state) => permisos.length === 0 || state.tieneAlgunPermiso(...permisos),
  )
  const conRol = !roles || (rol !== undefined && (roles as string[]).includes(rol))

  if (!conPermiso || !conRol) {
    return <Navigate to={RUTAS.sinAcceso} replace />
  }
  return <Outlet />
}
