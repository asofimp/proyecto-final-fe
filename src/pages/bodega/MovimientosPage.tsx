import { useState } from 'react'
import { TablaMovimientos } from '../../components/bodega/TablaMovimientos'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, FiltroSelect } from '../../components/ui/Filtros'
import { Input } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useMovimientos } from '../../hooks/useBodega'
import type { TipoMovimiento } from '../../types/enums'
import { opciones, TIPO_MOVIMIENTO } from '../../utils/etiquetas'

export default function MovimientosPage() {
  const [page, setPage] = useState(1)
  const [tipo, setTipo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const { data, isLoading, error } = useMovimientos({
    page,
    tipo: tipo ? [tipo as TipoMovimiento] : undefined,
    desde,
    hasta,
  })

  const filtrar = (set: (v: string) => void) => (v: string) => {
    set(v)
    setPage(1)
  }

  return (
    <>
      <PageHeader titulo="Movimientos de inventario" descripcion="Kardex general: entradas, despachos, devoluciones y ajustes" />
      <Card sinRelleno>
        <BarraFiltros>
          <FiltroSelect etiqueta="Tipo" valor={tipo} opciones={opciones(TIPO_MOVIMIENTO)} onCambiar={filtrar(setTipo)} />
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
          <TablaMovimientos movimientos={data?.data ?? []} />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>
    </>
  )
}
