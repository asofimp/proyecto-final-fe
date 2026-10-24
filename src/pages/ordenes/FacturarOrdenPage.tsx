import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { LineasFactura } from '../../components/facturas/LineasFactura'
import { Button } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { Aviso, ErrorAlert, QueryState } from '../../components/ui/Feedback'
import { Field, FormGrid, Input, Textarea } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { useEmitirFactura, useVistaPreviaFactura } from '../../hooks/useFacturas'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import type { CargoAdicionalDto, EmitirFacturaDto } from '../../types/facturas.types'
import { opcional } from '../../utils/format'

interface CargoForm {
  id: number
  descripcion: string
  cantidad: string
  precioUnitario: string
}

let siguienteCargo = 1

export default function FacturarOrdenPage() {
  const ordenId = Number(useParams().id)
  const navigate = useNavigate()
  const [nit, setNit] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [descuento, setDescuento] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [cargos, setCargos] = useState<CargoForm[]>([])
  // Datos con los que se calculó la vista previa; se actualizan al pulsar "Recalcular"
  const [aplicado, setAplicado] = useState<EmitirFacturaDto>({})
  const vista = useVistaPreviaFactura(ordenId, aplicado)
  const emitir = useEmitirFactura()

  const construir = (): EmitirFacturaDto => {
    const cargosValidos: CargoAdicionalDto[] = cargos
      .filter((c) => c.descripcion.trim() && Number(c.cantidad) > 0)
      .map((c) => ({
        descripcion: c.descripcion.trim(),
        cantidad: Number(c.cantidad),
        precioUnitario: Number(c.precioUnitario) || 0,
      }))
    return {
      nit: opcional(nit),
      nombre: opcional(nombre),
      direccion: opcional(direccion),
      descuento: descuento ? Number(descuento) : undefined,
      cargosAdicionales: cargosValidos.length ? cargosValidos : undefined,
      observaciones: opcional(observaciones),
    }
  }

  const editarCargo = (id: number, campo: keyof Omit<CargoForm, 'id'>, valor: string) =>
    setCargos(cargos.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))

  const preview = vista.data
  const desactualizada = JSON.stringify(construir()) !== JSON.stringify(aplicado)

  return (
    <>
      <PageHeader
        titulo="Facturar orden"
        descripcion={preview ? `Orden ${preview.orden.numero}` : undefined}
        acciones={
          <Button variante="secundario" onClick={() => navigate(RUTAS.ordenes.detalle(ordenId))}>
            Volver a la orden
          </Button>
        }
      />

      {preview?.facturaVigente && (
        <div className="mb-6">
          <Aviso tono="alerta">
            La orden ya tiene la factura vigente{' '}
            <Link className="font-medium underline" to={RUTAS.facturas.detalle(preview.facturaVigente.id)}>
              {preview.facturaVigente.numeroFactura}
            </Link>
            . Debe anularse antes de emitir otra.
          </Aviso>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <form
          className="flex flex-col gap-6 xl:col-span-2"
          onSubmit={(e) => {
            e.preventDefault()
            setAplicado(construir())
          }}
        >
          <Card titulo="Receptor">
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500">Deje los campos vacíos para usar los datos del cliente de la orden.</p>
              <FormGrid>
                <Field etiqueta="NIT" ayuda='"CF" para consumidor final'>
                  <Input value={nit} onChange={(e) => setNit(e.target.value)} placeholder={preview?.receptor.nit} />
                </Field>
                <Field etiqueta="Nombre">
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={preview?.receptor.nombre} maxLength={150} />
                </Field>
              </FormGrid>
              <Field etiqueta="Dirección">
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder={preview?.receptor.direccion ?? ''}
                  maxLength={255}
                />
              </Field>
            </div>
          </Card>

          <Card titulo="Ajustes">
            <div className="flex flex-col gap-4">
              <Field etiqueta="Descuento (Q)" ayuda="Se resta antes de calcular el IVA">
                <Input type="number" min={0} step={0.01} value={descuento} onChange={(e) => setDescuento(e.target.value)} />
              </Field>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-medium text-gray-700">Cargos adicionales</legend>
                {cargos.length === 0 && <p className="text-xs text-gray-500">Diagnóstico, grúa, lavado…</p>}
                {cargos.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Input
                      placeholder="Descripción"
                      value={c.descripcion}
                      maxLength={300}
                      onChange={(e) => editarCargo(c.id, 'descripcion', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Cant."
                      min={0.01}
                      step={0.01}
                      className="w-20"
                      value={c.cantidad}
                      onChange={(e) => editarCargo(c.id, 'cantidad', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Precio"
                      min={0}
                      step={0.01}
                      className="w-28"
                      value={c.precioUnitario}
                      onChange={(e) => editarCargo(c.id, 'precioUnitario', e.target.value)}
                    />
                    <Button variante="fantasma" aria-label="Quitar" onClick={() => setCargos(cargos.filter((x) => x.id !== c.id))}>
                      ✕
                    </Button>
                  </div>
                ))}
                <div>
                  <Button
                    variante="secundario"
                    tamano="sm"
                    onClick={() =>
                      setCargos([...cargos, { id: siguienteCargo++, descripcion: '', cantidad: '1', precioUnitario: '' }])
                    }
                  >
                    + Agregar cargo
                  </Button>
                </div>
              </fieldset>

              <Field etiqueta="Observaciones">
                <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} maxLength={1000} rows={2} />
              </Field>
              <div>
                <Button type="submit" variante="secundario" disabled={!desactualizada} cargando={vista.isFetching}>
                  Recalcular vista previa
                </Button>
              </div>
            </div>
          </Card>
        </form>

        <div className="flex flex-col gap-4 xl:col-span-3">
          <Card titulo="Vista previa" sinRelleno>
            <QueryState cargando={vista.isLoading} error={vista.error}>
              {preview && (
                <>
                  <div className="border-b border-gray-200 p-4">
                    <Datos columnas={3}>
                      <Dato etiqueta="NIT">{preview.receptor.nit}</Dato>
                      <Dato etiqueta="Nombre">{preview.receptor.nombre}</Dato>
                      <Dato etiqueta="Dirección">{preview.receptor.direccion}</Dato>
                    </Datos>
                  </div>
                  <LineasFactura lineas={preview.lineas} totales={preview} />
                </>
              )}
            </QueryState>
          </Card>

          {desactualizada && <Aviso tono="alerta">Hay cambios sin aplicar: recalcule la vista previa antes de emitir.</Aviso>}
          <ErrorAlert error={emitir.error} />
          <div className="flex justify-end">
            <Button
              disabled={!preview || desactualizada || !!preview.facturaVigente}
              cargando={emitir.isPending}
              onClick={() =>
                emitir.mutate(
                  { ordenId, data: aplicado },
                  {
                    onSuccess: (factura) => {
                      toast.exito(`Factura ${factura.numeroFactura} emitida`)
                      navigate(RUTAS.facturas.detalle(factura.id), { replace: true })
                    },
                  },
                )
              }
            >
              Emitir factura
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
