import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TablaOrdenes } from '../../components/ordenes/TablaOrdenes'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { Checkbox } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useOrdenesAsignadas } from '../../hooks/useOrdenes'
import { RUTAS } from '../../router/paths'
import type { EstadoOrden } from '../../types/enums'
import { ESTADO_ORDEN, opciones } from '../../utils/etiquetas'

export default function MisOrdenesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [abiertas, setAbiertas] = useState(true)
  const { data, isLoading, error } = useOrdenesAsignadas({
    page,
    buscar,
    estado: estado ? [estado as EstadoOrden] : undefined,
    abiertas: abiertas || undefined,
  })

  return (
    <>
      <PageHeader titulo="Mis órdenes" descripcion="Órdenes de trabajo asignadas a usted" />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda
            placeholder="Número de orden o placa"
            onBuscar={(t) => {
              setBuscar(t)
              setPage(1)
            }}
          />
          <FiltroSelect
            etiqueta="Estado"
            valor={estado}
            opciones={opciones(ESTADO_ORDEN)}
            onCambiar={(v) => {
              setEstado(v)
              setPage(1)
            }}
          />
          <Checkbox
            etiqueta="Solo pendientes de entrega"
            checked={abiertas}
            onChange={(e) => {
              setAbiertas(e.target.checked)
              setPage(1)
            }}
            className="pb-2"
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <TablaOrdenes
            ordenes={data?.data ?? []}
            ocultar={['mecanico']}
            onAbrir={(o) => navigate(RUTAS.taller.orden(o.id))}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>
    </>
  )
}
