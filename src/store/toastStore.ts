import { create } from 'zustand'

export type TipoToast = 'exito' | 'error'

interface Toast {
  id: number
  tipo: TipoToast
  mensaje: string
}

interface ToastState {
  toasts: Toast[]
  mostrar: (mensaje: string, tipo?: TipoToast) => void
  cerrar: (id: number) => void
}

let siguienteId = 1

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  mostrar: (mensaje, tipo = 'exito') => {
    const id = siguienteId++
    set({ toasts: [...get().toasts, { id, tipo, mensaje }] })
    setTimeout(() => get().cerrar(id), 4000)
  },
  cerrar: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

// Atajo para usar fuera de componentes o en callbacks
export const toast = {
  exito: (mensaje: string) => useToastStore.getState().mostrar(mensaje, 'exito'),
  error: (mensaje: string) => useToastStore.getState().mostrar(mensaje, 'error'),
}
