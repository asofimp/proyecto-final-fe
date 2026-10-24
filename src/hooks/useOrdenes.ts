import { useMutation, useQuery } from '@tanstack/react-query'
import { ordenesService } from '../services/ordenesService'
import type {
  ActualizarOrdenDto,
  AsignarMecanicoDto,
  CambiarEstadoOrdenDto,
  CrearOrdenDto,
  FiltroOrdenes,
  RegistrarSalidaDto,
} from '../types/ordenes.types'
import { queryKeys, useInvalidar } from './queryKeys'

export function useOrdenes(filtro?: FiltroOrdenes) {
  return useQuery({
    queryKey: queryKeys.ordenes.list(filtro),
    queryFn: () => ordenesService.getAll(filtro),
  })
}

// Órdenes asignadas al mecánico autenticado
export function useOrdenesAsignadas(filtro?: FiltroOrdenes) {
  return useQuery({
    queryKey: queryKeys.ordenes.asignadas(filtro),
    queryFn: () => ordenesService.getAsignadas(filtro),
  })
}

// habilitado: false si el usuario no puede asignar mecánicos (el backend respondería 403)
export function useMecanicos(habilitado = true) {
  return useQuery({
    queryKey: queryKeys.ordenes.mecanicos,
    queryFn: ordenesService.getMecanicos,
    enabled: habilitado,
  })
}

export function useOrden(id?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.detail(id ?? 0),
    queryFn: () => ordenesService.getById(id!),
    enabled: !!id,
  })
}

export function useHistorialOrden(id?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.historial(id ?? 0),
    queryFn: () => ordenesService.getHistorial(id!),
    enabled: !!id,
  })
}

export function useCrearOrden() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearOrdenDto) => ordenesService.create(data),
    // El ingreso actualiza el kilometraje del vehículo
    onSuccess: () => invalidar(queryKeys.ordenes.all, queryKeys.vehiculos.all),
  })
}

export function useActualizarOrden() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarOrdenDto }) =>
      ordenesService.update(id, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all),
  })
}

export function useAsignarMecanico() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AsignarMecanicoDto }) =>
      ordenesService.asignarMecanico(id, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all),
  })
}

export function useCambiarEstadoOrden() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarEstadoOrdenDto }) =>
      ordenesService.cambiarEstado(id, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all),
  })
}

export function useCancelarOrden() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      ordenesService.cancelar(id, motivo),
    // Cancela reparaciones y solicitudes pendientes y libera el stock reservado
    onSuccess: () =>
      invalidar(queryKeys.ordenes.all, queryKeys.solicitudes.all, queryKeys.repuestos.all),
  })
}

export function useRegistrarSalida() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegistrarSalidaDto }) =>
      ordenesService.registrarSalida(id, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all, queryKeys.vehiculos.all),
  })
}
