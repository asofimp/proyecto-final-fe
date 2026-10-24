import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { LoginDto, LoginResponse, UsuarioAutenticado } from '../types/auth.types'

export const authService = {
  login: (data: LoginDto) =>
    apiService.post<LoginResponse, LoginDto>(ENDPOINTS.auth.login, data),
  me: () => apiService.get<UsuarioAutenticado>(ENDPOINTS.auth.me),
}
