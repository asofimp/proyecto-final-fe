import { useState } from 'react'
import { useCrearSolicitud, useDisponibilidadRepuesto, useRepuestos } from '../../hooks/useBodega'
import { toast } from '../../store/toastStore'
import type { Repuesto } from '../../types/bodega.types'
import type { Reparacion } from '../../types/taller.types'
import { formatMoneda } from '../../utils/format'
import { opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Button } from '../ui/Button'
import { Aviso } from '../ui/Feedback'
import { Busqueda } from '../ui/Filtros'
import { Field, Input, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'

interface SolicitarRepuestoModalProps {
  reparacion: Reparacion
  onClose: () => void
}

// El mecánico busca el repuesto, ve la existencia disponible en tiempo real y lo solicita a bodega
export function SolicitarRepuestoModal({ reparacion, onClose }: SolicitarRepuestoModalProps) {
  const [buscar, setBuscar] = useState('')
  const [repuesto, setRepuesto] = useState<Repuesto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const resultados = useRepuestos(buscar ? { buscar, activo: true, limit: 8 } : undefined)
  const disponibilidad = useDisponibilidadRepuesto(repuesto?.id, cantidad)
  const crear = useCrearSolicitud()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    if (!repuesto) return
    crear.mutate(
      {
        reparacionId: reparacion.id,
        data: { repuestoId: repuesto.id, cantidad, observaciones: opcional(f.observaciones) },
      },
      {
        onSuccess: () => {
          toast.exito('Solicitud enviada a bodega')
          onClose()
        },
      },
    )
  }

  const disp = disponibilidad.data

  return (
    <FormModal
      titulo="Solicitar repuesto"
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={crear.isPending}
      error={crear.error}
      textoEnviar="Solicitar"
      ancho="lg"
    >
      <p className="text-sm text-gray-600">
        Para la reparación: <span className="font-medium text-gray-900">{reparacion.descripcion}</span>
      </p>

      {repuesto ? (
        <div className="flex items-center justify-between rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm">
          <span>
            <span className="font-medium text-indigo-900">{repuesto.nombre}</span>{' '}
            <span className="text-indigo-700">({repuesto.codigo})</span>
          </span>
          <Button variante="fantasma" tamano="sm" onClick={() => setRepuesto(null)}>
            Cambiar
          </Button>
        </div>
      ) : (
        <Field etiqueta="Repuesto" requerido>
          <div className="flex flex-col gap-2">
            <Busqueda placeholder="Código, nombre o marca" onBuscar={setBuscar} />
            {buscar && (
              <ul className="max-h-60 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200">
                {resultados.isFetching && <li className="px-3 py-2 text-sm text-gray-500">Buscando…</li>}
                {!resultados.isFetching && resultados.data?.data.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">Sin coincidencias</li>
                )}
                {resultados.data?.data.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setRepuesto(r)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span>
                        <span className="font-medium text-gray-900">{r.nombre}</span>
                        <span className="block text-xs text-gray-500">
                          {r.codigo} {r.marca && `· ${r.marca}`}
                        </span>
                      </span>
                      <span className={r.stockDisponible > 0 ? 'text-green-700' : 'text-red-600'}>
                        {r.stockDisponible} disp.
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
      )}

      <Field etiqueta="Cantidad" requerido>
        <Input
          type="number"
          min={1}
          max={1000}
          required
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
        />
      </Field>

      {disp && (
        <Aviso tono={disp.disponible ? 'info' : 'alerta'}>
          Disponible: <strong>{disp.stockDisponible}</strong> (en bodega {disp.stockActual}, reservado{' '}
          {disp.stockReservado}) · Precio {formatMoneda(disp.precioVenta)}
          {!disp.disponible && <> · Faltan {disp.faltante} unidad(es); la solicitud será rechazada</>}
        </Aviso>
      )}

      <Field etiqueta="Observaciones">
        <Textarea name="observaciones" maxLength={1000} rows={2} />
      </Field>
    </FormModal>
  )
}
