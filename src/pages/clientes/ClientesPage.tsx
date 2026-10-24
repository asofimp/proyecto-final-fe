import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Can } from '../../components/Can'
import { ClienteFormModal } from '../../components/clientes/ClienteFormModal'
import { ActivoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import { useClientes } from '../../hooks/useClientes'
import { RUTAS } from '../../router/paths'
import { PERMISOS } from '../../types/enums'
import { aBooleano, OPCIONES_ACTIVO } from '../../utils/formularios'

export default function ClientesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [activo, setActivo] = useState('true')
  const [creando, setCreando] = useState(false)
  const { data, isLoading, error } = useClientes({ page, buscar, activo: aBooleano(activo) })

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descripcion="Listado y registro de clientes"
        acciones={
          <Can permisos={[PERMISOS.CLIENTES_GESTIONAR]}>
            <Button onClick={() => setCreando(true)}>Nuevo cliente</Button>
          </Can>
        }
      />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda
            placeholder="Nombre, NIT, DPI o teléfono"
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
            clave={(c) => c.id}
            onFila={(c) => navigate(RUTAS.clientes.detalle(c.id))}
            columnas={[
              { titulo: 'Nombre', celda: (c) => <span className="font-medium text-gray-900">{c.nombre}</span> },
              { titulo: 'NIT', celda: (c) => c.nit },
              { titulo: 'Teléfono', celda: (c) => c.telefono },
              { titulo: 'Correo', celda: (c) => c.email ?? '—' },
              { titulo: 'Vehículos', celda: (c) => c.totalVehiculos ?? 0, className: 'text-right' },
              { titulo: 'Estado', celda: (c) => <ActivoBadge activo={c.activo} /> },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {creando && (
        <ClienteFormModal onClose={() => setCreando(false)} onGuardado={(c) => navigate(RUTAS.clientes.detalle(c.id))} />
      )}
    </>
  )
}
