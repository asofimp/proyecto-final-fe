import { useAuthStore } from '../store/authStore'
import { RolSistema, type CodigoPermiso } from '../types/enums'

// Consulta de permisos del usuario autenticado para mostrar u ocultar acciones
export function usePermisos() {
  const usuario = useAuthStore((state) => state.usuario)
  const permisos = usuario?.permisos ?? []

  return {
    usuario,
    esAdmin: usuario?.rol === RolSistema.ADMINISTRADOR,
    // Todos los indicados
    puede: (...codigos: CodigoPermiso[]) => codigos.every((c) => permisos.includes(c)),
    // Al menos uno
    puedeAlguno: (...codigos: CodigoPermiso[]) => codigos.some((c) => permisos.includes(c)),
  }
}
