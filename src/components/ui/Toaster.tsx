import { useToastStore } from '../../store/toastStore'

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const cerrar = useToastStore((state) => state.cerrar)

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${
            t.tipo === 'exito' ? 'bg-gray-900' : 'bg-red-600'
          }`}
        >
          <span>{t.mensaje}</span>
          <button type="button" onClick={() => cerrar(t.id)} className="opacity-70 hover:opacity-100" aria-label="Cerrar">
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
