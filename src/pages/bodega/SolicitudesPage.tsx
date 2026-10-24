import { useState } from 'react'
import { EstadoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, FiltroSelect } from '../../components/ui/Filtros'
import { Field, Input, Textarea } from '../../components/ui/Form'
import { FormModal } from '../../components/ui/Modal'
import { MotivoModal } from '../../components/ui/MotivoModal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import {
  useDespacharSolicitud,
  useDevolverSolicitud,
  useRechazarSolicitud,
  useSolicitudes,
} from '../../hooks/useBodega'
import { toast } from '../../store/toastStore'
import type { SolicitudRepuesto } from '../../types/bodega.types'
import { EstadoSolicitud } from '../../types/enums'
import { ESTADO_SOLICITUD, opciones } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

type Dialogo =
  | { tipo: 'despachar' | 'rechazar' | 'devolver'; solicitud: SolicitudRepuesto }
  | null

export default function SolicitudesPage() {
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState<string>(EstadoSolicitud.PENDIENTE)
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { data, isLoading, error } = useSolicitudes({
    page,
    estado: estado ? [estado as EstadoSolicitud] : undefined,
  })
  const despachar = useDespacharSolicitud()
  const rechazar = useRechazarSolicitud()
  const devolver = useDevolverSolicitud()
  const cerrar = () => setDialogo(null)

  return (
    <>
      <PageHeader titulo="Solicitudes de repuestos" descripcion="Cola de bodega: despacho, rechazo y devoluciones" />
      <Card sinRelleno>
        <BarraFiltros>
          <FiltroSelect
            etiqueta="Estado"
            valor={estado}
            opciones={opciones(ESTADO_SOLICITUD)}
            onCambiar={(v) => {
              setEstado(v)
              setPage(1)
            }}
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data?.data ?? []}
            clave={(s) => s.id}
            vacio="No hay solicitudes"
            columnas={[
              {
                titulo: 'Solicitud',
                className: 'whitespace-nowrap',
                celda: (s) => (
                  <>
                    <span className="font-medium text-gray-900">#{s.id}</span>
                    <span className="block text-xs text-gray-500">{formatFechaHora(s.creadoEn)}</span>
                  </>
                ),
              },
              {
                titulo: 'Orden',
                celda: (s) => (
                  <>
                    {s.orden?.numero}
                    <span className="block line-clamp-2 text-xs text-gray-500">{s.reparacion?.descripcion}</span>
                  </>
                ),
              },
              {
                titulo: 'Repuesto',
                celda: (s) => (
                  <>
                    <span className="font-medium text-gray-900">{s.repuesto?.nombre}</span>
                    <span className="block text-xs text-gray-500">
                      {s.repuesto?.codigo}
                      {s.repuesto?.ubicacion && ` · ${s.repuesto.ubicacion}`}
                    </span>
                  </>
                ),
              },
              {
                titulo: 'Cantidad',
                className: 'text-right',
                celda: (s) => (
                  <>
                    <span className="font-medium">{s.cantidad}</span>
                    {s.cantidadDevuelta > 0 && (
                      <span className="block text-xs text-gray-500">−{s.cantidadDevuelta} devuelto</span>
                    )}
                    {s.estado === EstadoSolicitud.PENDIENTE && s.repuesto && (
                      <span className="block text-xs text-gray-500">En bodega: {s.repuesto.stockActual}</span>
                    )}
                  </>
                ),
              },
              {
                titulo: 'Precio',
                className: 'text-right',
                celda: (s) => formatMoneda(s.precioUnitario ?? s.repuesto?.precioVenta),
              },
              { titulo: 'Solicitado por', celda: (s) => s.solicitadoPor?.nombre },
              {
                titulo: 'Estado',
                celda: (s) => (
                  <>
                    <EstadoBadge valor={s.estado} mapa={ESTADO_SOLICITUD} />
                    {s.observaciones && <span className="mt-1 block text-xs text-gray-500">{s.observaciones}</span>}
                    {s.motivo && <span className="mt-1 block text-xs text-red-600">{s.motivo}</span>}
                  </>
                ),
              },
              {
                titulo: '',
                className: 'text-right',
                celda: (s) => (
                  <div className="flex justify-end gap-1">
                    {s.estado === EstadoSolicitud.PENDIENTE && (
                      <>
                        <Button tamano="sm" onClick={() => setDialogo({ tipo: 'despachar', solicitud: s })}>
                          Despachar
                        </Button>
                        <Button
                          tamano="sm"
                          variante="secundario"
                          onClick={() => setDialogo({ tipo: 'rechazar', solicitud: s })}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                    {s.estado === EstadoSolicitud.DESPACHADA && s.cantidad > s.cantidadDevuelta && (
                      <Button
                        tamano="sm"
                        variante="secundario"
                        onClick={() => setDialogo({ tipo: 'devolver', solicitud: s })}
                      >
                        Devolución
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {dialogo?.tipo === 'despachar' && (
        <FormModal
          titulo={`Despachar solicitud #${dialogo.solicitud.id}`}
          onClose={cerrar}
          pendiente={despachar.isPending}
          error={despachar.error}
          textoEnviar="Despachar"
          onSubmit={(e) => {
            const f = leerFormulario(e)
            despachar.mutate(
              { id: dialogo.solicitud.id, data: { observaciones: opcional(f.observaciones) } },
              {
                onSuccess: () => {
                  toast.exito('Repuesto despachado')
                  cerrar()
                },
              },
            )
          }}
        >
          <p className="text-sm text-gray-600">
            Se entregarán <strong>{dialogo.solicitud.cantidad}</strong> × {dialogo.solicitud.repuesto?.nombre} para la orden{' '}
            {dialogo.solicitud.orden?.numero}. El stock se descuenta y se fija el precio de venta actual.
          </p>
          <Field etiqueta="Observaciones">
            <Textarea name="observaciones" maxLength={1000} rows={2} />
          </Field>
        </FormModal>
      )}
      {dialogo?.tipo === 'rechazar' && (
        <MotivoModal
          titulo={`Rechazar solicitud #${dialogo.solicitud.id}`}
          descripcion="Se libera la cantidad reservada."
          textoConfirmar="Rechazar"
          pendiente={rechazar.isPending}
          error={rechazar.error}
          onClose={cerrar}
          onConfirmar={(motivo) =>
            rechazar.mutate(
              { id: dialogo.solicitud.id, motivo },
              {
                onSuccess: () => {
                  toast.exito('Solicitud rechazada')
                  cerrar()
                },
              },
            )
          }
        />
      )}
      {dialogo?.tipo === 'devolver' && (
        <FormModal
          titulo={`Devolución de la solicitud #${dialogo.solicitud.id}`}
          onClose={cerrar}
          pendiente={devolver.isPending}
          error={devolver.error}
          textoEnviar="Registrar devolución"
          onSubmit={(e) => {
            const f = leerFormulario(e)
            devolver.mutate(
              { id: dialogo.solicitud.id, data: { cantidad: Number(f.cantidad), motivo: opcional(f.motivo) } },
              {
                onSuccess: () => {
                  toast.exito('Devolución registrada')
                  cerrar()
                },
              },
            )
          }}
        >
          <Field
            etiqueta="Cantidad devuelta"
            requerido
            ayuda={`Máximo ${dialogo.solicitud.cantidad - dialogo.solicitud.cantidadDevuelta}`}
          >
            <Input
              type="number"
              name="cantidad"
              required
              min={1}
              max={dialogo.solicitud.cantidad - dialogo.solicitud.cantidadDevuelta}
              autoFocus
            />
          </Field>
          <Field etiqueta="Motivo">
            <Textarea name="motivo" maxLength={1000} rows={2} />
          </Field>
        </FormModal>
      )}
    </>
  )
}
