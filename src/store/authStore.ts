import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsuarioAutenticado } from '../types/auth.types'

interface AuthState {
  token: string | null
  usuario: UsuarioAutenticado | null
  setToken: (token: string | null) => void
  setSesion: (token: string, usuario: UsuarioAutenticado) => void
  setUsuario: (usuario: UsuarioAutenticado | null) => void
  tienePermiso: (...codigos: string[]) => boolean
  tieneAlgunPermiso: (...codigos: string[]) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      setToken: (token) => set({ token }),
      setSesion: (token, usuario) => set({ token, usuario }),
      setUsuario: (usuario) => set({ usuario }),
      // true si el usuario tiene todos los permisos indicados
      tienePermiso: (...codigos) => {
        const permisos = get().usuario?.permisos ?? []
        return codigos.every((codigo) => permisos.includes(codigo))
      },
      // true si el usuario tiene al menos uno de los permisos indicados
      tieneAlgunPermiso: (...codigos) => {
        const permisos = get().usuario?.permisos ?? []
        return codigos.some((codigo) => permisos.includes(codigo))
      },
      logout: () => set({ token: null, usuario: null }),
    }),
    {
      name: 'auth',
      partialize: (state) => ({ token: state.token, usuario: state.usuario }),
    },
  ),
)
