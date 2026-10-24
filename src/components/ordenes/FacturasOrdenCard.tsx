import { useNavigate } from 'react-router'
import { useFacturasOrden } from '../../hooks/useFacturas'
import { RUTAS } from '../../router/paths'
import { ESTADO_FACTURA } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { QueryState } from '../ui/Feedback'
import { Tabla } from '../ui/Table'

export function FacturasOrdenCard({ ordenId }: { ordenId: number }) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useFacturasOrden(ordenId)

  return (
    <Card titulo="Facturas" sinRelleno>
      <QueryState cargando={isLoading} error={error}>
        <Tabla
          filas={data ?? []}
          clave={(f) => f.id}
          onFila={(f) => navigate(RUTAS.facturas.detalle(f.id))}
          vacio="La orden no se ha facturado"
          columnas={[
            { titulo: 'Número', celda: (f) => <span className="font-medium text-gray-900">{f.numeroFactura}</span> },
            { titulo: 'Receptor', celda: (f) => `${f.nombreReceptor} (${f.nitReceptor})` },
            { titulo: 'Emisión', celda: (f) => formatFechaHora(f.fechaEmision) },
            { titulo: 'Total', celda: (f) => formatMoneda(f.total), className: 'text-right' },
            { titulo: 'Estado', celda: (f) => <EstadoBadge valor={f.estado} mapa={ESTADO_FACTURA} /> },
          ]}
        />
      </QueryState>
    </Card>
  )
}
