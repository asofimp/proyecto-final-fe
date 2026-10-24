import { useQueryClient, type QueryKey } from '@tanstack/react-query'

/**
 * Claves de React Query. Los recursos de una orden (historial, diagnósticos,
 * reparaciones, solicitudes, facturas) cuelgan de ['ordenes', ...] para que al
 * invalidar las órdenes se refresque todo lo relacionado.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  usuarios: {
    all: ['usuarios'] as const,
    list: (filtro?: object) => ['usuarios', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['usuarios', 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: ['roles', 'list'] as const,
    detail: (id: number) => ['roles', 'detail', id] as const,
    permisos: ['roles', 'permisos'] as const,
  },
  parametros: {
    all: ['parametros'] as const,
    list: (categoria?: string) => ['parametros', 'list', categoria ?? null] as const,
    detail: (clave: string) => ['parametros', 'detail', clave] as const,
  },
  auditoria: {
    all: ['auditoria'] as const,
    list: (filtro?: object) => ['auditoria', 'list', filtro ?? {}] as const,
  },
  clientes: {
    all: ['clientes'] as const,
    list: (filtro?: object) => ['clientes', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['clientes', 'detail', id] as const,
    vehiculos: (id: number) => ['clientes', 'detail', id, 'vehiculos'] as const,
  },
  vehiculos: {
    all: ['vehiculos'] as const,
    list: (filtro?: object) => ['vehiculos', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['vehiculos', 'detail', id] as const,
    placa: (placa: string) => ['vehiculos', 'placa', placa] as const,
  },
  ordenes: {
    all: ['ordenes'] as const,
    list: (filtro?: object) => ['ordenes', 'list', filtro ?? {}] as const,
    asignadas: (filtro?: object) => ['ordenes', 'asignadas', filtro ?? {}] as const,
    mecanicos: ['ordenes', 'mecanicos'] as const,
    detail: (id: number) => ['ordenes', 'detail', id] as const,
    historial: (id: number) => ['ordenes', 'detail', id, 'historial'] as const,
    diagnosticos: (id: number) => ['ordenes', 'detail', id, 'diagnosticos'] as const,
    reparaciones: (id: number) => ['ordenes', 'detail', id, 'reparaciones'] as const,
    solicitudes: (id: number) => ['ordenes', 'detail', id, 'solicitudes'] as const,
    facturas: (id: number) => ['ordenes', 'detail', id, 'facturas'] as const,
    vistaPreviaFactura: (id: number, datos: object) =>
      ['ordenes', 'detail', id, 'facturas', 'vista-previa', datos] as const,
  },
  diagnosticos: {
    all: ['diagnosticos'] as const,
    detail: (id: number) => ['diagnosticos', 'detail', id] as const,
  },
  reparaciones: {
    all: ['reparaciones'] as const,
    detail: (id: number) => ['reparaciones', 'detail', id] as const,
  },
  repuestos: {
    all: ['repuestos'] as const,
    list: (filtro?: object) => ['repuestos', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['repuestos', 'detail', id] as const,
    disponibilidad: (id: number, cantidad: number) =>
      ['repuestos', 'detail', id, 'disponibilidad', cantidad] as const,
    movimientos: (id: number, filtro?: object) =>
      ['repuestos', 'detail', id, 'movimientos', filtro ?? {}] as const,
  },
  movimientos: {
    all: ['movimientos'] as const,
    list: (filtro?: object) => ['movimientos', 'list', filtro ?? {}] as const,
  },
  solicitudes: {
    all: ['solicitudes'] as const,
    list: (filtro?: object) => ['solicitudes', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['solicitudes', 'detail', id] as const,
  },
  facturas: {
    all: ['facturas'] as const,
    list: (filtro?: object) => ['facturas', 'list', filtro ?? {}] as const,
    detail: (id: number) => ['facturas', 'detail', id] as const,
  },
}

// Devuelve una función que invalida varias claves a la vez (para onSuccess de mutaciones)
export function useInvalidar() {
  const queryClient = useQueryClient()
  return (...keys: QueryKey[]) =>
    Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}
