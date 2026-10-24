import { useEffect, type FormEvent, type ReactNode } from 'react'
import type { ApiError } from '../../types/api.types'
import { Button } from './Button'
import { ErrorAlert } from './Feedback'

const ANCHOS = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

interface ModalProps {
  titulo: string
  onClose: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: keyof typeof ANCHOS
}

export function Modal({ titulo, onClose, children, pie, ancho = 'md' }: ModalProps) {
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${ANCHOS[ancho]} rounded-lg bg-white text-left shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {pie && (
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">{pie}</div>
        )}
      </div>
    </div>
  )
}

interface FormModalProps extends Omit<ModalProps, 'pie'> {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  pendiente?: boolean
  error?: ApiError | null
  textoEnviar?: string
  variante?: 'primario' | 'peligro'
}

// Modal con formulario y botones Cancelar / Guardar
export function FormModal({
  titulo,
  onClose,
  onSubmit,
  children,
  pendiente,
  error,
  textoEnviar = 'Guardar',
  variante = 'primario',
  ancho,
}: FormModalProps) {
  return (
    <Modal titulo={titulo} onClose={onClose} ancho={ancho}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <ErrorAlert error={error} />
        <div className="-mx-5 -mb-4 flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <Button variante="secundario" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variante={variante} cargando={pendiente}>
            {textoEnviar}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface ConfirmModalProps {
  titulo: string
  mensaje: ReactNode
  onConfirmar: () => void
  onClose: () => void
  pendiente?: boolean
  error?: ApiError | null
  textoConfirmar?: string
}

export function ConfirmModal({
  titulo,
  mensaje,
  onConfirmar,
  onClose,
  pendiente,
  error,
  textoConfirmar = 'Confirmar',
}: ConfirmModalProps) {
  return (
    <FormModal
      titulo={titulo}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault()
        onConfirmar()
      }}
      pendiente={pendiente}
      error={error}
      textoEnviar={textoConfirmar}
      variante="peligro"
    >
      <div className="text-sm text-gray-600">{mensaje}</div>
    </FormModal>
  )
}
