import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Can } from '../../components/Can'
import { ClienteFormModal } from '../../components/clientes/ClienteFormModal'
import { VehiculoFormModal } from '../../components/clientes/VehiculoFormModal'
import { TablaOrdenes } from '../../components/ordenes/TablaOrdenes'
import { ActivoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { ConfirmModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabla } from '../../components/ui/Table'
import { useCambiarEstadoCliente, useCliente, useEliminarCliente } from '../../hooks/useClientes'
import { useOrdenes } from '../../hooks/useOrdenes'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import { PERMISOS } from '../../types/enums'
import { formatFecha, formatNumero } from '../../utils/format'

type Dialogo = 'editar' | 'vehiculo' | 'eliminar' | null

export default function ClienteDetallePage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { data: cliente, isLoading, error } = useCliente(id)
  const cambiarEstado = useCambiarEstadoCliente()
  const eliminar = useEliminarCliente()

  return (
    <QueryState cargando={isLoading} error={error}>
      {cliente && (
        <>
          <PageHeader
            titulo={cliente.nombre}
            descripcion={`Cliente desde ${formatFecha(cliente.creadoEn)}`}
            acciones={
              <Can permisos={[PERMISOS.CLIENTES_GESTIONAR]}>
                <Button variante="secundario" onClick={() => setDialogo('editar')}>
                  Editar
                </Button>
                <Button
                  variante="secundario"
                  cargando={cambiarEstado.isPending}
                  onClick={() =>
                    cambiarEstado.mutate(
                      { id, activo: !cliente.activo },
                      {
                        onSuccess: (c) => toast.exito(c.activo ? 'Cliente activado' : 'Cliente desactivado'),
                        onError: (e) => toast.error(e.message),
                      },
                    )
                  }
                >
                  {cliente.activo ? 'Desactivar' : 'Activar'}
                </Button>
                <Button variante="peligro" onClick={() => setDialogo('eliminar')}>
                  Eliminar
                </Button>
              </Can>
            }
          />

          <div className="flex flex-col gap-6">
            <Card titulo="Datos del cliente" acciones={<ActivoBadge activo={cliente.activo} />}>
              <Datos columnas={3}>
                <Dato etiqueta="NIT">{cliente.nit}</Dato>
                <Dato etiqueta="DPI">{cliente.dpi}</Dato>
                <Dato etiqueta="Teléfono">{cliente.telefono}</Dato>
                <Dato etiqueta="Correo">{cliente.email}</Dato>
                <Dato etiqueta="Dirección" ancho>
                  {cliente.direccion}
                </Dato>
              </Datos>
            </Card>

            <Can permisos={[PERMISOS.VEHICULOS_VER]}>
              <Card
                titulo="Vehículos"
                sinRelleno
                acciones={
                  <Can permisos={[PERMISOS.VEHICULOS_GESTIONAR]}>
                    {cliente.activo && (
                      <Button tamano="sm" onClick={() => setDialogo('vehiculo')}>
                        Agregar vehículo
                      </Button>
                    )}
                  </Can>
                }
              >
                <Tabla
                  filas={cliente.vehiculos ?? []}
                  clave={(v) => v.id}
                  onFila={(v) => navigate(RUTAS.vehiculos.detalle(v.id))}
                  vacio="El cliente no tiene vehículos registrados"
                  columnas={[
                    { titulo: 'Placa', celda: (v) => <span className="font-medium text-gray-900">{v.placa}</span> },
                    { titulo: 'Vehículo', celda: (v) => `${v.marca} ${v.modelo} ${v.anio}` },
                    { titulo: 'Color', celda: (v) => v.color ?? '—' },
                    { titulo: 'Kilometraje', celda: (v) => formatNumero(v.kilometraje), className: 'text-right' },
                    { titulo: 'Estado', celda: (v) => <ActivoBadge activo={v.activo} /> },
                  ]}
                />
              </Card>
            </Can>

            <Can permisos={[PERMISOS.ORDENES_VER]}>
              <OrdenesCliente clienteId={id} />
            </Can>
          </div>

          {dialogo === 'editar' && <ClienteFormModal cliente={cliente} onClose={() => setDialogo(null)} />}
          {dialogo === 'vehiculo' && <VehiculoFormModal cliente={cliente} onClose={() => setDialogo(null)} />}
          {dialogo === 'eliminar' && (
            <ConfirmModal
              titulo="Eliminar cliente"
              mensaje={`¿Eliminar a ${cliente.nombre}? Solo es posible si no tiene vehículos ni órdenes; en ese caso desactívelo.`}
              textoConfirmar="Eliminar"
              pendiente={eliminar.isPending}
              error={eliminar.error}
              onClose={() => setDialogo(null)}
              onConfirmar={() =>
                eliminar.mutate(id, {
                  onSuccess: () => {
                    toast.exito('Cliente eliminado')
                    navigate(RUTAS.clientes.lista, { replace: true })
                  },
                })
              }
            />
          )}
        </>
      )}
    </QueryState>
  )
}

function OrdenesCliente({ clienteId }: { clienteId: number }) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useOrdenes({ clienteId, limit: 10 })
  return (
    <Card titulo="Últimas órdenes" sinRelleno>
      <QueryState cargando={isLoading} error={error}>
        <TablaOrdenes
          ordenes={data?.data ?? []}
          ocultar={['cliente']}
          onAbrir={(o) => navigate(RUTAS.ordenes.detalle(o.id))}
        />
      </QueryState>
    </Card>
  )
}
