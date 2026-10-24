import { Link } from 'react-router'
import { RUTAS } from '../../router/paths'

export default function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Sin acceso</h1>
      <p className="text-gray-500">No tienes permisos para ver esta pantalla.</p>
      <Link to={RUTAS.inicio} className="text-indigo-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
