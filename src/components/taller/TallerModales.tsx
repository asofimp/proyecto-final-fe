import { useState } from 'react'
import {
  useActualizarDiagnostico,
  useActualizarReparacion,
  useCompletarReparacion,
  useCrearDiagnostico,
  useCrearReparacion,
} from '../../hooks/useTaller'
import { toast } from '../../store/toastStore'
import type { CrearReparacionDto, Diagnostico, Reparacion } from '../../types/taller.types'
import { SeveridadFalla } from '../../types/enums'
import { opciones, SEVERIDAD } from '../../utils/etiquetas'
import { numeroOpcional, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Button } from '../ui/Button'
import { Field, FormGrid, Input, Select, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'

interface DiagnosticoFormModalProps {
  ordenId: number
  // Si se indica se edita (las reparaciones se gestionan aparte)
  diagnostico?: Diagnostico
  onClose: () => void
}

export function DiagnosticoFormModal({ ordenId, diagnostico, onClose }: DiagnosticoFormModalProps) {
  // Identificadores de las filas de reparaciones a crear junto con el diagnóstico
  const [filas, setFilas] = useState<number[]>([1])
  const crear = useCrearDiagnostico()
  const actualizar = useActualizarDiagnostico()
  const mutacion = diagnostico ? actualizar : crear

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    const datos = {
      descripcion: f.descripcion.trim(),
      severidad: f.severidad as SeveridadFalla,
      observaciones: opcional(f.observaciones),
    }
    const alGuardar = () => {
      toast.exito(diagnostico ? 'Diagnóstico actualizado' : 'Diagnóstico registrado')
      onClose()
    }
    if (diagnostico) {
      actualizar.mutate({ id: diagnostico.id, data: datos }, { onSuccess: alGuardar })
      return
    }
    const reparaciones: CrearReparacionDto[] = filas
      .map((fila) => ({
        descripcion: f[`rep_desc_${fila}`]?.trim() ?? '',
        horasEstimadas: numeroOpcional(f[`rep_horas_${fila}`] ?? ''),
      }))
      .filter((r) => r.descripcion !== '')
    crear.mutate({ ordenId, data: { ...datos, reparaciones } }, { onSuccess: alGuardar })
  }

  return (
    <FormModal
      titulo={diagnostico ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      ancho="lg"
    >
      <Field etiqueta="Falla detectada" requerido>
        <Textarea name="descripcion" defaultValue={diagnostico?.descripcion} required maxLength={2000} autoFocus />
      </Field>
      <FormGrid>
        <Field etiqueta="Severidad" requerido>
          <Select
            name="severidad"
            defaultValue={diagnostico?.severidad ?? SeveridadFalla.MEDIA}
            opciones={opciones(SEVERIDAD)}
          />
        </Field>
      </FormGrid>
      <Field etiqueta="Observaciones">
        <Textarea name="observaciones" defaultValue={diagnostico?.observaciones ?? ''} maxLength={2000} rows={2} />
      </Field>

      {!diagnostico && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">Reparaciones requeridas (opcional)</legend>
          {filas.map((fila) => (
            <div key={fila} className="flex gap-2">
              <Input name={`rep_desc_${fila}`} placeholder="Descripción de la reparación" maxLength={500} />
              <Input
                type="number"
                name={`rep_horas_${fila}`}
                placeholder="Horas est."
                min={0.1}
                max={999}
                step={0.1}
                className="w-32"
              />
              {filas.length > 1 && (
                <Button variante="fantasma" onClick={() => setFilas(filas.filter((x) => x !== fila))} aria-label="Quitar">
                  ✕
                </Button>
              )}
            </div>
          ))}
          <div>
            <Button variante="secundario" tamano="sm" onClick={() => setFilas([...filas, Math.max(...filas) + 1])}>
              + Agregar reparación
            </Button>
          </div>
        </fieldset>
      )}
    </FormModal>
  )
}

interface ReparacionFormModalProps {
  // Diagnóstico al que se agrega (crear) o reparación a editar
  diagnosticoId?: number
  reparacion?: Reparacion
  onClose: () => void
}

export function ReparacionFormModal({ diagnosticoId, reparacion, onClose }: ReparacionFormModalProps) {
  const crear = useCrearReparacion()
  const actualizar = useActualizarReparacion()
  const mutacion = reparacion ? actualizar : crear

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    const datos = {
      descripcion: f.descripcion.trim(),
      horasEstimadas: numeroOpcional(f.horasEstimadas),
    }
    const alGuardar = () => {
      toast.exito(reparacion ? 'Reparación actualizada' : 'Reparación agregada')
      onClose()
    }
    if (reparacion) {
      actualizar.mutate(
        { id: reparacion.id, data: { ...datos, notas: opcional(f.notas) } },
        { onSuccess: alGuardar },
      )
    } else if (diagnosticoId) {
      crear.mutate({ diagnosticoId, data: datos }, { onSuccess: alGuardar })
    }
  }

  return (
    <FormModal
      titulo={reparacion ? 'Editar reparación' : 'Agregar reparación'}
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={mutacion.isPending}
      error={mutacion.error}
    >
      <Field etiqueta="Descripción" requerido>
        <Input name="descripcion" defaultValue={reparacion?.descripcion} required maxLength={500} autoFocus />
      </Field>
      <Field etiqueta="Horas estimadas">
        <Input
          type="number"
          name="horasEstimadas"
          defaultValue={reparacion?.horasEstimadas ?? ''}
          min={0.1}
          max={999}
          step={0.1}
        />
      </Field>
      {reparacion && (
        <Field etiqueta="Notas">
          <Textarea name="notas" defaultValue={reparacion.notas ?? ''} maxLength={2000} />
        </Field>
      )}
    </FormModal>
  )
}

export function CompletarReparacionModal({ reparacion, onClose }: { reparacion: Reparacion; onClose: () => void }) {
  const completar = useCompletarReparacion()

  return (
    <FormModal
      titulo="Completar reparación"
      onClose={onClose}
      pendiente={completar.isPending}
      error={completar.error}
      textoEnviar="Completar"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        completar.mutate(
          { id: reparacion.id, data: { horasReales: Number(f.horasReales), notas: opcional(f.notas) } },
          {
            onSuccess: () => {
              toast.exito('Reparación completada')
              onClose()
            },
          },
        )
      }}
    >
      <p className="text-sm text-gray-600">{reparacion.descripcion}</p>
      <Field etiqueta="Horas reales trabajadas" requerido ayuda="El costo se calcula con la tarifa por hora vigente">
        <Input
          type="number"
          name="horasReales"
          required
          min={0.1}
          max={999}
          step={0.01}
          defaultValue={reparacion.horasEstimadas ?? ''}
          autoFocus
        />
      </Field>
      <Field etiqueta="Notas">
        <Textarea name="notas" defaultValue={reparacion.notas ?? ''} maxLength={2000} />
      </Field>
    </FormModal>
  )
}
