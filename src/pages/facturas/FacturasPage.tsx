import { useState } from 'react'
import { useNavigate } from 'react-router'
import { EstadoBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { Input } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import { useFacturas } from '../../hooks/useFacturas'
import { RUTAS } from '../../router/paths'
import type { EstadoFactura } from '../../types/enums'
import { ESTADO_FACTURA, opciones } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda } from '../../utils/format'

export default function FacturasPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const { data, isLoading, error } = useFacturas({
    page,
    buscar,
    estado: estado ? [estado as EstadoFactura] : undefined,
    desde,
    hasta,
  })

  const filtrar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  return (
    <>
      <PageHeader titulo="Facturas" descripcion="Facturas emitidas, pagos y anulaciones" />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda placeholder="Número, NIT o nombre del receptor" onBuscar={filtrar(setBuscar)} />
          <FiltroSelect etiqueta="Estado" valor={estado} opciones={opciones(ESTADO_FACTURA)} onCambiar={filtrar(setEstado)} />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Desde</span>
            <Input type="date" value={desde} onChange={(e) => filtrar(setDesde)(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Hasta</span>
            <Input type="date" value={hasta} onChange={(e) => filtrar(setHasta)(e.target.value)} />
          </label>
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data?.data ?? []}
            clave={(f) => f.id}
            onFila={(f) => navigate(RUTAS.facturas.detalle(f.id))}
            vacio="No hay facturas"
            columnas={[
              { titulo: 'Número', celda: (f) => <span className="font-medium text-gray-900">{f.numeroFactura}</span> },
              { titulo: 'Orden', celda: (f) => f.orden?.numero },
              {
                titulo: 'Receptor',
                celda: (f) => (
                  <>
                    {f.nombreReceptor}
                    <span className="block text-xs text-gray-500">NIT {f.nitReceptor}</span>
                  </>
                ),
              },
              { titulo: 'Emisión', celda: (f) => formatFechaHora(f.fechaEmision), className: 'whitespace-nowrap' },
              { titulo: 'Total', celda: (f) => formatMoneda(f.total), className: 'text-right' },
              { titulo: 'Estado', celda: (f) => <EstadoBadge valor={f.estado} mapa={ESTADO_FACTURA} /> },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>
    </>
  )
}
