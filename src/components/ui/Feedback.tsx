import type { ReactNode } from 'react'
import type { ApiError } from '../../types/api.types'

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      {texto}
    </div>
  )
}

export function ErrorAlert({ error }: { error?: ApiError | null }) {
  if (!error) return null
  const texto =
    error.status === 403
      ? `No tiene permiso para esta acción. ${error.message}`
      : error.status === 0
        ? 'No se pudo conectar con el servidor.'
        : error.message
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {texto}
    </div>
  )
}

export function Vacio({ children = 'Sin resultados' }: { children?: ReactNode }) {
  return <p className="py-8 text-center text-sm text-gray-500">{children}</p>
}

export function Aviso({ children, tono = 'info' }: { children: ReactNode; tono?: 'info' | 'alerta' }) {
  const clases =
    tono === 'alerta'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-indigo-200 bg-indigo-50 text-indigo-800'
  return <div className={`rounded-md border px-3 py-2 text-sm ${clases}`}>{children}</div>
}

interface QueryStateProps {
  cargando: boolean
  error?: ApiError | null
  children: ReactNode
}

// Muestra el estado de carga o error de una consulta antes que el contenido
export function QueryState({ cargando, error, children }: QueryStateProps) {
  if (cargando) return <Cargando />
  if (error) return <ErrorAlert error={error} />
  return <>{children}</>
}
