import { useActualizarOrden, useAsignarMecanico, useCambiarEstadoOrden, useMecanicos, useRegistrarSalida } from '../../hooks/useOrdenes'
import { toast } from '../../store/toastStore'
import type { EstadoTaller, NivelCombustible } from '../../types/enums'
import type { OrdenTrabajo } from '../../types/ordenes.types'
import { ESTADO_ORDEN, NIVEL_COMBUSTIBLE, opciones } from '../../utils/etiquetas'
import { hoyISO, numeroOpcional, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Field, FormGrid, Input, Select, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'

interface ModalOrdenProps {
  orden: OrdenTrabajo
  onClose: () => void
}

export function EditarOrdenModal({ orden, onClose }: ModalOrdenProps) {
  const actualizar = useActualizarOrden()
  return (
    <FormModal
      titulo={`Editar orden ${orden.numero}`}
      onClose={onClose}
      pendiente={actualizar.isPending}
      error={actualizar.error}
      ancho="lg"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        actualizar.mutate(
          {
            id: orden.id,
            data: {
              motivoIngreso: f.motivoIngreso.trim(),
              observacionesIngreso: opcional(f.observacionesIngreso),
              nivelCombustible: (opcional(f.nivelCombustible) as NivelCombustible | undefined),
              fechaEstimadaEntrega: opcional(f.fechaEstimadaEntrega),
            },
          },
          {
            onSuccess: () => {
              toast.exito('Orden actualizada')
              onClose()
            },
          },
        )
      }}
    >
      <Field etiqueta="Motivo de ingreso" requerido>
        <Textarea name="motivoIngreso" defaultValue={orden.motivoIngreso} required maxLength={2000} />
      </Field>
      <Field etiqueta="Observaciones de ingreso">
        <Textarea name="observacionesIngreso" defaultValue={orden.observacionesIngreso ?? ''} maxLength={2000} />
      </Field>
      <FormGrid>
        <Field etiqueta="Combustible">
          <Select
            name="nivelCombustible"
            defaultValue={orden.nivelCombustible ?? ''}
            opciones={opciones(NIVEL_COMBUSTIBLE)}
            vacio="—"
          />
        </Field>
        <Field etiqueta="Entrega estimada">
          <Input
            type="date"
            name="fechaEstimadaEntrega"
            defaultValue={orden.fechaEstimadaEntrega ?? ''}
            min={hoyISO()}
          />
        </Field>
      </FormGrid>
    </FormModal>
  )
}

export function AsignarMecanicoModal({ orden, onClose }: ModalOrdenProps) {
  const mecanicos = useMecanicos()
  const asignar = useAsignarMecanico()
  const lista = (mecanicos.data ?? []).filter((m) => m.id !== orden.mecanicoId)

  return (
    <FormModal
      titulo={orden.mecanicoId ? 'Reasignar mecánico' : 'Asignar mecánico'}
      onClose={onClose}
      pendiente={asignar.isPending}
      error={asignar.error ?? mecanicos.error}
      textoEnviar="Asignar"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        asignar.mutate(
          { id: orden.id, data: { mecanicoId: Number(f.mecanicoId), comentario: opcional(f.comentario) } },
          {
            onSuccess: () => {
              toast.exito('Mecánico asignado')
              onClose()
            },
          },
        )
      }}
    >
      {orden.mecanico && (
        <p className="text-sm text-gray-600">
          Asignado actualmente: <span className="font-medium text-gray-900">{orden.mecanico.nombre}</span>
        </p>
      )}
      <Field etiqueta="Mecánico" requerido ayuda="Ordenados por carga de trabajo (órdenes en proceso)">
        <Select
          name="mecanicoId"
          required
          disabled={mecanicos.isLoading}
          vacio={mecanicos.isLoading ? 'Cargando…' : 'Seleccione'}
          opciones={lista.map((m) => [m.id, `${m.nombre} — ${m.ordenesEnProceso} en proceso`])}
        />
      </Field>
      <Field etiqueta="Comentario">
        <Textarea name="comentario" maxLength={1000} rows={2} />
      </Field>
    </FormModal>
  )
}

export function SalidaModal({ orden, onClose }: ModalOrdenProps) {
  const salida = useRegistrarSalida()
  return (
    <FormModal
      titulo="Registrar salida del vehículo"
      onClose={onClose}
      pendiente={salida.isPending}
      error={salida.error}
      textoEnviar="Registrar salida"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        salida.mutate(
          {
            id: orden.id,
            data: { kilometrajeSalida: numeroOpcional(f.kilometrajeSalida), observaciones: opcional(f.observaciones) },
          },
          {
            onSuccess: () => {
              toast.exito('Salida registrada')
              onClose()
            },
          },
        )
      }}
    >
      <Field etiqueta="Kilometraje de salida" ayuda={`Ingreso: ${orden.kilometrajeIngreso ?? '—'}`}>
        <Input type="number" name="kilometrajeSalida" min={orden.kilometrajeIngreso ?? 0} />
      </Field>
      <Field etiqueta="Observaciones">
        <Textarea name="observaciones" maxLength={2000} />
      </Field>
    </FormModal>
  )
}

interface CambiarEstadoModalProps extends ModalOrdenProps {
  estado: EstadoTaller
}

export function CambiarEstadoModal({ orden, estado, onClose }: CambiarEstadoModalProps) {
  const cambiar = useCambiarEstadoOrden()
  return (
    <FormModal
      titulo={`Pasar a "${ESTADO_ORDEN[estado].texto}"`}
      onClose={onClose}
      pendiente={cambiar.isPending}
      error={cambiar.error}
      textoEnviar="Confirmar"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        cambiar.mutate(
          { id: orden.id, data: { estado, comentario: opcional(f.comentario) } },
          {
            onSuccess: () => {
              toast.exito(`Orden en estado ${ESTADO_ORDEN[estado].texto}`)
              onClose()
            },
          },
        )
      }}
    >
      <p className="text-sm text-gray-600">
        La orden {orden.numero} pasará de <strong>{ESTADO_ORDEN[orden.estado].texto}</strong> a{' '}
        <strong>{ESTADO_ORDEN[estado].texto}</strong>.
      </p>
      <Field etiqueta="Comentario">
        <Textarea name="comentario" maxLength={1000} rows={2} autoFocus />
      </Field>
    </FormModal>
  )
}
