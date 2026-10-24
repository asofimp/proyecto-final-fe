import type { MovimientoInventario } from '../../types/bodega.types'
import { MOVIMIENTOS_DE_ENTRADA } from '../../types/enums'
import { TIPO_MOVIMIENTO } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Tabla, type Columna } from '../ui/Table'

interface TablaMovimientosProps {
  movimientos: MovimientoInventario[]
  // En el kardex de un repuesto la columna sobra
  mostrarRepuesto?: boolean
}

export function TablaMovimientos({ movimientos, mostrarRepuesto = true }: TablaMovimientosProps) {
  const columnas: Columna<MovimientoInventario>[] = [
    { titulo: 'Fecha', celda: (m) => formatFechaHora(m.fecha), className: 'whitespace-nowrap' },
    ...(mostrarRepuesto
      ? [
          {
            titulo: 'Repuesto',
            celda: (m: MovimientoInventario) => (
              <>
                <span className="font-medium text-gray-900">{m.repuesto?.nombre}</span>
                <span className="block text-xs text-gray-500">{m.repuesto?.codigo}</span>
              </>
            ),
          },
        ]
      : []),
    { titulo: 'Tipo', celda: (m) => <EstadoBadge valor={m.tipo} mapa={TIPO_MOVIMIENTO} /> },
    {
      titulo: 'Cantidad',
      className: 'text-right font-medium',
      celda: (m) =>
        MOVIMIENTOS_DE_ENTRADA.includes(m.tipo) ? (
          <span className="text-green-700">+{m.cantidad}</span>
        ) : (
          <span className="text-red-600">−{m.cantidad}</span>
        ),
    },
    { titulo: 'Saldo', celda: (m) => `${m.stockAnterior} → ${m.stockNuevo}`, className: 'text-right whitespace-nowrap' },
    { titulo: 'Costo unit.', celda: (m) => formatMoneda(m.costoUnitario), className: 'text-right' },
    {
      titulo: 'Referencia',
      celda: (m) => (
        <>
          {m.referencia}
          {m.observaciones && <span className="block text-xs text-gray-500">{m.observaciones}</span>}
          {m.ordenId && <span className="block text-xs text-gray-500">Orden #{m.ordenId}</span>}
        </>
      ),
    },
    { titulo: 'Usuario', celda: (m) => m.usuario?.nombre },
  ]

  return <Tabla columnas={columnas} filas={movimientos} clave={(m) => m.id} vacio="Sin movimientos" />
}
