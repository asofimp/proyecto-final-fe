import type { ReactNode } from 'react'

interface CardProps {
  titulo?: ReactNode
  acciones?: ReactNode
  children: ReactNode
  // Sin relleno interno (para tablas que ocupan todo el ancho)
  sinRelleno?: boolean
  className?: string
}

export function Card({ titulo, acciones, children, sinRelleno, className = '' }: CardProps) {
  return (
    <section className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>
      {(titulo || acciones) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
          {titulo && <h2 className="text-sm font-semibold text-gray-900">{titulo}</h2>}
          {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
        </div>
      )}
      <div className={sinRelleno ? '' : 'p-4'}>{children}</div>
    </section>
  )
}

// Lista de pares etiqueta / valor para las vistas de detalle
export function Datos({ children, columnas = 2 }: { children: ReactNode; columnas?: 2 | 3 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-3 ${columnas === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {children}
    </dl>
  )
}

export function Dato({ etiqueta, children, ancho }: { etiqueta: string; children: ReactNode; ancho?: boolean }) {
  return (
    <div className={ancho ? 'sm:col-span-full' : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm whitespace-pre-line text-gray-900">{children ?? '—'}</dd>
    </div>
  )
}
