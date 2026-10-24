import { Link } from 'react-router'
import { RUTAS } from '../../router/paths'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Página no encontrada</h1>
      <Link to={RUTAS.inicio} className="text-indigo-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
