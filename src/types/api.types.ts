export interface ApiError {
  status: number
  message: string
  data?: unknown
}

// Fechas: el backend las serializa como texto ISO 8601
export type FechaISO = string

// Respuesta paginada del backend
export interface Paginado<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface PaginacionParams {
  page?: number
  limit?: number
}

export interface CambiarEstadoDto {
  activo: boolean
}

// Datos mínimos de un usuario cuando viene como relación parcial
export interface UsuarioResumen {
  id: number
  nombre: string
  username?: string
}
