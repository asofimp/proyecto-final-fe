import type { ReactNode } from 'react'
import type { Tono } from '../../utils/etiquetas'

const TONOS: Record<Tono, string> = {
  gris: 'bg-gray-100 text-gray-700',
  azul: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  amarillo: 'bg-amber-100 text-amber-800',
  naranja: 'bg-orange-100 text-orange-700',
  verde: 'bg-green-100 text-green-700',
  rojo: 'bg-red-100 text-red-700',
  morado: 'bg-purple-100 text-purple-700',
}

export function Badge({ tono = 'gris', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}>
      {children}
    </span>
  )
}

// Insignia a partir de un mapa de etiquetas (ESTADO_ORDEN, ESTADO_FACTURA...)
export function EstadoBadge<K extends string>({
  valor,
  mapa,
}: {
  valor: K
  mapa: Record<K, { texto: string; tono: Tono }>
}) {
  const etiqueta = mapa[valor]
  return <Badge tono={etiqueta?.tono}>{etiqueta?.texto ?? valor}</Badge>
}

export function ActivoBadge({ activo }: { activo: boolean }) {
  return <Badge tono={activo ? 'verde' : 'gris'}>{activo ? 'Activo' : 'Inactivo'}</Badge>
}
