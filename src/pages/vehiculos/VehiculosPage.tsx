import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Can } from '../../components/Can'
import { VehiculoFormModal } from '../../components/clientes/VehiculoFormModal'
import { ActivoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import { useVehiculos } from '../../hooks/useClientes'
import { RUTAS } from '../../router/paths'
import { PERMISOS } from '../../types/enums'
import { formatNumero } from '../../utils/format'
import { aBooleano, OPCIONES_ACTIVO } from '../../utils/formularios'

export default function VehiculosPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [activo, setActivo] = useState('true')
  const [creando, setCreando] = useState(false)
  const { data, isLoading, error } = useVehiculos({ page, buscar, activo: aBooleano(activo) })

  return (
    <>
      <PageHeader
        titulo="Vehículos"
        descripcion="Vehículos registrados y sus propietarios"
        acciones={
          <Can permisos={[PERMISOS.VEHICULOS_GESTIONAR]}>
            <Button onClick={() => setCreando(true)}>Nuevo vehículo</Button>
          </Can>
        }
      />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda
            placeholder="Placa, marca, modelo o VIN"
            onBuscar={(t) => {
              setBuscar(t)
              setPage(1)
            }}
          />
          <FiltroSelect
            etiqueta="Estado"
            valor={activo}
            opciones={OPCIONES_ACTIVO}
            onCambiar={(v) => {
              setActivo(v)
              setPage(1)
            }}
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data?.data ?? []}
            clave={(v) => v.id}
            onFila={(v) => navigate(RUTAS.vehiculos.detalle(v.id))}
            columnas={[
              { titulo: 'Placa', celda: (v) => <span className="font-medium text-gray-900">{v.placa}</span> },
              { titulo: 'Vehículo', celda: (v) => `${v.marca} ${v.modelo}` },
              { titulo: 'Año', celda: (v) => v.anio },
              { titulo: 'Propietario', celda: (v) => v.cliente?.nombre },
              { titulo: 'Kilometraje', celda: (v) => formatNumero(v.kilometraje), className: 'text-right' },
              { titulo: 'Estado', celda: (v) => <ActivoBadge activo={v.activo} /> },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {creando && (
        <VehiculoFormModal
          onClose={() => setCreando(false)}
          onGuardado={(v) => navigate(RUTAS.vehiculos.detalle(v.id))}
        />
      )}
    </>
  )
}
