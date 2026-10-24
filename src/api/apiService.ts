import type { AxiosRequestConfig } from 'axios'
import { httpClient } from './httpClient'

/**
 * Métodos genéricos reutilizables para consumir cualquier endpoint.
 * Devuelven directamente el body de la respuesta tipado como T.
 */
export const apiService = {
  get<T>(url: string, params?: object, config?: AxiosRequestConfig) {
    return httpClient.get<T>(url, { ...config, params }).then((res) => res.data)
  },

  post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return httpClient.post<T>(url, body, config).then((res) => res.data)
  },

  put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return httpClient.put<T>(url, body, config).then((res) => res.data)
  },

  patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return httpClient.patch<T>(url, body, config).then((res) => res.data)
  },

  delete<T = void>(url: string, config?: AxiosRequestConfig) {
    return httpClient.delete<T>(url, config).then((res) => res.data)
  },
}
