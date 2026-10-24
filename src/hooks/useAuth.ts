import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import type { LoginDto } from '../types/auth.types'
import { queryKeys } from './queryKeys'

export function useLogin() {
  const setSesion = useAuthStore((state) => state.setSesion)
  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: ({ accessToken, usuario }) => setSesion(accessToken, usuario),
  })
}

// Refresca los datos (rol y permisos) del usuario autenticado
export function useMe() {
  const token = useAuthStore((state) => state.token)
  const setUsuario = useAuthStore((state) => state.setUsuario)
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const usuario = await authService.me()
      setUsuario(usuario)
      return usuario
    },
    enabled: !!token,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  return () => {
    logout()
    queryClient.clear()
  }
}
