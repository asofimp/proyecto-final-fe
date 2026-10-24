import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router'
import { useLogin } from '../../hooks/useAuth'
import { RUTAS } from '../../router/paths'

export default function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  // Ruta a la que intentaba entrar antes de ser redirigido al login
  const desde = (location.state as { desde?: Location } | null)?.desde?.pathname ?? RUTAS.inicio

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate({ usuario, password }, { onSuccess: () => navigate(desde, { replace: true }) })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4 text-left">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Iniciar sesión</h1>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Usuario o correo</span>
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="mb-6 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        {login.isError && (
          <p className="mb-4 text-sm text-red-600">{login.error.message}</p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {login.isPending ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
