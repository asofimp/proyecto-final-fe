import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Can } from '../../components/Can'
import { TablaOrdenes } from '../../components/ordenes/TablaOrdenes'
import { LinkButton } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { Checkbox, Input } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useOrdenes } from '../../hooks/useOrdenes'
import { RUTAS } from '../../router/paths'
import { PERMISOS, type EstadoOrden } from '../../types/enums'
import { ESTADO_ORDEN, opciones } from '../../utils/etiquetas'

export default function OrdenesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [abiertas, setAbiertas] = useState(true)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const { data, isLoading, error } = useOrdenes({
    page,
    buscar,
    estado: estado ? [estado as EstadoOrden] : undefined,
    abiertas: abiertas || undefined,
    desde,
    hasta,
  })

  // Cualquier cambio de filtro vuelve a la primera página
  const filtrar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        titulo="Órdenes de trabajo"
        descripcion="Vehículos ingresados al taller y su avance"
        acciones={
          <Can permisos={[PERMISOS.VEHICULOS_REGISTRAR_INGRESO]}>
            <LinkButton to={RUTAS.ordenes.nueva}>Registrar ingreso</LinkButton>
          </Can>
        }
      />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda placeholder="Número de orden o placa" onBuscar={filtrar(setBuscar)} />
          <FiltroSelect etiqueta="Estado" valor={estado} opciones={opciones(ESTADO_ORDEN)} onCambiar={filtrar(setEstado)} />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Desde</span>
            <Input type="date" value={desde} onChange={(e) => filtrar(setDesde)(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Hasta</span>
            <Input type="date" value={hasta} onChange={(e) => filtrar(setHasta)(e.target.value)} />
          </label>
          <Checkbox
            etiqueta="Solo vehículos en el taller"
            checked={abiertas}
            onChange={(e) => filtrar(setAbiertas)(e.target.checked)}
            className="pb-2"
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <TablaOrdenes ordenes={data?.data ?? []} onAbrir={(o) => navigate(RUTAS.ordenes.detalle(o.id))} />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>
    </>
  )
}
