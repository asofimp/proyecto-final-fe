import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Can } from '../../components/Can'
import { LineasFactura } from '../../components/facturas/LineasFactura'
import { EstadoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { Aviso, QueryState } from '../../components/ui/Feedback'
import { Field, Input, Select } from '../../components/ui/Form'
import { FormModal } from '../../components/ui/Modal'
import { MotivoModal } from '../../components/ui/MotivoModal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAnularFactura, useFactura, useRegistrarPago } from '../../hooks/useFacturas'
import { usePermisos } from '../../hooks/usePermisos'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import { EstadoFactura, PERMISOS, type MetodoPago } from '../../types/enums'
import { ESTADO_FACTURA, METODO_PAGO, opciones } from '../../utils/etiquetas'
import { formatFechaHora, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

type Dialogo = 'pago' | 'anular' | null

export default function FacturaDetallePage() {
  const id = Number(useParams().id)
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { puede } = usePermisos()
  const { data: factura, isLoading, error } = useFactura(id)
  const pagar = useRegistrarPago()
  const anular = useAnularFactura()
  const cerrar = () => setDialogo(null)

  if (!factura) return <QueryState cargando={isLoading} error={error}>{null}</QueryState>

  const vigente = factura.estado !== EstadoFactura.ANULADA

  return (
    <>
      <PageHeader
        titulo={`Factura ${factura.numeroFactura}`}
        descripcion={`Emitida ${formatFechaHora(factura.fechaEmision)} por ${factura.emitidaPor?.nombre ?? '—'}`}
        acciones={
          <div className="flex gap-2 print:hidden">
            <Button variante="secundario" onClick={() => window.print()}>
              Imprimir
            </Button>
            {factura.estado === EstadoFactura.EMITIDA && (
              <Button onClick={() => setDialogo('pago')}>Registrar pago</Button>
            )}
            <Can permisos={[PERMISOS.FACTURAS_ANULAR]}>
              {vigente && (
                <Button variante="peligro" onClick={() => setDialogo('anular')}>
                  Anular
                </Button>
              )}
            </Can>
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        {factura.estado === EstadoFactura.ANULADA && (
          <Aviso tono="alerta">
            Anulada el {formatFechaHora(factura.fechaAnulacion)} por {factura.anuladaPor?.nombre ?? '—'}:{' '}
            {factura.motivoAnulacion}
          </Aviso>
        )}

        <Card titulo="Datos" acciones={<EstadoBadge valor={factura.estado} mapa={ESTADO_FACTURA} />}>
          <Datos columnas={3}>
            <Dato etiqueta="Receptor">{factura.nombreReceptor}</Dato>
            <Dato etiqueta="NIT">{factura.nitReceptor}</Dato>
            <Dato etiqueta="Dirección">{factura.direccionReceptor}</Dato>
            <Dato etiqueta="Orden">
              {factura.orden &&
                (puede(PERMISOS.ORDENES_VER) ? (
                  <Link to={RUTAS.ordenes.detalle(factura.ordenId)} className="text-indigo-600 hover:underline">
                    {factura.orden.numero}
                  </Link>
                ) : (
                  factura.orden.numero
                ))}
            </Dato>
            {factura.estado === EstadoFactura.PAGADA && (
              <>
                <Dato etiqueta="Pago">
                  {factura.metodoPago ? METODO_PAGO[factura.metodoPago] : '—'}
                  {factura.referenciaPago && ` · ${factura.referenciaPago}`}
                </Dato>
                <Dato etiqueta="Fecha de pago">{formatFechaHora(factura.fechaPago)}</Dato>
              </>
            )}
            {factura.observaciones && (
              <Dato etiqueta="Observaciones" ancho>
                {factura.observaciones}
              </Dato>
            )}
          </Datos>
        </Card>

        <Card titulo="Detalle" sinRelleno>
          <LineasFactura lineas={factura.detalles ?? []} totales={factura} />
        </Card>
      </div>

      {dialogo === 'pago' && (
        <FormModal
          titulo="Registrar pago"
          onClose={cerrar}
          pendiente={pagar.isPending}
          error={pagar.error}
          textoEnviar="Registrar pago"
          onSubmit={(e) => {
            const f = leerFormulario(e)
            pagar.mutate(
              { id, data: { metodoPago: f.metodoPago as MetodoPago, referenciaPago: opcional(f.referenciaPago) } },
              {
                onSuccess: () => {
                  toast.exito('Pago registrado')
                  cerrar()
                },
              },
            )
          }}
        >
          <Field etiqueta="Método de pago" requerido>
            <Select name="metodoPago" required opciones={opciones(METODO_PAGO)} />
          </Field>
          <Field etiqueta="Referencia" ayuda="Número de voucher, transferencia o cheque">
            <Input name="referenciaPago" maxLength={100} />
          </Field>
        </FormModal>
      )}
      {dialogo === 'anular' && (
        <MotivoModal
          titulo={`Anular factura ${factura.numeroFactura}`}
          descripcion="La factura no se borra: queda anulada y la orden podrá facturarse de nuevo."
          textoConfirmar="Anular factura"
          pendiente={anular.isPending}
          error={anular.error}
          onClose={cerrar}
          onConfirmar={(motivo) =>
            anular.mutate(
              { id, motivo },
              {
                onSuccess: () => {
                  toast.exito('Factura anulada')
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
