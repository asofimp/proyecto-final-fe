import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import { useAuthStore } from '../store/authStore'
import type { ApiError } from '../types/api.types'

/**
 * Serializa los query params como los espera el backend:
 * omite vacíos y envía los arreglos separados por coma (?estado=LISTA,ENTREGADA).
 */
function serializarParams(params: Record<string, unknown>): string {
  const query = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === '') continue
    if (Array.isArray(valor)) {
      if (valor.length) query.append(clave, valor.join(','))
    } else {
      query.append(clave, String(valor))
    }
  }
  return query.toString()
}

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: { serialize: serializarParams },
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status ?? 0

    if (status === 401) {
      useAuthStore.getState().logout()
    }

    // Los errores de validación de NestJS devuelven message como arreglo
    const message = error.response?.data?.message
    const apiError: ApiError = {
      status,
      message: Array.isArray(message) ? message.join('. ') : (message ?? error.message),
      data: error.response?.data,
    }
    return Promise.reject(apiError)
  },
)
