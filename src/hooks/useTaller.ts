import { useMutation, useQuery } from '@tanstack/react-query'
import { diagnosticosService, reparacionesService } from '../services/tallerService'
import type {
  ActualizarDiagnosticoDto,
  ActualizarReparacionDto,
  CompletarReparacionDto,
  CrearDiagnosticoDto,
  CrearReparacionDto,
} from '../types/taller.types'
import { queryKeys, useInvalidar } from './queryKeys'

// Diagnósticos y reparaciones cambian el estado y el historial de la orden,
// por eso las mutaciones invalidan también las órdenes

// ---- Diagnósticos ----

export function useDiagnosticosOrden(ordenId?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.diagnosticos(ordenId ?? 0),
    queryFn: () => diagnosticosService.getByOrden(ordenId!),
    enabled: !!ordenId,
  })
}

export function useDiagnostico(id?: number) {
  return useQuery({
    queryKey: queryKeys.diagnosticos.detail(id ?? 0),
    queryFn: () => diagnosticosService.getById(id!),
    enabled: !!id,
  })
}

export function useCrearDiagnostico() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ ordenId, data }: { ordenId: number; data: CrearDiagnosticoDto }) =>
      diagnosticosService.create(ordenId, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all, queryKeys.diagnosticos.all),
  })
}

export function useActualizarDiagnostico() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarDiagnosticoDto }) =>
      diagnosticosService.update(id, data),
    onSuccess: () => invalidar(queryKeys.ordenes.all, queryKeys.diagnosticos.all),
  })
}

export function useEliminarDiagnostico() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: number) => diagnosticosService.remove(id),
    onSuccess: () => invalidar(queryKeys.ordenes.all, queryKeys.diagnosticos.all),
  })
}

// ---- Reparaciones ----

// Incluye resumen de horas y costo de mano de obra
export function useReparacionesOrden(ordenId?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.reparaciones(ordenId ?? 0),
    queryFn: () => reparacionesService.getByOrden(ordenId!),
    enabled: !!ordenId,
  })
}

export function useReparacion(id?: number) {
  return useQuery({
    queryKey: queryKeys.reparaciones.detail(id ?? 0),
    queryFn: () => reparacionesService.getById(id!),
    enabled: !!id,
  })
}

function useInvalidarReparaciones() {
  const invalidar = useInvalidar()
  return () =>
    invalidar(queryKeys.ordenes.all, queryKeys.reparaciones.all, queryKeys.diagnosticos.all)
}

export function useCrearReparacion() {
  const invalidar = useInvalidarReparaciones()
  return useMutation({
    mutationFn: ({ diagnosticoId, data }: { diagnosticoId: number; data: CrearReparacionDto }) =>
      reparacionesService.create(diagnosticoId, data),
    onSuccess: () => invalidar(),
  })
}

export function useActualizarReparacion() {
  const invalidar = useInvalidarReparaciones()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarReparacionDto }) =>
      reparacionesService.update(id, data),
    onSuccess: () => invalidar(),
  })
}

export function useIniciarReparacion() {
  const invalidar = useInvalidarReparaciones()
  return useMutation({
    mutationFn: (id: number) => reparacionesService.iniciar(id),
    onSuccess: () => invalidar(),
  })
}

export function useCompletarReparacion() {
  const invalidar = useInvalidarReparaciones()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompletarReparacionDto }) =>
      reparacionesService.completar(id, data),
    onSuccess: () => invalidar(),
  })
}

export function useCancelarReparacion() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      reparacionesService.cancelar(id, motivo),
    // Cancela sus solicitudes pendientes y libera el stock reservado
    onSuccess: () =>
      invalidar(
        queryKeys.ordenes.all,
        queryKeys.reparaciones.all,
        queryKeys.diagnosticos.all,
        queryKeys.solicitudes.all,
        queryKeys.repuestos.all,
      ),
  })
}
