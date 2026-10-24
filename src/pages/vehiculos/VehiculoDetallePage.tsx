import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Can } from '../../components/Can'
import { BuscadorCliente } from '../../components/clientes/BuscadorCliente'
import { VehiculoFormModal } from '../../components/clientes/VehiculoFormModal'
import { TablaOrdenes } from '../../components/ordenes/TablaOrdenes'
import { ActivoBadge } from '../../components/ui/Badge'
import { Button, LinkButton } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { Field } from '../../components/ui/Form'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  useCambiarEstadoVehiculo,
  useCambiarPropietario,
  useEliminarVehiculo,
  useVehiculo,
} from '../../hooks/useClientes'
import { useOrdenes } from '../../hooks/useOrdenes'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import type { Cliente } from '../../types/clientes.types'
import { PERMISOS } from '../../types/enums'
import { formatNumero } from '../../utils/format'

type Dialogo = 'editar' | 'propietario' | 'eliminar' | null

export default function VehiculoDetallePage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { data: vehiculo, isLoading, error } = useVehiculo(id)
  const cambiarEstado = useCambiarEstadoVehiculo()
  const eliminar = useEliminarVehiculo()

  return (
    <QueryState cargando={isLoading} error={error}>
      {vehiculo && (
        <>
          <PageHeader
            titulo={vehiculo.placa}
            descripcion={`${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`}
            acciones={
              <>
                <Can permisos={[PERMISOS.VEHICULOS_REGISTRAR_INGRESO]}>
                  {vehiculo.activo && (
                    <LinkButton to={`${RUTAS.ordenes.nueva}?vehiculoId=${vehiculo.id}`}>Registrar ingreso</LinkButton>
                  )}
                </Can>
                <Can permisos={[PERMISOS.VEHICULOS_GESTIONAR]}>
                  <Button variante="secundario" onClick={() => setDialogo('editar')}>
                    Editar
                  </Button>
                  <Button variante="secundario" onClick={() => setDialogo('propietario')}>
                    Cambiar propietario
                  </Button>
                  <Button
                    variante="secundario"
                    cargando={cambiarEstado.isPending}
                    onClick={() =>
                      cambiarEstado.mutate(
                        { id, activo: !vehiculo.activo },
                        {
                          onSuccess: (v) => toast.exito(v.activo ? 'Vehículo activado' : 'Vehículo desactivado'),
                          onError: (e) => toast.error(e.message),
                        },
                      )
                    }
                  >
                    {vehiculo.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variante="peligro" onClick={() => setDialogo('eliminar')}>
                    Eliminar
                  </Button>
                </Can>
              </>
            }
          />

          <div className="flex flex-col gap-6">
            <Card titulo="Datos del vehículo" acciones={<ActivoBadge activo={vehiculo.activo} />}>
              <Datos columnas={3}>
                <Dato etiqueta="Propietario">
                  {vehiculo.cliente && (
                    <Can permisos={[PERMISOS.CLIENTES_VER]} sino={vehiculo.cliente.nombre}>
                      <Link to={RUTAS.clientes.detalle(vehiculo.clienteId)} className="text-indigo-600 hover:underline">
                        {vehiculo.cliente.nombre}
                      </Link>
                    </Can>
                  )}
                </Dato>
                <Dato etiqueta="Teléfono">{vehiculo.cliente?.telefono}</Dato>
                <Dato etiqueta="Color">{vehiculo.color}</Dato>
                <Dato etiqueta="VIN">{vehiculo.vin}</Dato>
                <Dato etiqueta="Kilometraje">{formatNumero(vehiculo.kilometraje)}</Dato>
                <Dato etiqueta="Observaciones" ancho>
                  {vehiculo.observaciones}
                </Dato>
              </Datos>
            </Card>

            <Can permisos={[PERMISOS.ORDENES_VER]}>
              <HistorialVehiculo vehiculoId={id} />
            </Can>
          </div>

          {dialogo === 'editar' && <VehiculoFormModal vehiculo={vehiculo} onClose={() => setDialogo(null)} />}
          {dialogo === 'propietario' && (
            <CambiarPropietarioModal vehiculoId={id} actual={vehiculo.cliente} onClose={() => setDialogo(null)} />
          )}
          {dialogo === 'eliminar' && (
            <ConfirmModal
              titulo="Eliminar vehículo"
              mensaje={`¿Eliminar el vehículo ${vehiculo.placa}? Si tiene órdenes registradas no se puede eliminar; desactívelo en su lugar.`}
              textoConfirmar="Eliminar"
              pendiente={eliminar.isPending}
              error={eliminar.error}
              onClose={() => setDialogo(null)}
              onConfirmar={() =>
                eliminar.mutate(id, {
                  onSuccess: () => {
                    toast.exito('Vehículo eliminado')
                    navigate(RUTAS.vehiculos.lista, { replace: true })
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

function HistorialVehiculo({ vehiculoId }: { vehiculoId: number }) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useOrdenes({ vehiculoId, limit: 20 })
  return (
    <Card titulo="Historial de servicio" sinRelleno>
      <QueryState cargando={isLoading} error={error}>
        <TablaOrdenes
          ordenes={data?.data ?? []}
          ocultar={['vehiculo']}
          onAbrir={(o) => navigate(RUTAS.ordenes.detalle(o.id))}
        />
      </QueryState>
    </Card>
  )
}

interface CambiarPropietarioModalProps {
  vehiculoId: number
  actual?: Pick<Cliente, 'id' | 'nombre'>
  onClose: () => void
}

function CambiarPropietarioModal({ vehiculoId, actual, onClose }: CambiarPropietarioModalProps) {
  const [nuevo, setNuevo] = useState<Cliente | null>(null)
  const cambiar = useCambiarPropietario()

  return (
    <FormModal
      titulo="Cambiar propietario"
      onClose={onClose}
      pendiente={cambiar.isPending}
      error={cambiar.error}
      onSubmit={(e) => {
        e.preventDefault()
        if (!nuevo) return
        cambiar.mutate(
          { id: vehiculoId, clienteId: nuevo.id },
          {
            onSuccess: () => {
              toast.exito('Propietario actualizado')
              onClose()
            },
          },
        )
      }}
    >
      <p className="text-sm text-gray-600">
        Propietario actual: <span className="font-medium text-gray-900">{actual?.nombre}</span>
      </p>
      <Field etiqueta="Nuevo propietario" requerido>
        <BuscadorCliente seleccionado={nuevo} onSeleccionar={setNuevo} />
      </Field>
    </FormModal>
  )
}
