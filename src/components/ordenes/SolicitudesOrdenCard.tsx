import { useCancelarSolicitud, useSolicitudesOrden } from '../../hooks/useBodega'
import { toast } from '../../store/toastStore'
import { EstadoSolicitud } from '../../types/enums'
import { ESTADO_SOLICITUD } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { QueryState } from '../ui/Feedback'
import { Tabla } from '../ui/Table'

interface SolicitudesOrdenCardProps {
  ordenId: number
  // El mecánico puede cancelar sus solicitudes pendientes
  puedeCancelar?: boolean
}

export function SolicitudesOrdenCard({ ordenId, puedeCancelar }: SolicitudesOrdenCardProps) {
  const { data, isLoading, error } = useSolicitudesOrden(ordenId)
  const cancelar = useCancelarSolicitud()
  const resumen = data?.resumen

  return (
    <Card
      titulo="Repuestos solicitados"
      sinRelleno
      acciones={
        resumen && (
          <span className="text-sm text-gray-600">
            {resumen.pendientes} pendiente(s) · Costo despachado:{' '}
            <strong className="text-gray-900">{formatMoneda(resumen.costoRepuestos)}</strong>
          </span>
        )
      }
    >
      <QueryState cargando={isLoading} error={error}>
        <Tabla
          filas={data?.solicitudes ?? []}
          clave={(s) => s.id}
          vacio="No se han solicitado repuestos"
          columnas={[
            {
              titulo: 'Repuesto',
              celda: (s) => (
                <>
                  <span className="font-medium text-gray-900">{s.repuesto?.nombre}</span>
                  <span className="block text-xs text-gray-500">{s.repuesto?.codigo}</span>
                </>
              ),
            },
            { titulo: 'Reparación', celda: (s) => <span className="line-clamp-2">{s.reparacion?.descripcion}</span> },
            {
              titulo: 'Cantidad',
              className: 'text-right',
              celda: (s) => (
                <>
                  {s.cantidad}
                  {s.cantidadDevuelta > 0 && (
                    <span className="block text-xs text-gray-500">−{s.cantidadDevuelta} devuelto</span>
                  )}
                </>
              ),
            },
            { titulo: 'Precio', celda: (s) => formatMoneda(s.precioUnitario), className: 'text-right' },
            {
              titulo: 'Estado',
              celda: (s) => (
                <>
                  <EstadoBadge valor={s.estado} mapa={ESTADO_SOLICITUD} />
                  {s.motivo && <span className="mt-1 block text-xs text-gray-500">{s.motivo}</span>}
                </>
              ),
            },
            { titulo: 'Solicitada', celda: (s) => formatFechaHora(s.creadoEn), className: 'whitespace-nowrap' },
            {
              titulo: '',
              celda: (s) =>
                puedeCancelar &&
                s.estado === EstadoSolicitud.PENDIENTE && (
                  <Button
                    variante="secundario"
                    tamano="sm"
                    cargando={cancelar.isPending && cancelar.variables === s.id}
                    onClick={() =>
                      cancelar.mutate(s.id, {
                        onSuccess: () => toast.exito('Solicitud cancelada'),
                        onError: (e) => toast.error(e.message),
                      })
                    }
                  >
                    Cancelar
                  </Button>
                ),
            },
          ]}
        />
      </QueryState>
    </Card>
  )
}
