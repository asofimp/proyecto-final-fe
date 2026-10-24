import { NavLink } from 'react-router'
import { NAVEGACION } from '../router/navigation'
import { RUTAS } from '../router/paths'
import { useAuthStore } from '../store/authStore'

interface SidebarProps {
  onNavegar?: () => void
}

export function Sidebar({ onNavegar }: SidebarProps) {
  // Suscripción a usuario para volver a filtrar el menú cuando cambian los permisos
  const rol = useAuthStore((state) => state.usuario?.rol)
  const tieneAlgunPermiso = useAuthStore((state) => state.tieneAlgunPermiso)

  const secciones = NAVEGACION.map((seccion) => ({
    ...seccion,
    items: seccion.items.filter(
      (item) =>
        (!item.permisos || tieneAlgunPermiso(...item.permisos)) &&
        (!item.roles || (rol !== undefined && (item.roles as string[]).includes(rol))),
    ),
  })).filter((seccion) => seccion.items.length > 0)

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-6">
      {secciones.map((seccion) => (
        <div key={seccion.titulo}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {seccion.titulo}
          </p>
          <ul className="flex flex-col gap-1">
            {seccion.items.map((item) => (
              <li key={item.ruta}>
                <NavLink
                  to={item.ruta}
                  end={item.ruta === RUTAS.inicio}
                  onClick={onNavegar}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.etiqueta}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
