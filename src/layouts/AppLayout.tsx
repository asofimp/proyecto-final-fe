import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useLogout, useMe } from '../hooks/useAuth'
import { RUTAS } from '../router/paths'
import { useAuthStore } from '../store/authStore'
import { Toaster } from '../components/ui/Toaster'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useLogout()
  const navigate = useNavigate()

  // Mantiene actualizados el rol y los permisos del usuario
  useMe()

  const cerrarSesion = () => {
    logout()
    navigate(RUTAS.login, { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-gray-50 text-left">
      {/* Menú lateral fijo en escritorio */}
      <aside className="hidden w-64 print:!hidden shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 font-semibold text-gray-900">
          Taller
        </div>
        <Sidebar />
      </aside>

      {/* Menú lateral desplegable en móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <Sidebar onNavegar={() => setMenuAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 print:hidden items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
          <button
            type="button"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="ml-auto flex items-center gap-4">
            {usuario && (
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900">{usuario.nombre}</p>
                <p className="text-gray-500">{usuario.rol}</p>
              </div>
            )}
            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 print:p-0">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
