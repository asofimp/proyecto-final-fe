import type { OrdenTrabajo } from '../../types/ordenes.types'
import { ESTADO_ORDEN } from '../../utils/etiquetas'
import { formatFechaHora } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Tabla, type Columna } from '../ui/Table'

interface TablaOrdenesProps {
  ordenes: OrdenTrabajo[]
  onAbrir?: (orden: OrdenTrabajo) => void
  // Columnas que sobran según el contexto (p. ej. el vehículo en su propia ficha)
  ocultar?: ('vehiculo' | 'cliente' | 'mecanico')[]
}

export function TablaOrdenes({ ordenes, onAbrir, ocultar = [] }: TablaOrdenesProps) {
  const columnas: (Columna<OrdenTrabajo> & { id?: string })[] = [
    { titulo: 'Orden', celda: (o) => <span className="font-medium text-gray-900">{o.numero}</span> },
    {
      id: 'vehiculo',
      titulo: 'Vehículo',
      celda: (o) =>
        o.vehiculo && (
          <>
            <span className="font-medium">{o.vehiculo.placa}</span>
            <span className="block text-xs text-gray-500">
              {o.vehiculo.marca} {o.vehiculo.modelo}
            </span>
          </>
        ),
    },
    { id: 'cliente', titulo: 'Cliente', celda: (o) => o.cliente?.nombre },
    { id: 'mecanico', titulo: 'Mecánico', celda: (o) => o.mecanico?.nombre ?? <span className="text-gray-400">Sin asignar</span> },
    { titulo: 'Estado', celda: (o) => <EstadoBadge valor={o.estado} mapa={ESTADO_ORDEN} /> },
    { titulo: 'Ingreso', celda: (o) => formatFechaHora(o.fechaIngreso), className: 'whitespace-nowrap' },
    { titulo: 'Motivo', celda: (o) => <span className="line-clamp-2">{o.motivoIngreso}</span> },
  ]

  return (
    <Tabla
      columnas={columnas.filter((c) => !c.id || !ocultar.includes(c.id as never))}
      filas={ordenes}
      clave={(o) => o.id}
      onFila={onAbrir}
      vacio="No hay órdenes"
    />
  )
}
