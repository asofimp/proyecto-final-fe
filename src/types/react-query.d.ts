import '@tanstack/react-query'
import type { ApiError } from './api.types'

// httpClient rechaza siempre con ApiError: así lo tipan error de useQuery/useMutation
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
