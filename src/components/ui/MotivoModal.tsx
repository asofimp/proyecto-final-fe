import type { ReactNode } from 'react'
import type { ApiError } from '../../types/api.types'
import { leerFormulario } from '../../utils/formularios'
import { Field, Textarea } from './Form'
import { FormModal } from './Modal'

interface MotivoModalProps {
  titulo: string
  onConfirmar: (motivo: string) => void
  onClose: () => void
  pendiente?: boolean
  error?: ApiError | null
  descripcion?: ReactNode
  etiqueta?: string
  textoConfirmar?: string
  // false: el motivo es opcional
  requerido?: boolean
}

// Pide un motivo antes de una acción irreversible (cancelar, rechazar, anular...)
export function MotivoModal({
  titulo,
  onConfirmar,
  onClose,
  pendiente,
  error,
  descripcion,
  etiqueta = 'Motivo',
  textoConfirmar = 'Confirmar',
  requerido = true,
}: MotivoModalProps) {
  return (
    <FormModal
      titulo={titulo}
      onClose={onClose}
      onSubmit={(e) => onConfirmar(leerFormulario(e).motivo.trim())}
      pendiente={pendiente}
      error={error}
      textoEnviar={textoConfirmar}
      variante="peligro"
    >
      {descripcion && <div className="text-sm text-gray-600">{descripcion}</div>}
      <Field etiqueta={etiqueta} requerido={requerido}>
        <Textarea name="motivo" required={requerido} maxLength={1000} autoFocus />
      </Field>
    </FormModal>
  )
}
