import { useState } from 'react'
import { useParams } from 'react-router'
import { DatosOrden } from '../../components/ordenes/DatosOrden'
import { FacturasOrdenCard } from '../../components/ordenes/FacturasOrdenCard'
import { HistorialOrdenCard } from '../../components/ordenes/HistorialOrdenCard'
import { AsignarMecanicoModal, EditarOrdenModal, SalidaModal } from '../../components/ordenes/OrdenModales'
import { SolicitudesOrdenCard } from '../../components/ordenes/SolicitudesOrdenCard'
import { DiagnosticosOrden } from '../../components/taller/DiagnosticosOrden'
import { EstadoBadge } from '../../components/ui/Badge'
import { Button, LinkButton } from '../../components/ui/Button'
import { QueryState } from '../../components/ui/Feedback'
import { MotivoModal } from '../../components/ui/MotivoModal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useFacturasOrden } from '../../hooks/useFacturas'
import { useCancelarOrden, useOrden } from '../../hooks/useOrdenes'
import { usePermisos } from '../../hooks/usePermisos'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import { EstadoFactura, EstadoOrden, ESTADOS_EN_PROCESO, PERMISOS } from '../../types/enums'
import { ESTADO_ORDEN } from '../../utils/etiquetas'
import { formatFechaHora } from '../../utils/format'

type Dialogo = 'editar' | 'asignar' | 'cancelar' | 'salida' | null

export default function OrdenDetallePage() {
  const id = Number(useParams().id)
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { puede, esAdmin, usuario } = usePermisos()
  const { data: orden, isLoading, error } = useOrden(id)
  const puedeFacturar = puede(PERMISOS.FACTURAS_GESTIONAR)
  // Solo se consulta si el usuario puede ver facturas
  const facturas = useFacturasOrden(puedeFacturar ? id : undefined)
  const cancelar = useCancelarOrden()
  const cerrar = () => setDialogo(null)

  if (!orden) return <QueryState cargando={isLoading} error={error}>{null}</QueryState>

  const enProceso = ESTADOS_EN_PROCESO.includes(orden.estado)
  const abierta = !orden.fechaSalida
  const facturaVigente = facturas.data?.find((f) => f.estado !== EstadoFactura.ANULADA)
  const esResponsable = esAdmin || orden.mecanicoId === usuario?.id

  return (
    <>
      <PageHeader
        titulo={`Orden ${orden.numero}`}
        descripcion={`Ingreso ${formatFechaHora(orden.fechaIngreso)}`}
        acciones={
          <>
            {esResponsable && puede(PERMISOS.REPARACIONES_ACTUALIZAR_ESTADO) && enProceso && (
              <LinkButton variante="secundario" to={RUTAS.taller.orden(orden.id)}>
                Trabajar en taller
              </LinkButton>
            )}
            {puede(PERMISOS.VEHICULOS_REGISTRAR_INGRESO) && enProceso && (
              <Button variante="secundario" onClick={() => setDialogo('editar')}>
                Editar
              </Button>
            )}
            {puede(PERMISOS.ORDENES_ASIGNAR_MECANICO) && enProceso && (
              <Button variante="secundario" onClick={() => setDialogo('asignar')}>
                {orden.mecanicoId ? 'Reasignar mecánico' : 'Asignar mecánico'}
              </Button>
            )}
            {puedeFacturar && orden.estado === EstadoOrden.LISTA && !facturaVigente && !facturas.isLoading && (
              <LinkButton to={RUTAS.ordenes.facturar(orden.id)}>Facturar</LinkButton>
            )}
            {puede(PERMISOS.VEHICULOS_REGISTRAR_SALIDA) &&
              abierta &&
              (orden.estado === EstadoOrden.CANCELADA || (orden.estado === EstadoOrden.LISTA && (facturaVigente || !puedeFacturar))) && (
                <Button onClick={() => setDialogo('salida')}>Registrar salida</Button>
              )}
            {puede(PERMISOS.ORDENES_CANCELAR) && enProceso && (
              <Button variante="peligro" onClick={() => setDialogo('cancelar')}>
                Cancelar orden
              </Button>
            )}
          </>
        }
      />
      <div className="mb-6">
        <EstadoBadge valor={orden.estado} mapa={ESTADO_ORDEN} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <DatosOrden orden={orden} />
          <DiagnosticosOrden orden={orden} />
          <SolicitudesOrdenCard ordenId={orden.id} />
          {puedeFacturar && <FacturasOrdenCard ordenId={orden.id} />}
        </div>
        <HistorialOrdenCard ordenId={orden.id} />
      </div>

      {dialogo === 'editar' && <EditarOrdenModal orden={orden} onClose={cerrar} />}
      {dialogo === 'asignar' && <AsignarMecanicoModal orden={orden} onClose={cerrar} />}
      {dialogo === 'salida' && <SalidaModal orden={orden} onClose={cerrar} />}
      {dialogo === 'cancelar' && (
        <MotivoModal
          titulo={`Cancelar orden ${orden.numero}`}
          descripcion="Se cancelan las reparaciones y solicitudes de repuestos pendientes y se libera el stock reservado."
          textoConfirmar="Cancelar orden"
          pendiente={cancelar.isPending}
          error={cancelar.error}
          onClose={cerrar}
          onConfirmar={(motivo) =>
            cancelar.mutate(
              { id: orden.id, motivo },
              {
                onSuccess: () => {
                  toast.exito('Orden cancelada')
                  cerrar()
                },
              },
            )
          }
        />
      )}
    </>
  )
}
