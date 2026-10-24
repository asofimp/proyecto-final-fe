import type { LineaFactura } from '../../types/facturas.types'
import { TIPO_DETALLE } from '../../utils/etiquetas'
import { formatMoneda, formatNumero } from '../../utils/format'
import { Tabla } from '../ui/Table'

interface Totales {
  subtotal: number
  descuento: number
  ivaPorcentaje: number
  iva: number
  total: number
}

interface LineasFacturaProps {
  lineas: LineaFactura[]
  totales: Totales
}

// Detalle de una factura (emitida o en vista previa) con sus totales
export function LineasFactura({ lineas, totales }: LineasFacturaProps) {
  const filaTotal = (etiqueta: string, valor: string, fuerte = false) => (
    <tr>
      <td colSpan={4} className={`px-4 py-1.5 text-right ${fuerte ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
        {etiqueta}
      </td>
      <td className={`px-4 py-1.5 text-right ${fuerte ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{valor}</td>
    </tr>
  )

  return (
    <Tabla
      filas={lineas.map((l, i) => ({ ...l, i }))}
      clave={(l) => l.i}
      vacio="Sin líneas para facturar"
      columnas={[
        { titulo: 'Tipo', celda: (l) => TIPO_DETALLE[l.tipo], className: 'whitespace-nowrap' },
        { titulo: 'Descripción', celda: (l) => l.descripcion },
        { titulo: 'Cantidad', celda: (l) => formatNumero(l.cantidad), className: 'text-right' },
        { titulo: 'Precio unitario', celda: (l) => formatMoneda(l.precioUnitario), className: 'text-right' },
        { titulo: 'Subtotal', celda: (l) => formatMoneda(l.subtotal), className: 'text-right' },
      ]}
      pie={
        <>
          {filaTotal('Subtotal', formatMoneda(totales.subtotal))}
          {totales.descuento > 0 && filaTotal('Descuento', `− ${formatMoneda(totales.descuento)}`)}
          {filaTotal(`IVA (${formatNumero(totales.ivaPorcentaje)}%)`, formatMoneda(totales.iva))}
          {filaTotal('Total', formatMoneda(totales.total), true)}
        </>
      }
    />
  )
}
